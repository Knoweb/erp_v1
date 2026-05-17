# Pirisa-Finel (Pirisa HRM) Tab Features Overview

## Scope
This document provides a complete overview of the sidebar tabs and pages visible in the Pirisa HRM frontend, with feature details, API dependencies, and the technologies used to implement them.

Primary implementation analyzed:
- `pirisa-finel/PirisaHR-main` (frontend)
- `pirisa-finel/HRM-main` (backend)

---

## 1) Platform Architecture and Technologies

### Frontend
- React 18 + TypeScript
- Vite (development/build tooling)
- Tailwind CSS for styling
- React Router for route-based navigation
- Axios for HTTP calls
- State: React Context API (global state) + local component state
- Charts: Recharts
- UI/UX: Custom component library, Lucide icons, React Toastify, React Select
- Payments: Stripe React integration
- PDF/Export: jsPDF + AutoTable
- Websockets/STOMP: `@stomp/stompjs` + SockJS client (real-time features)

Evidence source:
- `pirisa-finel/PirisaHR-main/package.json`
- `pirisa-finel/FRONTEND.md`

### Backend
- Spring Boot 2.7.x (Java 11)
- Spring Data JPA (MySQL / MariaDB)
- Spring Security with JWT
- Spring Web (REST controllers)
- Stripe Java SDK for payments
- WebSocket support (Spring WebSocket)
- Eureka client available (service discovery integrations present)

Evidence source:
- `pirisa-finel/HRM-main/pom.xml`
- `pirisa-finel/BACKEND.md`

### Service Topology
- Single backend monolith (`HRM-main`) providing HR functionality (employees, attendance, payroll, leave, performance)
- Frontend SPA (`PirisaHR-main`) consumes backend REST APIs at `VITE_API_BASE_URL` (default `http://localhost:8080/api`)
- External integrations: Stripe (payments), Email provider, File storage

---

## 2) Sidebar Tabs (High-level)

Based on `PirisaHR-main/src/pages` and `Sidebar` layout, the main navigation covers:
- Dashboard
- Employee Management
- Attendance
- Payroll (PayRole)
- Leave Management
- Performance / Appraisals
- Reports
- Company Profile / Administration
- Settings
- Notifications / Alerts
- (Auth) Login / Register pages

---

## 3) Tab-by-Tab Feature Overview

### 3.1 Dashboard
- Route: `/dashboard` (or `/` redirect)
- Purpose: Company-level and employee-level KPIs and quick actions.
- Features:
  - KPI cards (employees, active payroll cycles, pending leave requests, today attendance)
  - Charts for trends (attendance, payroll costs, headcount)
  - Quick actions: mark attendance, create employee, run payroll
  - Real-time notifications panel via WebSocket/STOMP
- APIs used:
  - `GET /api/dashboard` (aggregated KPIs)
  - `GET /api/attendance/today` (live attendance)
- Technologies:
  - Recharts for charts
  - WebSocket/SockJS for live events

### 3.2 Employee Management
- Route: `/employee/*` (list, add, edit, profile)
- Purpose: Full lifecycle management of employee records.
- Features:
  - Employee list with search, filters, pagination
  - Create / Edit employee forms with validation
  - Profile page with documents and profile image upload
  - Import/export (Excel/PDF)
- APIs used:
  - `GET /api/employee/all`, `GET /api/employee/{id}`
  - `POST /api/employee/create`, `PUT /api/employee/update/{id}`
  - File upload endpoints for documents/profile images
- Technologies:
  - jsPDF + AutoTable for PDF exports
  - Tailwind form components and client-side validation

### 3.3 Attendance
- Route: `/attendance/*`
- Purpose: Marking and tracking attendance; reporting and calendar views.
- Features:
  - Manual attendance marking and bulk operations
  - Attendance calendar and history
  - Attendance reports and export
  - Support for corrections and additional attendance entries
- APIs used:
  - `GET /api/attendance/all`, `POST /api/attendance/mark`
  - `GET /api/attendance/employee/{id}`
- Technologies:
  - Calendar UI components, date-fns for date handling
  - WebSocket events for live attendance updates

### 3.4 Payroll (PayRole)
- Route: `/payrole/*`
- Purpose: Salary calculation, payslip generation and payroll runs.
- Features:
  - Create payroll runs and compute salary components
  - Allowance/bonus management and tax calculations
  - Payslip generation (PDF) and email delivery
  - Payroll reports by period and employee
- APIs used:
  - `GET /api/payrole/all`, `POST /api/payrole/create`
  - Payslip generation endpoints and file export
