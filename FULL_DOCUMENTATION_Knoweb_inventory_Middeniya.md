# FULL DOCUMENTATION — Knoweb_inventory_Middeniya

Path: `Knoweb_inventory_Middeniya/`

## High-level summary
An Inventory Management microservices workspace. Frontend is a Vite/React app; backend is multiple Spring Boot services (Product, Inventory, Order, Warehouse, Supplier, User, Notification) coordinated via Eureka service-discovery and an API Gateway. The repo includes Docker Compose for local deployment and SQL migration scripts for DB setup.

## Tech stack
- Frontend: React + Vite
- Backend: Spring Boot (Java 17), Maven
- Database: MySQL 8.0
- Discovery: Eureka (service-discovery)
- Gateway: API Gateway (api-gateway)
- Containerization: Docker Compose

## Top-level structure
- `.git/`, `.github/`, `.gitignore`
- `api-gateway/` — API gateway service
- `service-discovery/` — Eureka server
- `product-service/` — Product microservice
- `inventory-service/` — Inventory & Stock microservice
- `order-service/` — Order microservice
- `warehouse-service/` — Warehouse microservice
- `supplier-service/` — Supplier microservice
- `user-service/` — User / Authentication microservice
- `notification-service/` — Notification microservice
- `inventory-frontend/` — React + Vite frontend (port 5173)
- `docker-compose.middeniya.yml` — Compose file for local full-stack deployment
- SQL scripts: `init-db.sql`, `migrate-product-db.sql`, `insert-randiya-middeniya.sql`, `V1.0.0__Add_Stock_Constraints.sql`, and others
- Helper scripts: `build-all.ps1`, `start-all.ps1`, `start-frontend.ps1`, `fix-lombok.ps1`
- Docs: `README.md`, `NEGATIVE_STOCK_FIX_IMPLEMENTATION.md`, `FIX_VERIFICATION_REPORT.md`

## Important files to inspect before running
- `docker-compose.middeniya.yml` — service definitions, ports, environment variables
- `inventory-frontend/package.json`, `vite.config.js` — frontend dev/build commands and base path
- Each microservice `pom.xml` and `src/main/resources/application.properties` (or application-{profile}.yml) for DB and port settings
- `init-db.sql` and service-specific migration SQL files

## Prerequisites (local development)
- Java 17+ and Maven
- Node.js 18+
- MySQL 8.0+ (or use docker-compose MySQL)
- Docker & Docker Compose (optional but recommended)

## Local run (minimal)
1. Option A: Docker Compose (recommended for full-stack)
   - Edit `docker-compose.middeniya.yml` if needed (DB passwords, volumes).
   - Run:
```powershell
docker-compose -f docker-compose.middeniya.yml up -d
```
2. Option B: Run services individually (dev)
   - Start Service Discovery:
```bash
cd service-discovery
mvn spring-boot:run
```
   - Start API Gateway:
```bash
cd api-gateway
mvn spring-boot:run
```
   - Start each service:
```bash
cd product-service && mvn spring-boot:run
cd inventory-service && mvn spring-boot:run
# repeat for other services
```
   - Start frontend:
```bash
cd inventory-frontend
npm install
npm run dev
```

## Ports (as documented / typical)
- API Gateway: 8080
- Eureka (service-discovery): 8761
- Frontend (Vite dev): 5173
- Product, Inventory, Order, Warehouse, Supplier, User, Notification: 8081..8087 (see individual service configs)

## Database setup
- Use `init-db.sql` and service-specific migration SQL files to create tables and seed essential data.
- Example (MySQL):
```sql
CREATE DATABASE product_db;
CREATE DATABASE inventory_db;
CREATE DATABASE order_db;
CREATE DATABASE warehouse_db;
CREATE DATABASE supplier_db;
CREATE DATABASE user_db;
CREATE DATABASE notification_db;
```

## Docker notes
- `docker-compose.middeniya.yml` composes all services together.
- Ensure volumes and networks are set up as intended; check env variables for DB credentials.

## Key considerations / next steps
- Validate each service `application.properties` for correct DB URLs and ports.
- Run `build-all.ps1` to build all services (Windows PowerShell helper present).
- The repository contains several SQL migration files to reconcile negative stock fixes and valuation migrations — review `NEGATIVE_STOCK_FIX_IMPLEMENTATION.md` before running migrations in production.

---

*Generated from repository README and top-level files.*
