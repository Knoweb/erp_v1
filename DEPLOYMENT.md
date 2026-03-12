# ERP System - DigitalOcean Deployment Guide

## 📋 Overview

This repository contains a complete microservices-based ERP system with:
- **14 Spring Boot Backend Services** (Java 17)
- **4 React Frontend Applications**
- **MySQL Database** (Single instance with 12 databases)
- **Service Discovery** (Eureka)
- **API Gateway**

## 🏗️ Architecture

### Backend Services
1. **service-discovery** (Eureka) - Port 8761
2. **api-gateway** - Port 8080
3. **identity-service** - Port 8088
4. **ginuma-service** - Port 8081
5. **product-service** - Port 8092 (mapped from 8081)
6. **inventory-service** - Port 8082
7. **order-service** - Port 8083
8. **warehouse-service** - Port 8084
9. **supplier-service** - Port 8085
10. **user-service** - Port 8086
11. **notification-service** - Port 8087
12. **catalog-service** - Port 8089
13. **reporting-service** - Port 8090
14. **subscription-service** - Port 8091

### Frontend Applications
1. **knoweb-main** - Port 3000
2. **ginuma-frontend** - Port 3001
3. **inventory-frontend** - Port 3002
4. **subscription-frontend** - Port 3003

### Databases
- **identity_db** - Identity & Authentication
- **subscription_db** - Subscription Management
- **ginum_apps** - Ginuma Application Data
- **product_db** - Product Catalog
- **inventory_db** - Inventory Management
- **order_db** - Order Processing
- **warehouse_db** - Warehouse Management
- **supplier_db** - Supplier Information
- **user_db** - User Management
- **notification_db** - Notifications
- **catalog_db** - Catalog Management
- **reporting_db** - Reports & Analytics

## 🚀 Deployment Setup

### Prerequisites

1. **DigitalOcean Droplet** with:
   - Ubuntu 20.04+ or Debian 11+
   - Minimum 8GB RAM (16GB recommended)
   - 4 vCPUs (8 recommended)
   - 100GB+ storage
   - Docker & Docker Compose installed

2. **Docker Hub Account** for hosting images

3. **GitHub Repository Secrets** (Settings → Secrets → Actions):
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Your Docker Hub password or access token
   - `DO_HOST` - DigitalOcean Droplet IP address
   - `DO_USERNAME` - SSH username (usually 'root' or 'ubuntu')
   - `DO_SSH_KEY` - Your private SSH key

### Step 1: Prepare DigitalOcean Droplet

SSH into your droplet and set up the environment:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Create application directory
sudo mkdir -p /app
cd /app

# Copy docker-compose.yml and init.sql to /app
# You can use scp, git clone, or manual upload
```

### Step 2: Configure Environment Variables

Create `.env` file in `/app` directory on your droplet:

```bash
cd /app
nano .env
```

Add your Docker Hub username:
```
DOCKER_USERNAME=your_dockerhub_username
```

### Step 3: Upload Required Files

Upload these files to `/app` on your droplet:
- `docker-compose.yml`
- `init.sql`
- `.env`

### Step 4: Configure GitHub Actions

1. Add all required secrets in GitHub repository settings
2. Push your code to the `main` branch
3. GitHub Actions will automatically:
   - Build all Docker images
   - Push them to Docker Hub
   - Deploy to DigitalOcean

### Step 5: Manual Deployment (Optional)

If you want to deploy manually without GitHub Actions:

```bash
# On your droplet
cd /app

# Pull all images
docker compose pull

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f api-gateway
```

## 🔧 Useful Commands

### Check Service Health
```bash
# Check all running containers
docker compose ps

# Check specific service logs
docker compose logs -f <service-name>

# Check Eureka Dashboard
curl http://localhost:8761

# Check API Gateway
curl http://localhost:8080/actuator/health
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart api-gateway

# Stop all services
docker compose down

# Start all services
docker compose up -d
```

### Database Management
```bash
# Access MySQL
docker exec -it mysql mysql -uroot -p1234

# Backup database
docker exec mysql sh -c 'exec mysqldump --all-databases -uroot -p1234' > backup.sql

# Restore database
docker exec -i mysql sh -c 'exec mysql -uroot -p1234' < backup.sql
```

### Cleanup
```bash
# Remove unused images
docker system prune -a

# View disk usage
docker system df

# Remove specific service
docker compose rm -f <service-name>
```

## 🔐 Security Recommendations

1. **Change Default Passwords**
   - Update MySQL root password in `docker-compose.yml` and `init.sql`
   - Update JWT secrets in application configurations

2. **Configure Firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp      # SSH
   sudo ufw allow 80/tcp      # HTTP
   sudo ufw allow 443/tcp     # HTTPS
   sudo ufw allow 8080/tcp    # API Gateway
   sudo ufw allow 8761/tcp    # Eureka (optional - can be internal only)
   ```

3. **Enable HTTPS**
   - Use Nginx reverse proxy with Let's Encrypt SSL certificates
   - Configure SSL termination at the gateway level

4. **Secure Docker Registry**
   - Use private Docker registry for production
   - Enable image scanning for vulnerabilities

## 📊 Monitoring

### Health Checks
- Eureka Dashboard: `http://your-ip:8761`
- API Gateway Health: `http://your-ip:8080/actuator/health`
- Individual Service Health: `http://your-ip:<port>/actuator/health`

### Frontend Access
- Knoweb Main: `http://your-ip:3000`
- Ginuma Frontend: `http://your-ip:3001`
- Inventory Frontend: `http://your-ip:3002`
- Subscription Frontend: `http://your-ip:3003`

## 🐛 Troubleshooting

### Services Not Starting
```bash
# Check service logs
docker compose logs <service-name>

# Check if Eureka is running first
docker compose logs service-discovery

# Check if MySQL is healthy
docker compose ps mysql
```

### Database Connection Issues
```bash
# Verify MySQL is running
docker exec -it mysql mysql -uroot -p1234 -e "SHOW DATABASES;"

# Check if databases were created
docker exec -it mysql mysql -uroot -p1234 -e "SHOW DATABASES;"
```

### Port Conflicts
```bash
# Check which ports are in use
sudo netstat -tulpn | grep LISTEN

# Stop conflicting services
docker compose down
```

### Out of Memory
```bash
# Check memory usage
docker stats

# Increase droplet size or add swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📝 Notes

1. **Port Conflict**: `ginuma-service` and `product-service` both use port 8081. In production, `product-service` is mapped to port 8092.

2. **Database Initialization**: The `init.sql` file runs only on first MySQL container creation. If databases already exist, the script will skip creation.

3. **Service Dependencies**: Services will wait for MySQL health check and Eureka to start before initializing.

4. **Volume Persistence**: MySQL data is persisted in `./mysql-data` directory on the host.

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Checks out code on push to `main` branch
2. Sets up Java 17 and Node.js 18
3. Builds all Spring Boot services (Maven)
4. Builds all React frontends (npm)
5. Creates Docker images for all services
6. Pushes images to Docker Hub
7. SSHs into DigitalOcean droplet
8. Pulls latest images
9. Restarts containers with zero downtime

## 📞 Support

For issues or questions:
1. Check service logs: `docker compose logs -f <service-name>`
2. Verify GitHub Actions workflow status
3. Check Docker Hub for image availability
4. Ensure all secrets are correctly configured

---

**Last Updated**: March 2026
**Version**: 1.0.0
