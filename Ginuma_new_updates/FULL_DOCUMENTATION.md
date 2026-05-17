# Ginuma New Updates Documentation

## 1. Overview

`Ginuma_new_updates` is a combined ERP/business application workspace with two main application roots:

- `ginum-backend-main`: a Spring Boot backend that exposes business APIs, authentication, reporting, and tenant/company management.
- `ginum-frontend-main`: a React + Vite frontend that provides the browser UI for the backend services.

The folder also includes SQL bootstrap scripts and a small VS Code workspace config folder for local development support.

## 2. Top-Level Contents

- `.vscode/`: editor/workspace settings.
- `create-company-16.sql`: SQL script that inserts a sample company record into `ginum_apps`.
- `ginum-backend-main/`: backend application source, configuration, and Dockerfile.
- `ginum-frontend-main/`: frontend application source, routing, UI components, and Dockerfile.

## 3. Backend Project: `ginum-backend-main`

### 3.1 Purpose

This is the server-side application for the Ginuma system. It is packaged as a WAR and runs on Java 17 with Spring Boot 3.4.2. The backend is responsible for:

- authentication and authorization,
- company and tenant setup,
- employee and HR management,
- suppliers, customers, sales, purchases, quotations, and projects,
- accounting and banking,
- payroll and inventory operations,
- reporting and document generation,
- email sending and email reading support.

### 3.2 Main Build and Runtime Stack

- Spring Boot 3.4.2
- Java 17
- Maven
- MySQL
- Spring Security
- JWT authentication
- Spring Cloud Eureka Client
- Spring Data JPA
- Lombok
- Validation API
- OpenAPI/Swagger UI
- iText PDF generation
- Spring Mail

### 3.3 Key Backend Entry Points

- `src/main/java/com/example/GinumApps/GinumAppsApplication.java`: main Spring Boot application.
- `src/main/java/com/example/GinumApps/config/DataInitializer.java`: creates a default super admin when the database is empty.
- `src/main/resources/application.properties`: database, JWT, mail, Swagger, and server port configuration.
- `src/main/resources/application.yml`: Eureka client and health endpoint configuration.
- `src/main/resources/data.sql`: seed data for countries, currencies, and the basic subscription package.

### 3.4 Backend Configuration Summary

Important runtime settings from `application.properties` and `application.yml`:

- Backend port: `8081`
- Database URL default: `jdbc:mysql://localhost:3306/ginum_apps?createDatabaseIfNotExist=true`
- Default DB username: `root`
- JPA schema mode: `update`
- SQL initialization: enabled
- Swagger UI path: `/swagger-ui.html`
- API docs path: `/v3/api-docs`
- Eureka default zone: `http://localhost:8761/eureka/`

Mail settings are also configured for Gmail SMTP/IMAP, which indicates the backend can send mail and read inbox messages.

### 3.5 Backend Domain Areas

The source tree shows a wide business domain surface. The main areas include:

- authentication and user access: JWT filters, user details service, login DTOs, password reset flows,
- company and tenant management: company registration, tenant setup, provisioning, synchronization,
- HR: employees, designations, departments, salaries, payroll,
- accounting: accounts, journal entries, money transactions, bank accounts, bank reconciliation,
- inventory and purchasing: items, stock levels, inventory transactions, purchase orders,
- sales and customer operations: customers, sales orders, quotations, invoices, aged receivables,
- supplier operations: suppliers, purchases, aged payables,
- reporting: trial balance, income statement, balance sheet, cashflow, revenue, general ledger, dashboard statistics,
- notifications and communications: email services, app notifications, incoming mail reader,
- project tracking: project entities, summaries, and controller/service support.

### 3.6 Dockerization

`ginum-backend-main/Dockerfile` uses a multi-stage build:

- build stage: Eclipse Temurin 17 JDK with Maven installed,
- runtime stage: Eclipse Temurin 17 JRE,
- exposed port: `8081`,
- launch command: `java -jar /app/app.bin`.

This suggests the backend is intended to run as a containerized service in production or staging.

## 4. Frontend Project: `ginum-frontend-main`

### 4.1 Purpose

This is the browser-facing application for the Ginuma system. It is a Vite-based React app that provides the UI for login, dashboards, forms, lists, reports, and operational workflows.

### 4.2 Main Build and Runtime Stack

