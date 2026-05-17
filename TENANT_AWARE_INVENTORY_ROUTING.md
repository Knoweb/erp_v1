# Tenant-Aware Inventory Routing Implementation

## Overview
Implemented multi-tenant inventory routing for the ginum-backend microservice to support multi-droplet architecture.

**Requirement**: 
- Company ID 16 (Middeniya) → fetch from **Middeniya droplet**
- Other company IDs → fetch from **Knoweb/Ginuma droplet**

---

## Implementation Details

### 1. Configuration Added to `application.properties`
```properties
# Tenant-Specific Inventory Service URLs (Multi-Droplet Architecture)
inventory.url.middeniya=${INVENTORY_URL_MIDDENIYA:http://localhost:8082}
inventory.url.knoweb=${INVENTORY_URL_KNOWEB:http://localhost:8082}
```

**Note**: Default values use localhost:8082 for local testing. Set environment variables in production.

### 2. RestTemplate Bean Added to `GinumAppsApplication.java`
```java
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

This enables cross-droplet HTTP communication for Middeniya tenant requests.

### 3. Tenant-Aware Logic in `SupplierService.java`
Modified `getSuppliersByCompanyId()` method:
- **If companyId == 16 (Middeniya)**: Uses `RestTemplate` to call Middeniya droplet via `inventory.url.middeniya`
- **Otherwise**: Uses existing Feign client (local service discovery) for Knoweb/Ginuma droplet

#### Key Changes:
- Injected `RestTemplate` and tenant URL properties (`@Value`)
- Added conditional routing logic with logging
- Created `fetchFromTenantUrl()` helper method for cross-droplet REST calls
- Error handling returns empty list on connection failure (graceful degradation)

---

## Deployment Configuration

### Environment Variables (Production)

Set these in your production deployment environment:

```bash
# Middeniya droplet inventory service
export INVENTORY_URL_MIDDENIYA=http://<middeniya-droplet-ip>:8082

# Knoweb/Ginuma droplet inventory service  
export INVENTORY_URL_KNOWEB=http://<knoweb-droplet-ip>:8082
```

**Example**:
```bash
export INVENTORY_URL_MIDDENIYA=http://192.168.1.50:8082
export INVENTORY_URL_KNOWEB=http://192.168.1.100:8082
```

### Docker Compose (Optional)
If using docker-compose, add to service definition:
```yaml
environment:
  - INVENTORY_URL_MIDDENIYA=http://middeniya-inventory:8082
  - INVENTORY_URL_KNOWEB=http://knoweb-inventory:8082
```

---

## Workflow: Supplier Fetching

```
Ginum Service: GET /api/ginuma/suppliers/companies/{companyId}
    ↓
SupplierService.getSuppliersByCompanyId(companyId)
    ↓
    ├─ If companyId == 16 (Middeniya)
    │  └─ RestTemplate → inventory.url.middeniya/api/inventory/suppliers?companyId=16
    │     └─ Middeniya Droplet Inventory Service
    │
    └─ If companyId ≠ 16 (Knoweb/Other)
       └─ Feign Client (InventoryClient.getSuppliers)
          └─ Local Service Discovery (Knoweb Droplet)
```

---

## Logging & Monitoring

Tenant routing decisions are logged at INFO level:
```
INFO: Company ID 16 is Middeniya - routing to Middeniya droplet: http://192.168.1.50:8082
INFO: Company ID 1 routing to Knoweb droplet: http://192.168.1.100:8082
```

Errors are logged at ERROR level with detailed diagnostics:
```
ERROR: Error fetching suppliers from tenant URL {url} for company {id}: {exception}
```

---

## Testing

### Local Testing (Default Configuration)
Both Middeniya and Knoweb URLs point to localhost:8082:
```bash
# Test Middeniya company
curl http://localhost:8081/api/ginuma/suppliers/companies/16

# Test Knoweb company  
curl http://localhost:8081/api/ginuma/suppliers/companies/1
```

### Multi-Droplet Testing (Production-like)
1. Set environment variables pointing to actual droplet IPs
2. Restart ginum-service
3. Verify logs show correct URL routing based on company ID
4. Validate suppliers returned are from correct droplet

---

## Fallback Behavior

If Middeniya inventory service is unavailable:
- REST call logs error and returns empty list
- Frontend displays "No suppliers available" (graceful)
- Other company requests still work via Knoweb droplet (resilience)

---

## Future Enhancements

1. **Caching**: Add Spring Cache for frequently accessed suppliers
2. **Resilience4j**: Add circuit breaker + retry logic for cross-droplet calls
3. **Routing Config Service**: Store tenant-URL mappings in centralized config server
4. **Analytics**: Track cross-droplet call performance and latency
5. **Auto-discovery**: Use Eureka or Consul to dynamically discover tenant service URLs

---

## Files Modified

- `src/main/resources/application.properties` - Added tenant URL properties
- `src/main/java/com/example/GinumApps/GinumAppsApplication.java` - Added RestTemplate bean
- `src/main/java/com/example/GinumApps/service/SupplierService.java` - Implemented tenant-aware routing
- **Compilation Status**: ✅ BUILD SUCCESS (verified)

---

## Summary

Tenant-aware inventory routing is now operational. Company ID 16 (Middeniya) automatically routes to Middeniya droplet, while other companies use the local Knoweb/Ginuma droplet—all configured via environment variables for easy production deployment.
