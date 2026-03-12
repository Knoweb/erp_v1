# STEP 3: System Access API - Implementation Guide

## ✅ Implementation Complete

**Service:** Subscription Service  
**Port:** 8091  
**Database:** subscription_db  
**Purpose:** Provide API endpoints for React dashboard to retrieve subscribed systems

---

## 📦 What Was Implemented

### Files Created/Modified (6 files)

#### 1. **JsonListConverter.java** (NEW)
**Location:** `subscription-service/backend/src/main/java/com/inventory/subscription/util/JsonListConverter.java`

**Purpose:** JPA converter for JSON array column

**Key Features:**
- Converts `List<String>` ↔ JSON string
- Handles null values gracefully
- Error logging for debugging
- Auto-applies to annotated fields

**Usage:**
```java
@Convert(converter = JsonListConverter.class)
@Column(name = "subscribed_systems", columnDefinition = "JSON")
private List<String> subscribedSystems;
```

---

#### 2. **CompanyTenant.java** (UPDATED)
**Location:** `subscription-service/backend/src/main/java/com/inventory/subscription/model/CompanyTenant.java`

**Changes:**
- ✅ Added `subscribedSystems` field with JSON conversion
- ✅ Added helper method `addSubscribedSystem(String)`
- ✅ Added helper method `hasAccessToSystem(String)`
- ✅ Updated `@PrePersist` to initialize empty list

**New Field:**
```java
@Convert(converter = JsonListConverter.class)
@Column(name = "subscribed_systems", columnDefinition = "JSON")
@Builder.Default
private List<String> subscribedSystems = new ArrayList<>();
```

**Database Mapping:**
```sql
-- Database column
subscribed_systems JSON  -- ["GINUMA", "INVENTORY"]

-- Java field
private List<String> subscribedSystems;  // ["GINUMA", "INVENTORY"]
```

---

#### 3. **SystemAccessResponse.java** (NEW)
**Location:** `subscription-service/backend/src/main/java/com/inventory/subscription/dto/SystemAccessResponse.java`

**Purpose:** DTO for returning system access information to frontend

**Fields:**
- `orgId` - Organization ID
- `companyName` - Company name
- `contactEmail` - Contact email
- `status` - Company status (ACTIVE/BLOCKED/PENDING)
- `subscribedSystems` - List of system codes
- `isActive` - Boolean flag
- `isBlocked` - Boolean flag
- `createdAt` - Account creation timestamp
- `statusMessage` - Human-readable status
- `systemCount` - Number of subscribed systems

**Factory Method:**
```java
SystemAccessResponse response = SystemAccessResponse.fromEntity(companyTenant);
```

**Example JSON Response:**
```json
{
  "orgId": 100,
  "companyName": "Acme Corporation",
  "contactEmail": "admin@acme.com",
  "status": "ACTIVE",
  "subscribedSystems": ["GINUMA", "INVENTORY"],
  "isActive": true,
  "isBlocked": false,
  "createdAt": "2026-03-10T14:30:00",
  "statusMessage": "Your account is active and all systems are accessible",
  "systemCount": 2
}
```

---

#### 4. **CompanyTenantRepository.java** (ALREADY EXISTS)
**Location:** `subscription-service/backend/src/main/java/com/inventory/subscription/repository/CompanyTenantRepository.java`

**Existing Method Used:**
```java
Optional<CompanyTenant> findByOrgId(Long orgId);
```

✅ No changes needed - already has the required method!

---

#### 5. **SubscriptionAccessService.java** (NEW)
**Location:** `subscription-service/backend/src/main/java/com/inventory/subscription/service/SubscriptionAccessService.java`

**Purpose:** Business logic for retrieving system access

**Methods:**

1. **getSubscribedSystems(Long orgId)**
   - Returns SystemAccessResponse with all subscribed systems
   - Throws CompanyNotFoundException if not found
   - Validates orgId parameter
   - Logs all operations

2. **hasSystemAccess(Long orgId, String systemCode)**
   - Checks if org has access to specific system
   - Returns boolean
   - Useful for authorization checks