- Technologies:
  - Server-side salary computation in Spring services
  - jsPDF for payslip PDFs
  - Stripe (if used for payments/registration/subscription flows)

### 3.5 Leave Management
- Route: `/leave/*`
- Purpose: Requesting, approving, and tracking leaves.
- Features:
  - Submit leave requests, multi-level approval workflows
  - Leave balances and policy management
  - Leave calendar and aggregated views
- APIs used:
  - `POST /api/leave/request`, `GET /api/leave/company`, approval endpoints
- Technologies:
  - Role-based UI flows, React Select for policy selection

### 3.6 Performance / Appraisals
- Route: `/performance/*` or `/performance-appraisal`
- Purpose: Employee evaluations, question-based appraisals and reports.
- Features:
  - Create evaluation forms and collect responses
  - Score aggregation and appraisal cycles
  - Performance reports and history per employee
- APIs used:
  - `GET/POST /api/performance/*`
- Technologies:
  - Custom form components, multi-step workflows

### 3.7 Reports
- Route: `/reports/*`
- Purpose: Consolidated reporting across payroll, attendance and performance.
- Features:
  - Pre-built payroll/attendance/performance reports
  - CSV/XLSX and PDF export
  - Filtered report generation by date ranges and departments
- APIs used:
  - `GET /api/reports/payroll`, `GET /api/reports/attendance` etc.
- Technologies:
  - Server-side report generation support, client-side export helpers (`xlsx`, `jsPDF`)

### 3.8 Company Profile / Administration
- Route: `/companyProfile` or `/company-settings`
- Purpose: Manage company metadata, branding, departments and designations.
- Features:
  - Company profile editing (name, address, timezone)
  - Department and designation management
  - Company settings (email, currency, currency formatting)
  - Logo upload and branding
- APIs used:
  - `GET/PUT /api/company`, `GET/POST /api/department`, `GET/POST /api/designation`
- Technologies:
  - File upload (multipart) and server-side storage

### 3.9 Notifications / Alerts
- Route: integrated into header / dashboard
- Purpose: Provide real-time and stored notifications for users.
- Features:
  - Toast notifications for actions
  - Persistent notification listing with read/unread state
  - Webhook-style handling for external events (payments, approvals)
- APIs used:
  - `GET /api/notifications`, `POST /api/notifications/markAsRead`
- Technologies:
  - React Toastify, WebSocket / STOMP for push notifications

### 3.10 Settings & Misc
- Route: `/settings` (global settings)
- Purpose: Application-level settings including roles, permissions and integrations.
- Features:
  - Role and permission management
  - Stripe API key and subscription management
  - Integration toggles and feature flags
- APIs used:
  - `GET/POST /api/settings`, integration endpoints for Stripe

---

## 4) Security, Session and Multi-tenant Controls
- JWT authentication for API access; Axios interceptor injects `Authorization: Bearer <token>`.
- Role-based route guards and server-side role checks (Admin, Manager, Employee roles).
- CORS configured to allow frontend dev hosts (e.g., `localhost:5174`).
- Sensitive keys (Stripe secret, DB credentials, JWT secret) configured via environment variables and not checked into source.

Evidence source:
- `pirisa-finel/BACKEND.md` (JWT / security), `pirisa-finel/FRONTEND.md` (interceptors, protected routes)

---

## 5) Run & Dev Notes
- Frontend dev server:

```bash
cd pirisa-finel/PirisaHR-main
npm install
npm run dev    # default host, port 5174 (see Vite config)
```

- Backend run:

```bash
cd pirisa-finel/HRM-main
mvn spring-boot:run
# or
mvnw spring-boot:run
```

- Environment variables (example `.env`):
  - `VITE_API_BASE_URL=http://localhost:8080/api`
  - `VITE_STRIPE_PUBLIC_KEY=pk_test_...`
  - Backend: `SPRING_DATASOURCE_URL`, `SPRING_SECURITY_JWT_SECRET`, `STRIPE_SECRET_KEY`

---

## 6) Conclusion
Pirisa HRM is a full-featured HR platform with a React+TypeScript SPA and a Spring Boot Java 11 backend. The sidebar tabs map to natural HR domains (employees, attendance, payroll, leave, performance and reports). The frontend relies on modern tooling (Vite, Tailwind) and integrates with backend REST APIs, Stripe payments, and WebSocket for real-time flows.

If you want, I can:
- Add a per-component file map (page → component file paths)
- Produce an API-to-UI trace showing exact endpoints used per UI action
- Generate a printable PDF of this document

