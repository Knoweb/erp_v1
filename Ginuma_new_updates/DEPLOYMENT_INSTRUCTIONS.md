# 🚀 Customer Sync Feature - Deployment Guide

## ✅ What's Been Completed

### Backend Changes (Java Spring Boot)
1. **CustomerSyncService.java** - Syncs customers from Middeniya → Ginuma database
   - Fetches from: `http://178.128.221.122:3002/inventory-api/api/customers/organization/{orgId}`
   - Detects duplicates and updates existing customers
   - Returns: `{status, created, updated, total, errors}`

2. **CustomerController.java** - New REST endpoints
   - `POST /api/customers/sync/middeniya/{companyId}/{orgId}` - Trigger sync
   - `GET /api/customers/debug/middeniya/{orgId}` - Test API connectivity

3. **CustomerRepository.java** - New query method
   - `findByNameAndCompany_CompanyId()` - Duplicate detection

### Frontend Changes (React)
1. **syncApi.js** - New utility module
   - `syncCustomersFromMiddeniya(companyId, orgId)` - Blocking sync
   - `silentSyncCustomers(companyId, orgId)` - Non-blocking sync

2. **App.jsx** - Auto-sync on app load
   - Triggers `silentSyncCustomers()` on mount
   - Syncs data automatically without blocking UI

3. **CustomersList.jsx** - Manual sync button
   - Green "Sync Data" button with loading state
   - Shows success message: "✅ Sync completed: X created, Y updated"
   - Refreshes customer list after sync

4. **customerApi.js** - Fixed VAT filtering
   - Properly filters out enum values ("EXCLUSIVE", "INCLUSIVE", etc.)
   - Shows "No tax info" instead of tax type

---

## 📋 Deployment Steps

### Step 1: Deploy Backend JAR
```bash
# On DigitalOcean droplet (SSH as root)
cd /app/ginuma-system

# Rebuild and redeploy
docker compose up -d --force-recreate ginum-backend

# Verify deployment
docker compose logs ginum-backend | grep "Started\|Error"
```

### Step 2: Test Sync Endpoint
```bash
# Get authorization token first from login
TOKEN=$(curl -s -X POST http://167.71.206.166:3001/ginuma-api/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  | jq -r '.token')

# Test sync endpoint
curl -X POST "http://167.71.206.166:3001/ginuma-api/api/customers/sync/middeniya/16/16" \
  -H "Authorization: Bearer $TOKEN"

# Test debug endpoint (check API connectivity)
curl -X GET "http://167.71.206.166:3001/ginuma-api/api/customers/debug/middeniya/16" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 3: Deploy Frontend
```bash
# Updated frontend is already built at:
# ginum-frontend-main/dist/

# Copy to production web server (nginx)
docker compose cp ginum-frontend-main/dist/. ginum-frontend:/usr/share/nginx/html/
```

### Step 4: Clear Browser Cache
- Press F12 (Developer Tools)
- Right-click refresh button → "Empty cache and hard refresh"
- Or: `Ctrl+Shift+Delete` to clear browser cache

---

## 🧪 Testing the Feature

### Test 1: Auto-Sync on App Load
1. Open Ginuma app: http://167.71.206.166:3001/
2. Open browser console: F12 → Console tab
3. Look for: `✅ Customer sync completed: X created, Y updated`
4. Refresh page - data should persist

### Test 2: Manual Sync Button
1. Navigate to Customers page
2. Click green "Sync Data" button
3. Should show success: `✅ Sync completed: X created, Y updated`
4. Customer list should refresh

### Test 3: Verify VAT Display
1. Check Customers list table
2. Customer VAT should show as:
   - Actual VAT number (if exists): `VAT: 221234567`
   - Or empty: `No tax info` (NOT "EXCLUSIVE")
3. Click View → VAT number should display in detail modal

---

## 🔍 Monitoring & Debugging

### Check Backend Logs
```bash
docker compose logs ginum-backend -f | grep -i "sync\|middeniya\|customer"
```

### Test Middeniya API Connection
```bash
# From DigitalOcean droplet
curl -X GET "http://178.128.221.122:3002/inventory-api/api/customers/organization/16" \
  -H "Authorization: Bearer <token>" \
  -H "x-org-id: 16"
```

### Check Database
```bash
# Connect to Ginuma MySQL
mysql -u root -p ginuma_db -e "SELECT name, vat, phoneNo FROM customers LIMIT 10;"
```

---

## 📊 Expected Results After Sync

**Before sync:**
- Ginuma customers: 1 (only Dumindu Dulanjaya)
- VAT field: "No tax info" (was showing "EXCLUSIVE")

**After sync:**
- Ginuma customers: 1+ (populated from Middeniya)
- VAT field: Shows actual VAT number or "No tax info"
- Phone/Email: Displays from synced data

---

## ⚠️ Troubleshooting

### Problem: Sync returns "0 created, 0 updated"
**Solution:**
1. Check Middeniya API connectivity: Use debug endpoint
2. Verify orgId is correct (should be 16)
3. Check backend logs for errors
4. Verify authorization token is valid

### Problem: VAT still showing "EXCLUSIVE"
**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+Shift+R`
3. Verify frontend dist was updated
4. Check browser console for errors

### Problem: Sync button not appearing
**Solution:**
1. Verify frontend build completed: check `ginum-frontend-main/dist/` exists
2. Clear cache and refresh
3. Check browser console for JavaScript errors

---

## 🔐 Environment Notes

- **Ginuma API:** http://167.71.206.166:3001/ginuma-api
- **Middeniya API:** http://178.128.221.122:3002/inventory-api
- **Company ID:** 16 (Randiya Engineering)
- **Org ID:** 16 (Middeniya organization)
- **DB:** Separate databases (Ginuma & Middeniya inventory)

---

## 📝 Files Modified

```
✅ Backend:
  - src/main/java/com/example/GinumApps/service/CustomerSyncService.java (NEW)
  - src/main/java/com/example/GinumApps/controller/CustomerController.java (MODIFIED)
  - src/main/java/com/example/GinumApps/repository/CustomerRepository.java (MODIFIED)

✅ Frontend:
  - src/utils/syncApi.js (NEW)
  - src/utils/customerApi.js (MODIFIED - VAT filtering)
  - src/components/customer/CustomersList.jsx (MODIFIED - sync button + VAT display)
  - src/App.jsx (MODIFIED - auto-sync on mount)
```

---

**Status:** Ready for production deployment ✅
