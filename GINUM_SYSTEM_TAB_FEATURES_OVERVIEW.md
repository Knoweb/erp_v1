# Ginum System Tab Features Overview

## Scope
This document provides a complete overview of the tabs and functional sections in the current Ginum system UI, with the technologies used to build and run them.

Primary codebases analyzed:
- `Ginuma_new_updates/ginum-frontend-main`
- `Ginuma_new_updates/ginum-backend-main`

---

## 1) Platform Architecture and Technologies

### Frontend
- React 18 SPA
- Vite 6 build/dev tooling
- React Router (route-driven app shell)
- Axios + Fetch for API calls
- Tailwind CSS + utility-driven styling
- Icons: `react-icons`, `lucide-react`, `@heroicons/react`
- Charts: `chart.js` + `react-chartjs-2`
- UI libraries present: MUI (`@mui/material`), Headless UI, styled-components, framer-motion
- Alerts/confirmations: SweetAlert2 wrapper (`Alert` component)

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/package.json`
- `Ginuma_new_updates/ginum-frontend-main/src/utils/api.js`

### Backend
- Spring Boot 3.4.2 (WAR packaging)
- Java 17
- Spring Data JPA + MySQL
- Spring Security + JWT (`jjwt`)
- Bean validation (`spring-boot-starter-validation`)
- OpenAPI docs (`springdoc-openapi`)
- Spring Cloud:
  - Eureka client
  - OpenFeign for inter-service calls
- Mail support + iText7 for PDF generation

Evidence:
- `Ginuma_new_updates/ginum-backend-main/pom.xml`
- `Ginuma_new_updates/ginum-backend-main/src/main/java/com/example/GinumApps/controller`

### Navigation Model
- Sidebar-driven main app layout (`MainLayout`)
- `navigation.js` defines visible tab structure and section groups
- `AppRouter.jsx` binds routes to page components

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/config/navigation.js`
- `Ginuma_new_updates/ginum-frontend-main/src/routes/AppRouter.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/Sidebar/Sidebar.jsx`

---

## 2) Sidebar Sections and Tabs (Current Ginum)

### DASHBOARD
- Dashboard

### BUSINESS & OPERATIONS
- Accounts Payable (Suppliers)
  - All Suppliers
  - Purchases
  - Create Purchase
  - Aged Payables
- Accounts Receivable (Customers)
  - Customers
  - Sales
  - Create Sale
  - Aged Receivables

### FINANCE & ACCOUNTING
- Transactions
  - Create Transactions
- Bank Statement
  - Bank Reconciliation
  - Receive Money
  - Spend Money
- Accounts
  - All Accounts
  - New Account

### REPORTS & DOCUMENTATION
- Reports
  - Balance Sheet
  - Income Statement
  - Trial Balance
  - Cashflow
  - General Ledger

### USER MANAGEMENT
- Users
  - All Users
  - New User
- Requests

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/config/navigation.js`

---

## 3) Tab-by-Tab Feature Overview

## 3.1 Dashboard
- Route: `/app/dashboard`
- Main component: `DashboardPage`
- Core features:
  - 30-day KPI cards (Revenue, Expenses, Net Profit)
  - Trend analytics charts (Line, Bar, Doughnut)
  - Top clients ranking and sales contribution view
  - Recent transaction feed with type badges
  - Cross-app navigation button for ecosystem switching
- APIs:
  - `GET /api/companies/{companyId}/dashboard/stats`
- Technologies:
  - `react-chartjs-2`, `chart.js`, React hooks

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/pages/Dashboard/DashboardPage.jsx`

## 3.2 Accounts Payable (Suppliers)
- Routes:
  - `/app/supplier/all`
  - `/app/supplier/purchase/all`
  - `/app/supplier/purchase/new`
  - `/app/supplier/aged-payables`
- Core features:
  - Supplier directory with search/filter
  - Read-only supplier master view in Finance service
  - Purchase order list with status (Paid/Partially Paid/Unpaid)
  - Purchase creation flow with:
    - Line items/service mode
    - Tax breakdown
    - Freight, paid amount, due balance
    - Auto-generated PO and supplier invoice numbers
  - Supplier aging analytics (Aged Payables)
- APIs:
  - `GET /api/ginuma/suppliers/companies/{companyId}`
  - `GET /api/{companyId}/purchase-orders`
  - `POST /api/{companyId}/purchase-orders`
  - `GET /api/{companyId}/purchase-orders/next-po-number`
  - `GET /api/{companyId}/purchase-orders/next-invoice-number`
- Technologies:
  - Dynamic form arrays, modal workflows, account context filtering

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/supplier/SuppliersList.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/supplier/AllPurchases.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/supplier/CreatePurchase.jsx`

## 3.3 Accounts Receivable (Customers)
- Routes:
  - `/app/customer/all`
  - `/app/customer/sales/all`
  - `/app/customer/sales/new`
  - `/app/customer/aged-receivables`
- Core features:
  - Customer list with live search and profile modal
  - Read-only customer master in Finance service
  - Sales order listing, creation, and detail navigation
  - Balance due visibility and receivables aging
- APIs:
  - `GET /api/customers/companies/{companyId}`
  - `GET /api/sales-orders/company/{companyId}`
  - Sales order create/view/pay endpoints (through sales routes)
- Technologies:
  - Table-driven list views, modal detail panes, filtered query UX

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/customer/CustomersList.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/customer/AllSales.jsx`

## 3.4 Transactions
- Routes:
  - `/app/transactions/all`
  - `/app/transactions/new`
- Core features:
  - Journal entry listing with totals and type labels
  - General Journal creation with multi-line debit/credit entries
  - Balance validation (debit must equal credit)
  - Auto reference number generation and entry metadata
