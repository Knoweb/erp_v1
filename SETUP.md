# 🚀 Deployment Files - Quick Setup Guide

## ✅ Files Created

### 1. CI/CD Pipeline
- **Location**: `.github/workflows/deploy.yml`
- **Purpose**: Automates building, pushing to Docker Hub, and deploying to DigitalOcean
- **Triggers**: Automatic on push to `main` branch

### 2. Production Configuration
- **docker-compose.yml**: Production deployment configuration (root directory)
- **init.sql**: MySQL database initialization script (root directory)
- **.env**: Environment variables file (root directory)
- **.env.example**: Template for environment variables

### 3. Missing Dockerfiles Created
- `Ginuma_new_updates/ginum-backend-main/Dockerfile`
- `knoweb main/Dockerfile`
- `Ginuma_new_updates/ginum-frontend-main/Dockerfile`
- `subscription-service/backend/Dockerfile`
- `subscription-service/frontend/Dockerfile`

### 4. Docker Ignore Files
- `.dockerignore` files created for all services missing them

### 5. Documentation
- **DEPLOYMENT.md**: Complete deployment guide with troubleshooting

---

## 📋 Pre-Deployment Checklist

### 1. GitHub Repository Secrets (Required)
Go to: **Repository Settings → Secrets and Variables → Actions → New repository secret**

Add these secrets:
```
DOCKER_USERNAME: your_dockerhub_username
DOCKER_PASSWORD: your_dockerhub_password_or_token
DO_HOST: your_droplet_ip (e.g., 142.93.xxx.xxx)
DO_USERNAME: root (or ubuntu)
DO_SSH_KEY: your_private_ssh_key_content
```

### 2. DigitalOcean Droplet Setup

**Recommended Specs:**
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 16GB (minimum 8GB)
- **CPU**: 8 vCPUs (minimum 4)
- **Storage**: 100GB SSD

**Install Docker on Droplet:**
```bash
# SSH into droplet
ssh root@your_droplet_ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Create app directory
sudo mkdir -p /app

# Set permissions
sudo chown -R $USER:$USER /app
```

### 3. Upload Files to Droplet

Transfer these files to `/app` directory on your droplet:
```bash
# From your local machine
scp docker-compose.yml root@your_droplet_ip:/app/
scp init.sql root@your_droplet_ip:/app/
scp .env root@your_droplet_ip:/app/
```

Or use Git:
```bash
# On droplet
cd /app
git clone your_repository_url .
```

### 4. Configure Environment Variables

**On your droplet**, edit the `.env` file:
```bash
cd /app
nano .env
```

Update:
```
DOCKER_USERNAME=your_actual_dockerhub_username
```

Save and exit (Ctrl+X, Y, Enter).

---

## 🚀 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

**Just push to main branch:**
```bash
git add .
git commit -m "Add deployment configurations"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build all 14 Spring Boot services
2. ✅ Build all 4 frontend applications
3. ✅ Create Docker images
4. ✅ Push to Docker Hub
5. ✅ SSH into your droplet
6. ✅ Pull latest images
7. ✅ Start all services

**Monitor Progress:**
- Go to: **GitHub Repository → Actions tab**
- Watch the workflow execution

### Method 2: Manual Deployment

**On your DigitalOcean droplet:**
```bash
cd /app

# Pull all images from Docker Hub
docker compose pull

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## 🔍 Verify Deployment

### 1. Check All Services Running
```bash
docker compose ps
```
All services should show "Up" status.

### 2. Check Eureka Dashboard
```
http://your_droplet_ip:8761
```
All microservices should be registered.

### 3. Check API Gateway
```
http://your_droplet_ip:8080/actuator/health
```
Should return `{"status":"UP"}`

### 4. Check Frontend Applications
- Knoweb Main: `http://your_droplet_ip:3000`
- Ginuma Frontend: `http://your_droplet_ip:3001`
- Inventory Frontend: `http://your_droplet_ip:3002`
- Subscription Frontend: `http://your_droplet_ip:3003`

### 5. Check Database
```bash
docker exec -it mysql mysql -uroot -p1234
SHOW DATABASES;
```
Should show all 12 databases.

---

## 📊 Services Overview

