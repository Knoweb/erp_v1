# FULL DOCUMENTATION — pirisa-finel

Path: `pirisa-finel/`

## High-level summary
Pirisa is an HR Management System (Pirisa HRM) with a production deployment at `http://129.212.239.12`. It provides full HR capabilities including employee management, attendance, payroll, leave, performance, calendar/events, reporting, and Stripe payment integration.

## Tech stack
- Frontend: React 18 (TypeScript) + Vite
- Backend: Spring Boot (Java 11+), Spring Security, Spring Data JPA
- Database: MySQL / MariaDB
- CI/CD: GitHub Actions (automated deployment)
- Payments: Stripe integration

## Top-level structure
- `HRM-main/` — Backend Spring Boot application (controllers, service, model, repository, config, DTOs)
- `PirisaHR-main/` — Frontend React + TypeScript app (components, pages, api, context, utils)
- `docker-compose.yml` — Compose for running services locally (if configured)
- `BACKEND.md` — Backend-specific documentation
- `FRONTEND.md` — Frontend-specific documentation
- `README.md` — project overview and runtime instructions

## Live environment
- Production URL: http://129.212.239.12 (Frontend and Backend under `/api`)
- Production status: Live and operational (as of last README update)

## Prerequisites
- Java 11+
- Node.js 18+
- MySQL / MariaDB
- Maven 3.6+

## Quick start (development)
1. Backend
```bash
cd HRM-main
./mvnw spring-boot:run
```
2. Frontend
```bash
cd PirisaHR-main
npm install
npm run dev
```
3. Access
- Frontend dev: http://localhost:5174 (per README)
- Backend API: http://localhost:8080/api

## Important files
- Backend: `HRM-main/src/main/resources/application.properties` — DB and JWT/Stripe config
- Frontend: `PirisaHR-main/.env` (create) — `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLIC_KEY`
- `BACKEND.md` and `FRONTEND.md` contain deeper documentation — review before deploying.

## Security & Auth
- JWT-based authentication, role-based access control, password hashing, CORS config, and input validation.

## Testing
- Backend unit tests via Maven wrapper: `./mvnw test`
- Frontend tests via `npm run test` (if configured)
- E2E tests supported via Cypress (check repo for Cypress config)

## Deployment
- Docker Compose present for local/prod-like deployments.
- CI/CD: GitHub Actions (example workflow in README/BACKEND.md)

## Notes & Recommendations
- Review `BACKEND.md` and `FRONTEND.md` for environment variable examples and production deployment instructions.
- Confirm Stripe keys and mail server configs before deploying to production.
- Check `docker-compose.yml` for any extra services (reverse proxy, DB) and adjust volumes/ports.

---

*Generated from repository README and top-level files.*