3. **getCompanyStatus(Long orgId)**
   - Returns CompanyStatus enum
   - Used by frontend to show account state

**Error Handling:**
- ✅ Validates input parameters
- ✅ Throws CompanyNotFoundException (404)
- ✅ Throws IllegalArgumentException (400)
- ✅ Comprehensive logging

---

#### 6. **SubscriptionAccessController.java** (NEW)
**Location:** `subscription-service/backend/src/main/java/com/inventory/subscription/controller/SubscriptionAccessController.java`

**Purpose:** REST API endpoints for frontend

**CORS Configuration:**
```java
@CrossOrigin(origins = {
    "http://localhost:5173",  // Knoweb Main Portal
    "http://localhost:3000",   // Subscription Service Frontend
    "http://localhost:5176",   // Ginuma Frontend
    "http://localhost:5174"    // Inventory Frontend
})
```

**Endpoints:**

1. **GET /api/subscriptions/my-systems/{orgId}**
   - Primary endpoint for dashboard
   - Returns full SystemAccessResponse
   - Status: 200 OK, 404 Not Found, 400 Bad Request

2. **GET /api/subscriptions/my-systems/{orgId}/access/{systemCode}**
   - Check access to specific system
   - Returns: `{"hasAccess": true, "orgId": 100, "systemCode": "GINUMA"}`

3. **GET /api/subscriptions/my-systems/{orgId}/status**
   - Get company status only
   - Returns: `{"orgId": 100, "status": "ACTIVE", "isActive": true, "isBlocked": false}`

4. **GET /api/subscriptions/health**
   - Health check endpoint
   - Returns: `{"status": "UP", "service": "Subscription Access Service"}`

---

## 🔧 Configuration

### Application Properties

**File:** `subscription-service/backend/src/main/resources/application.properties`

```properties
# Server Configuration
server.port=8091

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/subscription_db
spring.datasource.username=root
spring.datasource.password=1234
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Logging
logging.level.com.inventory.subscription=DEBUG
```

### Dependencies (pom.xml)

All required dependencies should already be present:
- ✅ spring-boot-starter-web
- ✅ spring-boot-starter-data-jpa
- ✅ mysql-connector-j
- ✅ lombok
- ✅ jackson-databind

---

## 🧪 Testing Guide

### Prerequisites

1. ✅ Subscription service running on port 8091
2. ✅ MySQL subscription_db exists
3. ✅ Step 1 migrations executed (subscribed_systems column exists)
4. ✅ Test data in company_tenant table

### Test Data Setup

```sql
USE subscription_db;

-- Insert test company with GINUMA subscription
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (100, 'Test Ginuma Corp', 'test@ginuma.com', 'ACTIVE', '["GINUMA"]', NOW());

-- Insert test company with INVENTORY subscription
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (200, 'Test Inventory Corp', 'test@inventory.com', 'ACTIVE', '["INVENTORY"]', NOW());

-- Insert test company with BOTH subscriptions
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (300, 'Test Multi Corp', 'test@multi.com', 'ACTIVE', '["GINUMA", "INVENTORY"]', NOW());

-- Insert blocked company
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (400, 'Blocked Corp', 'blocked@test.com', 'BLOCKED', '["GINUMA"]', NOW());
```

### Test 1: Get Subscribed Systems

```bash
# Test GINUMA-only company
curl http://localhost:8091/api/subscriptions/my-systems/100

# Expected Response:
{
  "orgId": 100,
  "companyName": "Test Ginuma Corp",
  "contactEmail": "test@ginuma.com",
  "status": "ACTIVE",
  "subscribedSystems": ["GINUMA"],
  "isActive": true,
  "isBlocked": false,
  "createdAt": "2026-03-10T14:30:00",
  "statusMessage": "Your account is active and all systems are accessible",
  "systemCount": 1
}
```