### Backend Services (14)
| Service | Port | Container | Database |
|---------|------|-----------|----------|
| service-discovery | 8761 | Eureka Server | None |
| api-gateway | 8080 | API Gateway | None |
| identity-service | 8088 | Identity/Auth | identity_db, subscription_db |
| ginuma-service | 8081 | Ginuma App | ginum_apps |
| product-service | 8092 | Products | product_db |
| inventory-service | 8082 | Inventory | inventory_db |
| order-service | 8083 | Orders | order_db |
| warehouse-service | 8084 | Warehouses | warehouse_db |
| supplier-service | 8085 | Suppliers | supplier_db |
| user-service | 8086 | Users | user_db |
| notification-service | 8087 | Notifications | notification_db |
| catalog-service | 8089 | Catalog | catalog_db |
| reporting-service | 8090 | Reports | reporting_db |
| subscription-service | 8091 | Subscriptions | subscription_db |

### Frontend Applications (4)
| Application | Port | Technology |
|-------------|------|------------|
| knoweb-main | 3000 | React + Vite |
| ginuma-frontend | 3001 | React + Vite |
| inventory-frontend | 3002 | React + Vite |
| subscription-frontend | 3003 | React + Vite |

### Database
| Service | Port | Databases |
|---------|------|-----------|
| mysql | 3306 | 12 databases (see init.sql) |

---

## 🔧 Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-gateway

# Last 100 lines
docker compose logs --tail=100 identity-service
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart user-service
```

### Update Services
```bash
# Pull latest images
docker compose pull

# Recreate containers
docker compose up -d --force-recreate
```

### Stop Services
```bash
# Stop all
docker compose down

# Stop but keep data
docker compose stop
```

### Clean Up
```bash
# Remove unused images
docker system prune -a -f

# View disk usage
docker system df
```

---

## ⚠️ Important Notes

1. **Port Conflict**: `ginuma-service` and `product-service` both use port 8081 internally. On the host, product-service is mapped to port 8092 to avoid conflict.

2. **Database Password**: Default password is `1234`. **Change this in production!**
   - Update in `docker-compose.yml` (MYSQL_ROOT_PASSWORD)
   - Update in `docker-compose.yml` (all service datasource passwords)

3. **First Time Setup**: MySQL initialization takes ~30 seconds. Services may restart once while waiting for database.

4. **Health Checks**: MySQL has health checks. Services wait for MySQL to be healthy before starting.

5. **Data Persistence**: MySQL data is stored in `./mysql-data` directory on host. Don't delete this directory!

---

## 🐛 Troubleshooting

### Services Keep Restarting
```bash
# Check logs
docker compose logs <service-name>

# Common issue: MySQL not ready
docker compose logs mysql

# Solution: Wait 1-2 minutes for MySQL to initialize
```

### Can't Connect to Database
```bash
# Verify MySQL is running
docker compose ps mysql

# Check MySQL logs
docker compose logs mysql

# Test connection
docker exec -it mysql mysql -uroot -p1234
```

### Out of Memory
```bash
# Check memory usage
docker stats

# Add swap space (on droplet)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port Already in Use
```bash
# Find what's using the port
sudo netstat -tulpn | grep :8080

# Stop the conflicting service
```

### GitHub Actions Fails
1. Check secrets are correctly set
2. Verify SSH key has no passphrase
3. Check Docker Hub credentials
4. Review workflow logs in GitHub Actions tab

---

## 📞 Need Help?

1. **Check Logs**: `docker compose logs -f <service-name>`
2. **Check GitHub Actions**: Repository → Actions tab
3. **Verify Secrets**: Settings → Secrets and variables → Actions
4. **Test SSH**: `ssh -i your_key root@your_droplet_ip`
5. **Check Docker Hub**: Verify images are being pushed

---

## 🎉 Success Checklist

- [ ] All GitHub secrets configured
- [ ] Docker & Docker Compose installed on droplet
- [ ] Files uploaded to `/app` directory
- [ ] `.env` file updated with Docker username
- [ ] Code pushed to `main` branch
- [ ] GitHub Actions workflow completed successfully
- [ ] All containers running (`docker compose ps`)
- [ ] Eureka dashboard accessible (port 8761)
- [ ] API Gateway responding (port 8080)
- [ ] Frontend applications accessible (ports 3000-3003)
- [ ] All databases created (`SHOW DATABASES;`)

---

**🎊 Congratulations! Your ERP system is now deployed!**

For detailed information, see [DEPLOYMENT.md](DEPLOYMENT.md)