- APIs:
  - `GET /api/companies/{companyId}/journal-entries`
  - `POST /api/companies/{companyId}/journal-entries`
- Technologies:
  - Double-entry transaction logic, inline row expansion, validation guards

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/transactions/AllTransactions.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/transactions/GeneralJournalTransaction.jsx`

## 3.5 Bank Statement
- Routes:
  - `/app/bank/reconsilation`
  - `/app/bank/receive-money`
  - `/app/bank/spend-money`
- Core features:
  - Bank reconciliation:
    - Load statement by account/date
    - Reconciled/uncleared transaction toggling
    - Difference tracking between statement and system balance
  - Money transactions:
    - Spend/Receive workflows
    - Supplier/Customer/Employee/Other payee models
    - Payment against PO/SO directly
    - Payment method, reference, description, deletion
- APIs:
  - `GET /api/companies/{companyId}/reports/bank-reconciliation`
  - `POST /api/companies/{companyId}/reports/bank-reconciliation/mark-reconciled`
  - `GET /api/companies/{companyId}/money-transactions/type/{type}`
  - `POST /api/companies/{companyId}/money-transactions`
  - `POST /api/{companyId}/purchase-orders/{purchaseOrderId}/pay`
  - `POST /api/sales-orders/company/{companyId}/pay/{salesOrderId}`
- Technologies:
  - Reconciliation state engine + transactional posting forms

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/bank/BankReconsilation.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/bank/MoneyTransaction.jsx`

## 3.6 Accounts
- Routes:
  - `/app/account/all`
  - `/app/account/new`
- Core features:
  - Chart-of-accounts listing
  - New account creation and categorization
  - Context-aware account filtering reused across transactions, bank, purchases, sales
- APIs:
  - `GET /api/companies/{companyId}/accounts`
  - Account create/update endpoints via account forms
- Technologies:
  - Reusable account forms + account context filtering helpers

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/routes/AppRouter.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/account`
- `Ginuma_new_updates/ginum-frontend-main/src/utils/accountFilters.ts`

## 3.7 Reports
- Routes:
  - `/app/reports/balance-sheet`
  - `/app/reports/income-statement`
  - `/app/reports/trial-balance`
  - `/app/reports/cashflow`
  - `/app/reports/general-ledger`
- Core features:
  - Date-parameterized financial statements
  - Accounting integrity checks (example: balance sheet balanced/out-of-balance state)
  - Printable/export-oriented report UIs
- APIs:
  - `/api/companies/{companyId}/reports/*` family
- Technologies:
  - Data tables, print/export controls, currency formatting

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/reports/BalacenSheet.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/reports`

## 3.8 Users
- Routes:
  - `/app/users/all`
  - `/app/users/new`
- Core features:
  - User listing with search
  - Role updates per user
  - User deletion with confirmations
  - New user creation flow
- APIs:
  - `GET /api/ginuma/users/{companyId}`
  - `PUT /api/ginuma/users/{companyId}/{userId}`
  - `DELETE /api/ginuma/users/{companyId}/{userId}`
  - `POST /api/ginuma/users/{companyId}`
- Technologies:
  - Role management UI, confirm dialogs, token-based fetch

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/users/AllUsers.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/components/users/AddUserForm.jsx`

## 3.9 Requests
- Route: `/app/edit-requests`
- Core features:
  - Edit request queue view
  - Status tracking (`PENDING`, `APPROVED`, `REJECTED`)
  - Manual refresh and timeline presentation
- APIs:
  - `GET /api/companies/{companyId}/edit-requests`
- Technologies:
  - Status badge system + lightweight workflow monitor

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/components/requests/EditRequests.jsx`

## 3.10 Settings/Profile (Routed outside sidebar list but in app shell)
- Routes:
  - `/app/profile`
  - `/app/settings`
- Core features:
  - Company profile management
  - Settings sections:
    - Company Information
    - Taxes
    - Advanced settings (includes reset password flow)
- Technologies:
  - URL state sync with query params (`?section=...`)

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/pages/CompanyProfile/CompanyProfile.jsx`
- `Ginuma_new_updates/ginum-frontend-main/src/pages/SettingsPage/SettingsPage.jsx`

---

## 4) Security, Session and Integration Notes
- Token injection via Axios interceptor from local/session storage
- Auto cleanup and redirect on 401/403
- Relative API base path (`/ginuma-api`) to work behind reverse proxy/Nginx
- SSO receiver + global logout route for cross-app auth flow
- Inter-service integrations enabled in backend via Eureka + Feign

Evidence:
- `Ginuma_new_updates/ginum-frontend-main/src/utils/api.js`
- `Ginuma_new_updates/ginum-frontend-main/src/routes/AppRouter.jsx`
- `Ginuma_new_updates/ginum-backend-main/pom.xml`

---

## 5) Backend Module Coverage Behind Tabs
Main backend controllers supporting tab modules include:
- `DashboardController`
- `SupplierController`, `AgedPayablesController`
- `CustomerController`, `AgedReceivablesController`, `SalesOrderController`
- `PurchaseOrderController`
- `JournalEntryController`, `MoneyTransactionController`
- `BankAccountController`
- `AccountController`
- `ReportController`
- `AppUserController`
- `CompanyController`, `CompanyLogoController`

Evidence:
- `Ginuma_new_updates/ginum-backend-main/src/main/java/com/example/GinumApps/controller`

---

## 6) Conclusion
The current Ginum system is a finance-focused ERP surface organized around payables, receivables, journal transactions, bank operations, accounts, reporting, and user governance. It uses a modern React/Vite frontend and Spring Boot backend with JWT security, relational accounting domain models, and cloud-ready service integration (Eureka + Feign).