```bash
# Test multi-system company
curl http://localhost:8091/api/subscriptions/my-systems/300

# Expected Response:
{
  "orgId": 300,
  "companyName": "Test Multi Corp",
  "contactEmail": "test@multi.com",
  "status": "ACTIVE",
  "subscribedSystems": ["GINUMA", "INVENTORY"],
  "isActive": true,
  "isBlocked": false,
  "systemCount": 2
}
```

```bash
# Test non-existent company (should return 404)
curl http://localhost:8091/api/subscriptions/my-systems/999

# Expected: HTTP 404 Not Found
```

### Test 2: Check System Access

```bash
# Check if org 100 has GINUMA access (should be true)
curl http://localhost:8091/api/subscriptions/my-systems/100/access/GINUMA

# Expected Response:
{
  "hasAccess": true,
  "orgId": 100,
  "systemCode": "GINUMA"
}
```

```bash
# Check if org 100 has INVENTORY access (should be false)
curl http://localhost:8091/api/subscriptions/my-systems/100/access/INVENTORY

# Expected Response:
{
  "hasAccess": false,
  "orgId": 100,
  "systemCode": "INVENTORY"
}
```

### Test 3: Get Company Status

```bash
# Active company
curl http://localhost:8091/api/subscriptions/my-systems/100/status

# Expected Response:
{
  "orgId": 100,
  "status": "ACTIVE",
  "isActive": true,
  "isBlocked": false
}
```

```bash
# Blocked company
curl http://localhost:8091/api/subscriptions/my-systems/400/status

# Expected Response:
{
  "orgId": 400,
  "status": "BLOCKED",
  "isActive": false,
  "isBlocked": true
}
```

### Test 4: Health Check

```bash
curl http://localhost:8091/api/subscriptions/health

# Expected Response:
{
  "status": "UP",
  "service": "Subscription Access Service"
}
```

---

## 🎨 React Integration Example

### Axios Service

```javascript
// src/services/subscriptionAccessApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8091/api/subscriptions';

export const getMySubscribedSystems = async (orgId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-systems/${orgId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscribed systems:', error);
    throw error;
  }
};

export const checkSystemAccess = async (orgId, systemCode) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/my-systems/${orgId}/access/${systemCode}`
    );
    return response.data.hasAccess;
  } catch (error) {
    console.error('Error checking system access:', error);
    return false;
  }
};

export const getCompanyStatus = async (orgId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-systems/${orgId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company status:', error);
    throw error;
  }
};
```

### React Component

```javascript
// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getMySubscribedSystems } from '../services/subscriptionAccessApi';

