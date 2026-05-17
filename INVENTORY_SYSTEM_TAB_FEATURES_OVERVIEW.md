# Inventory System Tab Features Overview

## Scope
This document provides a complete overview of the sidebar tabs shown in the Inventory application UI, with feature details and technologies used.

Primary implementation analyzed:
- `Knoweb_inventory/inventory-frontend`

Also considered for variant behavior:
- `Knoweb_inventory_Middeniya/inventory-frontend` (role-based operational menus)

---

## 1) Platform Architecture and Technologies

### Frontend
- React 18 (`react`, `react-dom`)
- Vite 5 build tooling
- React Router v6 for route-based tab navigation
- Axios for API communication
- Tailwind CSS + custom CSS for UI styling
- Icons: `lucide-react`, `react-icons`
- Charts and BI visuals: `recharts`
- State utilities available: Redux Toolkit + React Redux

Evidence source:
- `Knoweb_inventory/inventory-frontend/package.json`
- `Knoweb_inventory/inventory-frontend/src/App.jsx`
- `Knoweb_inventory/inventory-frontend/src/components/Sidebar.jsx`

### Backend / Services (Microservices)
- Spring Boot (Java 17)
- Spring Data JPA
- Spring Validation
- Eureka Service Discovery (`spring-cloud-starter-netflix-eureka-client`)
- API Gateway pattern
- MySQL

Evidence source:
- `Knoweb_inventory/README.md`
- `Knoweb_inventory/inventory-service/pom.xml`

### Service Topology (from project docs)
- `api-gateway` (entry point)
- `service-discovery` (Eureka)
- `product-service`
- `inventory-service`
- `order-service`
- `warehouse-service`
- `supplier-service`
- `user-service`
- `notification-service`
- `reporting-service` (used by analytics/audit API clients)

---

## 2) Sidebar Tabs (As Seen in UI)

From `Sidebar.jsx`, the visible tabs include:
1. Control Panel
2. Unit Management
3. Live Stock
4. Order Ledger
5. Warehouses
6. Supply Chain
7. Branchers
8. Catalog
9. Notifications
10. Analytics
11. Audit Vault

Grouped under:
- Main Operations
- System Arch (section heading)

---

## 3) Tab-by-Tab Feature Overview

## 3.1 Control Panel
- Route: `/`
- Page Component: `Dashboard`
- Purpose:
  - Executive overview of inventory health and activity.
- Core features:
  - KPI cards: products, stock items, orders, warehouse status, low-stock alerts, stock value.
  - Recent activity feed from transactions.
  - Aggregates data from multiple services in parallel.
- APIs used:
  - `analyticsService.getDashboard(orgId)`
  - `productService.getAll()`
  - `warehouseService.getByOrganization(orgId)`
  - `orderService.getPurchaseOrders()` + `getSalesOrders()`
  - `inventoryService.getAllStocks()` + `getAllTransactions()`
- Key technologies:
  - React hooks (`useEffect`, `useState`)
  - Promise-based parallel loading (`Promise.allSettled`)

## 3.2 Unit Management
- Route: `/products`
- Page Component: `Products`
- Purpose:
  - Product master and stock-eligible SKU management.
- Core features:
  - Product list and metadata loading.
  - Create/update/delete product workflows.
  - Industry-aware features (e.g., pharmacy mode with expiring/expired/prescription/refrigerated views).
  - Product registration modal and dedicated register route (`/products/register`).
- APIs used:
  - `productService` CRUD and list endpoints
  - `categoryService.getAll()`
  - `brandService.getAll()`
  - `pharmacyService` endpoints for pharmacy-specific intelligence
- Key technologies:
  - Modal-driven forms
  - Dynamic tab/filtering behavior by industry type

## 3.3 Live Stock
- Route: `/inventory`
- Page Component: `Inventory`
- Purpose:
  - Live inventory visibility and transaction control.
- Core features:
  - Stock-level table with reorder awareness.
  - Transaction log table (Stock In/Out/Transfer/Adjustment/Return).
  - Search/filter by product/warehouse and transaction type.
  - New transaction modal/form launch.
  - Operational stats: total SKUs, total units, low stock, out-of-stock, movement count.
- APIs used:
  - `inventoryService.getAllStocks()`
  - `inventoryService.getAllTransactions()`
  - `inventoryService.createTransaction()`
- Key technologies:
  - Two-mode screen state (`stocks` and `transactions`)
  - Visual status badges and progress bars

## 3.4 Order Ledger
- Route: `/orders`
- Page Component: `Orders`
- Purpose:
  - Procurement and sales order lifecycle control.
- Core features:
  - Purchase order creation flow (supplier + warehouse + line items).
  - Sales order creation flow.
  - Tabbed order views (`purchase` and `sales`) with counters.
  - Product and warehouse lookup for order line composition.
- APIs used:
  - `orderService.getPurchaseOrders()` / `createPurchaseOrder()`
  - `orderService.getSalesOrders()` / `createSalesOrder()` / `completeSalesOrder()`
  - `supplierService.getByOrganization(orgId)`
  - `productService.getAll()`
  - `warehouseService.getByOrganization(orgId)`
- Key technologies:
  - Rich modal workflows with computed totals
  - Data-driven line-item arrays

## 3.5 Warehouses
- Route: `/warehouses`
- Page Component: `Warehouses`
- Purpose:
  - Warehouse network administration and capacity tracking.
