# Negative Stock Analysis - Knoweb Inventory System
## Root Cause Analysis & Detailed Findings

**Date:** April 2, 2026  
**Symptom:** Negative stock showing (-5) in the UI  
**Affected System:** Knoweb_inventory microservices  
**Criticality:** HIGH - Data integrity and business logic violations  

---

## Executive Summary

Negative stock (-5) is occurring due to **multiple concurrent validation gaps** and **race conditions** in the inventory management system. The system lacks:
1. Database-level constraints to prevent negative quantities
2. Pessimistic locking on stock records during concurrent transactions
3. Validation checks before allowing stock deductions
4. Proper transaction isolation levels
5. Atomic operations for stock updates

---

## Issue #1: Missing Database Constraints

### Location
- **File:** Stock Entity (no constraints)
- **Database:** `inventory_db.stocks` table
- **Root Cause:** No CHECK constraint prevents negative values

### Evidence

**Stock Model** - [inventory-service/src/main/java/com/inventory/inventoryservice/model/Stock.java](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/model/Stock.java#L28-L32)
```java
@Column(nullable = false)
private Integer quantity = 0;

@Column(name = "available_quantity")
private Integer availableQuantity = 0;

@Column(name = "reserved_quantity")
private Integer reservedQuantity = 0;
```

**Problem:**
- No `@Min(0)` validation annotation
- No database CHECK constraint: `CHECK (quantity >= 0)`
- No database CHECK constraint: `CHECK (available_quantity >= 0)`
- Integer columns allow negative values at DB level

### Impact
- Once invalid data enters the system, it's stored in the database
- Reports and analytics show incorrect negative inventory
- UI displays negative stock (-5)
- No rollback mechanism at database layer

### Fix Required
```sql
-- Add CHECK constraints to stocks table
ALTER TABLE stocks
ADD CONSTRAINT chk_quantity_non_negative 
    CHECK (quantity >= 0),
ADD CONSTRAINT chk_available_quantity_non_negative 
    CHECK (available_quantity >= 0),
ADD CONSTRAINT chk_reserved_quantity_non_negative 
    CHECK (reserved_quantity >= 0);
```

---

## Issue #2: Missing Validation Before Stock Deduction

### Location
- **Primary Endpoint:** [inventory-service/src/main/java/com/inventory/inventoryservice/controller/InventoryController.java](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/controller/InventoryController.java#L46-L50)
- **Service Method:** [InventoryService.createTransaction()](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/service/InventoryService.java#L142-L200)

### Evidence

**InventoryService.createTransaction()** - Lines 142-200
```java
public InventoryTransaction createTransaction(InventoryTransaction transaction) {
    log.info("Creating inventory transaction: type={}, productId={}, quantity={}",
            transaction.getType(), transaction.getProductId(), transaction.getQuantity());

    // Save transaction first
    InventoryTransaction savedTransaction = transactionRepository.save(transaction);

    // Update stock based on transaction type
    Stock stock = stockRepository.findByProductIdAndWarehouseId(
            transaction.getProductId(),
            transaction.getWarehouseId()).orElseGet(() -> {
                Stock newStock = new Stock();
                // ... create new stock ...
                return newStock;
            });

    switch (transaction.getType()) {
        case IN:
            stock.setQuantity(stock.getQuantity() + transaction.getQuantity());
            stock.setAvailableQuantity(stock.getAvailableQuantity() + transaction.getQuantity());
            break;
        case OUT:
            // ⚠️ NO VALIDATION HERE - ALLOWS NEGATIVE STOCK
            stock.setQuantity(stock.getQuantity() - transaction.getQuantity());
            stock.setAvailableQuantity(stock.getAvailableQuantity() - transaction.getQuantity());
            break;
        // ... other cases ...
    }

    stockRepository.save(stock);
    // ...
}
```

**Problem:**
- Line `OUT` case: **No check** if `availableQuantity >= quantity` before deduction
- Contrast with StockService which HAS validation (See Issue #3)
- InventoryService is the main REST endpoint called by order-service
- **Direct path to negative stock**

### Call Chain
1. [SalesOrderService.fulfillOrder()](Knoweb_inventory/order-service/src/main/java/com/inventory/order/service/SalesOrderService.java#L43-L60) → `POST /api/inventory/transactions`
2. Endpoint receives transaction with type=OUT, quantity=5
3. **No validation** that stock has 5+ items
4. Stock is updated: `quantity = 0 - 5 = -5`
5. Negative stock saved to database

### Impact
- **Direct cause** of -5 stock in UI
- Multiple concurrent orders can all deduce from same stock without validation
- Invalid inventory state propagates to reports and analytics

### Fix Required
```java
case OUT:
    if (stock.getAvailableQuantity() < transaction.getQuantity()) {
        throw new IllegalArgumentException(
            "Insufficient stock: Available " + stock.getAvailableQuantity() + 
            ", Requested " + transaction.getQuantity());
    }
    stock.setQuantity(stock.getQuantity() - transaction.getQuantity());
    stock.setAvailableQuantity(stock.getAvailableQuantity() - transaction.getQuantity());
    break;
```

---

## Issue #3: Race Condition - Non-Atomic Stock Updates

### Location
- **Files:** 
  - [InventoryService.createTransaction()](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/service/InventoryService.java#L140-L210)
  - [StockService.processStockMovement()](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/service/StockService.java#L32-L120)

### Evidence

**Transaction sequence at application level:**
```
Thread 1 (Order A):
  1. Read: Stock quantity = 10
  2. Check: 10 >= 5? YES
  3. Calculate: 10 - 5 = 5

Thread 2 (Order B):
  1. Read: Stock quantity = 10  (SAME READ! Race condition)
  2. Check: 10 >= 5? YES
  3. Calculate: 10 - 5 = 5

Thread 1: Save quantity = 5
Thread 2: Save quantity = 5  (Both saved 5, but should be 0!)
```

**With a third transaction:**
```
Thread 1 (Order A):
  1. Read: Stock quantity = 10
  2. Check: 10 >= 5? YES
  3. Calculate: 10 - 5 = 5
  4. Save: quantity = 5

Thread 2 (Order B):
  1. Read: Stock quantity = 5   (Now updated from Thread 1)
  2. Check: 5 >= 5? YES
  3. Calculate: 5 - 5 = 0
  4. Save: quantity = 0

Thread 3 (Order C):
  1. Read: Stock quantity = 0   (Fresh read)
  2. Check: 0 >= 5? NO... but validation is missing!
  3. Calculate: 0 - 5 = -5
  4. Save: quantity = -5  ⚠️ NEGATIVE STOCK
```

### Root Cause
- **No pessimistic locking** (SELECT ... FOR UPDATE)
- **No optimistic locking** (no @Version field for concurrency control)
- **Read-Check-Write** is not atomic - gap exists between read and write
- Multiple threads can pass validation independently

### Current Behavior
```java
// NOT ATOMIC:
Stock stock = stockRepository.findByProductIdAndWarehouseId(...);  // Step 1: Read
// 🔴 RACE CONDITION WINDOW 🔴 - Other threads can read same stock
if (stock.getAvailableQuantity() < quantity) { /* validation */ }    // Step 2: Check
stock.setQuantity(stock.getQuantity() - quantity);                   // Step 3: Calculate
stockRepository.save(stock);                                         // Step 4: Write
```

### Impact
- Concurrent orders can succeed validation but result in negative stock
- **Explains the -5 symptom**: 2-3 concurrent requests on low stock
- Ledger and audit trails become unreliable
- Inventory reconciliation failures

### Fix Required
**Option A: Pessimistic Locking (Recommended)**
```java
@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Stock s WHERE s.productId = ?1 AND s.warehouseId = ?2")
    Optional<Stock> findByProductIdAndWarehouseIdWithLock(
        Long productId, 
        Long warehouseId
    );
}
```

**Option B: Optimistic Locking**
```java
@Entity
@Table(name = "stocks")
public class Stock {
    @Version
    @Column(name = "version")
    private Long version;
    
    // ... other fields
}
```

**Option C: Database-level row lock**
```sql
START TRANSACTION;
SELECT * FROM stocks 
WHERE product_id = ? AND warehouse_id = ? 
FOR UPDATE;  -- Acquires exclusive lock

UPDATE stocks SET quantity = quantity - ? 
WHERE product_id = ? AND warehouse_id = ? 
CHECK (quantity >= 0);

COMMIT;
```

---

## Issue #4: StockService Has Validation But Isn't Used

### Location
- **File:** [StockService.processStockMovement()](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/service/StockService.java#L32-L120)
- **Lines:** 93-99

### Evidence

**StockService validates (GOOD):**
```java
case OUT:
    if (stock == null) {
        throw new RuntimeException("Insufficient stock: Stock record not found for Product " + productId
                + " in Warehouse " + warehouseId);
    }

    if (stock.getAvailableQuantity() < quantityInt) {
        throw new RuntimeException("Insufficient stock: Available " + stock.getAvailableQuantity()
                + ", Requested " + quantityInt);
    }
    
    stock.setQuantity(stock.getQuantity() - quantityInt);
    stock.setAvailableQuantity(stock.getAvailableQuantity() - quantityInt);
    stockRepository.save(stock);
```

**But InventoryService doesn't (BAD):**
```java
case OUT:
    // NO VALIDATION - Directly subtracts
    stock.setQuantity(stock.getQuantity() - transaction.getQuantity());
    stock.setAvailableQuantity(stock.getAvailableQuantity() - transaction.getQuantity());
    break;
```

### Problem
- **Two different code paths** for stock updates
- StockService is not used by REST endpoint
- Main endpoint calls InventoryService.createTransaction()
- StockService.processStockMovement() is never invoked
- Validation effort in StockService is wasted

### Call Paths
```
Path 1 (REST - No Validation):
  SalesOrderService → inventory-service REST API → 
  InventoryController.createTransaction() → 
  InventoryService.createTransaction() 
  ⚠️ NO VALIDATION

Path 2 (Direct - Has Validation):
  ??? → StockService.processStockMovement()
  ✅ HAS VALIDATION
  But nobody calls this except possibly internal tests
```

### Fix Required
- Consolidate the two methods
- Use StockService validation in all stock updates
- Remove duplicate logic in InventoryService

---

## Issue #5: No Transaction Isolation Level Configuration

### Location
- **File:** [application.properties](Knoweb_inventory/inventory-service/src/main/resources/application.properties)

### Evidence

**Current configuration (MISSING):**
```properties
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true
# ⚠️ NO TRANSACTION ISOLATION LEVEL SPECIFIED
```

**Should have:**
```properties
# For inventory system, use SERIALIZABLE or REPEATABLE_READ
spring.jpa.properties.hibernate.connection.isolation=2
# Or in Spring Data JPA (for Hibernate):
spring.datasource.hikari.transaction-isolation=SERIALIZABLE
```

### Problem
- MySQL default isolation is **REPEATABLE_READ** (not serializable)
- Allows **phantom reads** - crucial for inventory
- Concurrent transactions can read same uncommitted stock state
- No protection against dirty reads or lost updates

### Isolation Levels Explanation
```
READ_UNCOMMITTED     (1): Allows dirty reads - NOT SAFE
READ_COMMITTED       (2): Prevents dirty reads - DEFAULT
REPEATABLE_READ      (4): MySQL default - Allows phantom reads
SERIALIZABLE         (8): Full isolation - RECOMMENDED FOR INVENTORY
```

### Impact
- Transactions are not isolated from concurrent modifications
- Phantom reads allow "ghost" quantities
- Stock validation checks can become stale between read and write

---

## Issue #6: API Contract Violation - Missing Required Parameters

### Location
- **File:** [SalesOrderService.deductStock()](Knoweb_inventory/order-service/src/main/java/com/inventory/order/service/SalesOrderService.java#L95-L135)
- **Lines:** 95-135

### Evidence

**Problem in deductStock():**
```java
// ── Step 1: resolve warehouseId ───────────────────────────────────────
Long warehouseId = order.getWarehouseId();

if (warehouseId == null) {
    log.info("Order has no warehouseId — querying inventory-service for productId={}", productId);
    String stocksUrl = inventoryServiceUrl + "/api/inventory/stocks/product/" + productId;
    try {
        ResponseEntity<List> stocksResponse = restTemplate.getForEntity(stocksUrl, List.class);
        // ... attempts to find warehouseId from first result ...
    } catch (Exception e) {
        log.warn("Could not fetch stock for productId={}: {}", productId, e.getMessage());
    }
}

if (warehouseId == null) {
    log.error("Cannot deduct stock for productId={} — no warehouseId available on order or in inventory",
            productId);
    throw new RuntimeException(
            "Stock deduction failed for product #" + productId +
                    ": no warehouse found. Please ensure the sales order has a warehouse selected.");
}
```

**InventoryTransaction expects warehouseId:**
```java
@Column(name = "warehouse_id")
private Long warehouseId;

// In createTransaction():
Stock stock = stockRepository.findByProductIdAndWarehouseId(
        transaction.getProductId(),
        transaction.getWarehouseId()).orElseGet(() -> {  // ⚠️ Both are required!
```

### Problem
- `warehouseId` is critical for stock lookup
- If missing, creates new stock with `null warehouseId`
- This violates the NOT NULL constraint at DB level
- But validation happens at REST layer, not DB layer (Should be both!)

### Impact
- Order-service doesn't enforce warehouse ID on sales orders
- Inventory-service tries to work around missing data
- Can create orphaned stock records
- Increases chance of updating wrong stock location

---

## Issue #7: No Distributed Transaction Support

### Location
- **Architecture:** Microservices calling each other via REST

### Evidence

**SalesOrderService calls inventory-service:**
```java
// In order-service (SalesOrderService)
String txUrl = inventoryServiceUrl + "/api/inventory/transactions";
HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

try {
    ResponseEntity<String> response = restTemplate.postForEntity(txUrl, request, String.class);
    if (!response.getStatusCode().is2xxSuccessful()) {
        throw new RuntimeException(
                "Inventory-service returned " + response.getStatusCode() +
                        " for productId=" + productId);
    }
} catch (Exception e) {
    log.error("Failed to deduct stock for productId={}: {}", productId, e.getMessage());
    throw new RuntimeException(
            "Stock deduction failed for product #" + productId + ": " + e.getMessage(), e);
}

// ⚠️ If this fails AFTER order status is updated to COMPLETED,
// order is completed but inventory is not updated!
```

**Flow:**
1. SalesOrder marked as COMPLETED
2. REST call to deduct stock is made
3. If REST call fails → **Compensating transaction needed**
4. Currently: No rollback mechanism

### Problem
- No distributed transaction framework (Saga pattern not implemented)
- No compensation logic if inventory-service call fails
- Order marked COMPLETED but stock unchanged
- Two-Phase Commit (2PC) not implemented

### Impact
- **Semantic inconsistency**: Orders completed without stock deduction
- Inventory mismatch with order records
- Can contribute to false "inventory available" when it's not

**Scenario causing -5:**
```
Time 1: Order 1 completes, attempts to deduct 3 units
Time 2: Order 2 completes, attempts to deduct 5 units
Time 3: Both REST calls arrive at inventory-service
Time 4: Race condition occurs (Issue #3) → both succeed without proper locking
Result: Stock goes negative
```

---

## Issue #8: Inconsistent availableQuantity vs reservedQuantity

### Location
- **File:** [Stock.java](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/model/Stock.java)

### Evidence

**Stock model has three quantity fields:**
```java
@Column(nullable = false)
private Integer quantity = 0;  // Total quantity

@Column(name = "available_quantity")
private Integer availableQuantity = 0;  // Quantity available for sale

@Column(name = "reserved_quantity")
private Integer reservedQuantity = 0;  // Quantity reserved for orders
```

**But no invariant:** `quantity = availableQuantity + reservedQuantity`

**Logic updates both independently:**
```java
case OUT:
    stock.setQuantity(stock.getQuantity() - transaction.getQuantity());
    stock.setAvailableQuantity(stock.getAvailableQuantity() - transaction.getQuantity());
    // reservedQuantity is NEVER updated
    // ⚠️ No guarantee: quantity = availableQuantity + reservedQuantity
```

### Problem
- No validation that three quantities remain consistent
- If reserved=5, available=3, and we deduct 5 from all:
  - quantity = 10 - 5 = 5
  - available = 3 - 5 = -2  ⚠️ NEGATIVE
  - reserved = 5 (unchanged?)
- Inconsistent state possible

### Impact
- Reports using `availableQuantity` show negative stock
- Cannot trust any of the three quantities
- Audit trail is unreliable

---

## Issue #9: Insufficient Stock Check Location Error

### Location
- **StockService has check**: Line 94-99
- **InventoryService lacks check**: No validation before OUT

### Timing
- If validation happens AFTER read but BEFORE write, still vulnerable to race conditions
- Need to validate WHILE holding lock

---

## Summary Table: Root Causes vs Negative Stock Occurrence

| # | Issue | Severity | Direct Cause | Scenario | 
|---|-------|----------|-------------|----------|
| 1 | No DB Constraints | HIGH | Stock can be negative once written | After any unlocked write |
| 2 | Missing Validation in InventoryService | **CRITICAL** | No check before OUT deduction | Any single malformed request |
| 3 | Race Condition | **CRITICAL** | Multiple threads bypass validation | 2+ concurrent orders on low stock |
| 4 | StockService unused | MEDIUM | Validation never executed | All REST calls |
| 5 | No Transaction Isolation | HIGH | Phantom reads possible | Under concurrent load |
| 6 | Missing warehouseId | MEDIUM | Wrong stock location updated | Order without warehouse |
| 7 | No Distributed Transactions | MEDIUM | Semantic inconsistency | Failed REST calls |
| 8 | Inconsistent Quantities | MEDIUM | availableQuantity can go negative | Multiple deductions |
| 9 | Insufficient Stock Check Timing | **CRITICAL** | Check happens before lock acquired | Race condition window |

---

## **Most Likely Scenario Producing -5 Stock**

```
Inventory Status: 5 units available
Order 1: Requests 5 units
Order 2: Requests 5 units
Order 3: Requests 5 units

Timeline:
T1: Order 1 - Read stock (quantity=5)
T2: Order 2 - Read stock (quantity=5)  ⚠️ RACE CONDITION
T3: Order 3 - Read stock (quantity=5)  ⚠️ RACE CONDITION
T4: Order 1 - Check: 5 >= 5? YES
T5: Order 2 - Check: 5 >= 5? YES
T6: Order 3 - Check: 5 >= 5? YES
T7: Order 1 - Calculate & Write: quantity = 5 - 5 = 0
T8: Order 2 - Calculate & Write: quantity = 5 - 5 = 0 (overwrites Order 1!)
T9: Order 3 - Calculate & Write: quantity = 5 - 5 = 0 (overwrites Order 2!)
T10: All 3 orders succeed, but stock shows 0

OR with delayed reads:
T1-T9: (same as above, stock = 0)
T10: Order 4 - Read stock (quantity = 0)
T11: Order 4 - No validation check (Issue #2)
T12: Order 4 - Deduct: 0 - 5 = -5 ⚠️ NEGATIVE STOCK
```

---

## Recommended Fix Priority

### Phase 1: CRITICAL (Implement First)
1. **Add pessimistic locking** to `findByProductIdAndWarehouseId()`
2. **Add validation** in InventoryService.createTransaction() OUT case
3. **Add DB CHECK constraint** `quantity >= 0`

### Phase 2: IMPORTANT (Implement Soon)
4. Set transaction isolation level to SERIALIZABLE
5. Consolidate StockService and InventoryService logic
6. Implement compensating transactions (Saga pattern)
7. Make warehouseId mandatory on SalesOrder

### Phase 3: RECOMMENDED (Implement Next Release)
8. Add optimistic locking (@Version) as backup
9. Implement reservation and hold logic
10. Add audit logging for all stock changes
11. Create data consistency validation job

---

## Code Locations Summary

| Issue | File | Lines | Fix |
|-------|------|-------|-----|
| No validation in OUT | [InventoryService.java](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/service/InventoryService.java) | 159-164 | Add check before deduction |
| Race condition | [StockRepository.java](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/repository/StockRepository.java) | - | Add @Lock annotation |
| No DB constraint | [Stock.java](Knoweb_inventory/inventory-service/src/main/java/com/inventory/inventoryservice/model/Stock.java) | 28-32 | Add @Min(0) annotations |
| Missing isolation config | [application.properties](Knoweb_inventory/inventory-service/src/main/resources/application.properties) | - | Add isolation level config |
| REST failures unhandled | [SalesOrderService.java](Knoweb_inventory/order-service/src/main/java/com/inventory/order/service/SalesOrderService.java) | 150-165 | Add compensating logic |

---

## Testing Recommendations

1. **Load test** with concurrent sales orders on limited stock (5 units, 10 concurrent requests)
2. **Race condition test** - Order same stock product 3 times simultaneously
3. **Validation test** - Send malformed stock OUT request with negative quantity
4. **Failure test** - Simulate inventory-service downtime during order fulfillment
5. **Data integrity test** - Verify `quantity = availableQuantity + reservedQuantity` invariant

---

**Analysis Complete** ✓