const Dashboard = () => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        // Get orgId from localStorage or user context
        const userDetails = JSON.parse(localStorage.getItem('userDetails'));
        const orgId = userDetails?.orgId;

        if (!orgId) {
          setError('Organization ID not found');
          return;
        }

        const response = await getMySubscribedSystems(orgId);
        setSystems(response.subscribedSystems);
        
        // Check if account is blocked
        if (response.isBlocked) {
          setError(response.statusMessage);
        }
      } catch (err) {
        setError('Failed to load subscribed systems');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>My Systems</h1>
      <div className="system-grid">
        {systems.includes('GINUMA') && (
          <div className="system-card">
            <h2>Ginuma ERP</h2>
            <p>HR, Payroll, Accounting & CRM</p>
            <a href="http://localhost:5176" className="btn-primary">
              Launch System
            </a>
          </div>
        )}
        
        {systems.includes('INVENTORY') && (
          <div className="system-card">
            <h2>Inventory Management</h2>
            <p>Warehouse & Supply Chain</p>
            <a href="http://localhost:5174" className="btn-primary">
              Launch System
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 🔍 Verification Queries

```sql
-- Check if subscribed_systems column exists
USE subscription_db;
DESCRIBE company_tenant;

-- View all companies with their subscribed systems
SELECT 
    org_id,
    company_name,
    contact_email,
    status,
    subscribed_systems,
    JSON_LENGTH(subscribed_systems) AS system_count
FROM company_tenant;

-- Find companies subscribed to GINUMA
SELECT 
    org_id,
    company_name,
    subscribed_systems
FROM company_tenant
WHERE JSON_CONTAINS(subscribed_systems, '"GINUMA"');

-- Find companies subscribed to INVENTORY
SELECT 
    org_id,
    company_name,
    subscribed_systems
FROM company_tenant
WHERE JSON_CONTAINS(subscribed_systems, '"INVENTORY"');

-- Find companies subscribed to both systems
SELECT 
    org_id,
    company_name,
    subscribed_systems
FROM company_tenant
WHERE JSON_CONTAINS(subscribed_systems, '"GINUMA"')
  AND JSON_CONTAINS(subscribed_systems, '"INVENTORY"');

-- Find active companies only
SELECT 
    org_id,
    company_name,
    status,
    subscribed_systems
FROM company_tenant
WHERE status = 'ACTIVE';
```

---

## 🐛 Troubleshooting

### Issue 1: "Column 'subscribed_systems' not found"

**Cause:** Step 1 database migration not executed

**Solution:**
```sql
USE subscription_db;
ALTER TABLE company_tenant 
ADD COLUMN subscribed_systems JSON NOT NULL DEFAULT '[]' 
COMMENT 'JSON array of system names the organization has access to';
```

### Issue 2: "JSON parsing error"

**Cause:** Invalid JSON in database

**Solution:**
```sql
-- Fix invalid JSON entries
UPDATE company_tenant 
SET subscribed_systems = '[]' 
WHERE subscribed_systems IS NULL OR subscribed_systems = '';

-- Validate JSON format
SELECT org_id, company_name, subscribed_systems
FROM company_tenant
WHERE JSON_VALID(subscribed_systems) = 0;
```

### Issue 3: "CORS error from frontend"

**Cause:** Frontend URL not in @CrossOrigin list

**Solution:** Add your frontend URL to controller:
```java
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5176",
    "http://localhost:5174",
    "http://localhost:YOUR_PORT"  // Add here
})
```

### Issue 4: "Service starts but endpoint returns 404"

**Cause:** Controller not being scanned

**Solution:** Check main application class:
```java
@SpringBootApplication
@ComponentScan(basePackages = "com.inventory.subscription")
public class SubscriptionServiceApplication {
    // ...
}
```

---

## 📊 API Summary

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/subscriptions/my-systems/{orgId}` | GET | Get all subscribed systems | SystemAccessResponse |
| `/api/subscriptions/my-systems/{orgId}/access/{systemCode}` | GET | Check specific system access | `{"hasAccess": boolean}` |
| `/api/subscriptions/my-systems/{orgId}/status` | GET | Get company status | `{"status": "ACTIVE"}` |
| `/api/subscriptions/health` | GET | Health check | `{"status": "UP"}` |

---

## ✅ Implementation Checklist

- [x] JsonListConverter created
- [x] CompanyTenant entity updated with subscribedSystems field
- [x] SystemAccessResponse DTO created
- [x] CompanyTenantRepository verified (findByOrgId exists)
- [x] SubscriptionAccessService implemented
- [x] SubscriptionAccessController implemented
- [x] CORS configuration added for all frontend ports
- [x] Error handling implemented (404, 400, 500)
- [x] Logging added to all methods
- [x] Documentation created

---

## 🚀 Next Steps

1. **Start Subscription Service**
   ```bash
   cd subscription-service/backend
   mvn spring-boot:run
   ```

2. **Insert Test Data**
   ```sql
   -- Run test data SQL from above
   ```

3. **Test Endpoints**
   ```bash
   # Health check
   curl http://localhost:8091/api/subscriptions/health
   
   # Get systems
   curl http://localhost:8091/api/subscriptions/my-systems/100
   ```

4. **Integrate with Frontend Dashboard**
   - Copy React integration code
   - Update orgId source (localStorage/context)
   - Test system card rendering

---

**Implementation Complete!** ✅

The subscription service now provides a complete API for the React dashboard to:
- Fetch subscribed systems for any organization
- Check access to specific systems
- Retrieve company status
- Handle blocked/inactive accounts

Ready for frontend integration! 🎉