- Core features:
  - Create/update/delete warehouses.
  - Branch mapping and warehouse type assignment.
  - Capacity usage visualization.
  - Warehouse attributes support (dynamic key/value style).
  - Active/inactive status control.
- APIs used:
  - `warehouseService.getByOrganization(orgId)`
  - `warehouseService.getBranches(orgId)`
  - `warehouseService.create/update/delete`
- Key technologies:
  - Structured form state + dynamic attributes
  - Capacity progress indicators

## 3.6 Supply Chain
- Route: `/suppliers`
- Page Component: `Suppliers`
- Purpose:
  - Supplier master and partner contact profile management.
- Core features:
  - Supplier list by organization.
  - Add/edit/delete supplier records.
  - Flexible contact information storage (`contactInfo` with dynamic fields).
  - Search and management UI.
- APIs used:
  - `supplierService.getByOrganization(orgId)`
  - `supplierService.create/update/delete`
- Key technologies:
  - Dynamic JSON-like contact key/value editing
  - Confirmation workflows before destructive actions

## 3.7 Branchers
- Route: `/branches`
- Page Component: `Branches`
- Purpose:
  - Multi-branch organization structure management.
- Core features:
  - Add/edit/delete branch records.
  - Branch metadata: location name, branch code, address, timezone, active state.
  - Search and detail views.
- APIs used:
  - `branchService.getAll()`
  - `branchService.create/update/delete`
- Key technologies:
  - CRUD table + modal forms
  - Status and filter UX patterns

## 3.8 Catalog
- Route: `/catalog/settings` (Sidebar points to settings)
- Page Component: `CatalogSettings`
- Purpose:
  - Product taxonomy and identity controls.
- Core features:
  - Category management (create/update/delete).
  - Brand management (create/update/delete).
  - Tabbed settings experience: `categories` / `brands`.
- APIs used:
  - `categoryService.getAll/create/update/delete`
  - `brandService.getAll/create/update/delete`
- Key technologies:
  - Settings-oriented tab design
  - Async save and inline registry refresh

## 3.9 Notifications
- Route: `/notifications`
- Page Component: `Notifications`
- Purpose:
  - Operational alert stream for organization users.
- Core features:
  - Pull and render org-scoped notifications.
  - Mark single alert as read.
  - Mark all alerts as read.
  - Delete/purge notification entries.
  - Filter by read state and alert type (`INFO`, `SUCCESS`, `WARNING`, `ERROR`).
- APIs used:
  - `notificationService.getAll()`
  - `notificationService.markAsRead(id)`
  - `notificationService.delete(id)`
- Key technologies:
  - Event-feed style mapping and sorting
  - Tab-like filtering and status counters

## 3.10 Analytics
- Route: `/analytics`
- Page Component: `Analytics`
- Purpose:
  - Cross-domain reporting and business intelligence.
- Core features:
  - Internal analytics tabs:
    - Dashboard
    - Inventory Reports
    - Sales Reports
    - Audit Logs
  - KPI aggregation (revenue, orders, low-stock, expiring).
  - Chart visualizations for trends and category breakdowns.
  - Audit log review panel.
- APIs used:
  - `analyticsService.getDashboard/getSalesAnalytics/getInventoryAnalytics`
  - `pharmacyService.getStats(orgId)`
  - `auditService.getByOrganization(orgId)`
- Key technologies:
  - `recharts` line/bar charts
  - Aggregation + transformation logic in frontend

## 3.11 Audit Vault
- Route: `/stock-ledger`
- Page Component: `StockLedgerValuation`
- Purpose:
  - Financial-grade inventory movement ledger and valuation analysis.
- Core features:
  - Product + warehouse scoped ledger retrieval.
  - Movement table with in/out sequencing and running balance.
  - Valuation method comparison:
    - FIFO
    - LIFO
    - Weighted Average
  - Recommended method highlighting.
  - Comparative valuation cards and analysis summaries.
- APIs used:
  - `ledgerService.getByProductAndWarehouse(...)`
  - `valuationService.compareMethods(...)`
  - `productService.getByOrganization(orgId)`
  - `warehouseService.getByOrganization(orgId)`
- Key technologies:
  - Valuation-model UI and financial analytics presentation
  - Multi-source async loading and matrix-style comparison

---

## 4) Security, Session, and Multi-Tenant Controls
- JWT token propagation via Axios interceptor (`Authorization: Bearer ...`).
- Tenant/org context headers:
  - `X-Tenant-ID`
  - `X-Org-ID`
  - `X-Industry-Type`
- 401 handling strategy:
  - Clear local storage and redirect to login.
- SSO logout chaining supported across sibling apps.

Evidence source:
- `Knoweb_inventory/inventory-frontend/src/services/api.js`
- `Knoweb_inventory/inventory-frontend/src/components/Sidebar.jsx`

---

## 5) Variant Note: `Knoweb_inventory_Middeniya`
In the Middeniya variant, the same admin tabs exist, but additional role-guarded operational tabs are enabled for manufacturing flow:
- Stores Dashboard
- Finished Goods
- Stock In / Adjust
- Purchase Orders
- Molding Ops
- Assembly Line
- Primary Finishing
- Quality Control

This is implemented via role checks in sidebar rendering and guarded routes (`RoleGuard`) in the app router.

---

## 6) Conclusion
The Inventory system is a microservices-based, role-aware operations platform with a modern React frontend and Spring Boot backend services. The sidebar tabs map cleanly to domain modules for product, stock, order, warehouse, supplier, branch, catalog, notifications, analytics, and stock valuation/audit workflows.