- React 18
- Vite 6
- React Router DOM
- Material UI
- Emotion
- Styled Components
- Framer Motion
- Chart.js and React Chart.js 2
- Axios
- SweetAlert2

### 4.3 Frontend Entry Points

- `src/main.jsx`: application bootstrap.
- `src/App.jsx`: top-level application shell.
- `src/routes/AppRouter.jsx`: route definitions.
- `src/utils/api.js`: API helper layer.
- `vite.config.js`: build/dev configuration.

### 4.4 Frontend Routing Overview

The router shows three major route groups:

- public routes:
  - `/` redirects to `/sso-login`,
  - `/sso-login` loads the SSO receiver,
  - `/auth/logout` handles global logout.
- super-admin routes:
  - `/super-admin/dashboard`,
  - `/super-admin/companies`,
  - `/super-admin/requests`,
  - `/super-admin/reset-password`.
- protected application routes under `/app`:
  - dashboard and company profile,
  - employee and HR screens,
  - supplier and customer workflows,
  - accounts and bank flows,
  - departments and designations,
  - payroll screens,
  - reporting views,
  - quotations,
  - users,
  - projects,
  - transactions,
  - inventory item management,
  - edit requests.

### 4.5 Frontend Base Path and Development Port

`vite.config.js` sets the frontend base path to `/account/`. That means the app expects to be served beneath that subpath in production.

The dev server is configured to run on port `5176`, and it opens `/account/ginum-login` when started locally.

### 4.6 Frontend UI Structure

The file tree shows a feature-rich UI split into components and pages, including:

- auth and SSO receiver components,
- super-admin dashboards and company management,
- main application layout and sidebar/navigation components,
- customer and supplier screens,
- accounting and transaction components,
- bank and reconciliation components,
- reporting components,
- payroll, employee, department, and user management,
- inventory item management.

This structure indicates the frontend is designed as a modular ERP interface rather than a single-purpose dashboard.

### 4.7 Dockerization

`ginum-frontend-main/Dockerfile` uses a multi-stage build:

- build stage: Node 22,
- runtime stage: Nginx Alpine,
- build output copied to `/usr/share/nginx/html/account`,
- custom Nginx config loaded from `nginx.conf`,
- exposed port: `80`.

This matches the `/account/` base path used by the Vite config.

## 5. Database Bootstrap and Seed Data

### 5.1 `data.sql`

The backend seed file populates:

- countries,
- currencies,
- a default subscription package.

### 5.2 `create-company-16.sql`

This SQL script inserts a company record with:

- `company_id = 16`,
- company name `Company16`,
- category `IT_AND_TECHNOLOGY`,
- active status,
- role `COMPANY`.

It is intended as a convenience script for setting up a sample tenant/company in `ginum_apps`.

## 6. How The Pieces Fit Together

1. The backend boots on port `8081`, connects to MySQL, loads seed data, and registers with Eureka if that service is available.
2. The backend also creates a default super admin if the admin table is empty.
3. The frontend runs on Vite in development or behind Nginx in production and talks to the backend via API calls.
4. The frontend routing is mounted under `/account/`, so deployment must preserve that base path.
5. The SQL scripts provide startup data and sample company setup for local or test environments.

## 7. Local Run Summary

### Backend

- Build: `mvn clean package`
- Run: start the Spring Boot app on port `8081`

### Frontend

- Install dependencies: `npm install`
- Development: `npm run dev`
- Production build: `npm run build`

### Containerized Run

- Backend image is built from `ginum-backend-main/Dockerfile`.
- Frontend image is built from `ginum-frontend-main/Dockerfile`.

## 8. Notes And Observations

- The backend repository contains a broad set of controllers, services, repositories, DTOs, and models, which suggests the application is already feature complete across several ERP domains.
- The frontend routing shows separate experiences for super-admin users and regular application users.
- The presence of Eureka, JWT, mail, and PDF generation indicates the backend is not only CRUD-oriented but also service-integrated and workflow-heavy.

## 9. Quick Reference

- Backend root: `ginum-backend-main`
- Frontend root: `ginum-frontend-main`
- Backend port: `8081`
- Frontend dev port: `5176`
- Frontend base path: `/account/`
- Swagger UI: `/swagger-ui.html`
- API docs: `/v3/api-docs`
