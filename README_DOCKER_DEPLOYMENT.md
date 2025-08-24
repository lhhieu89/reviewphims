# 🐳 Docker Deployment Guide - Review Phim

**Setup đơn giản với Docker - tránh conflict port với các domain khác trên server!**

---

## 🎯 **Tại Sao Docker?**

- ✅ **Isolated Environment** - Không conflict với apps khác
- ✅ **Port 3001** - Tránh trùng port 3000 phổ biến
- ✅ **Easy Deployment** - Một command deploy
- ✅ **Rollback Fast** - Quay lại version cũ nhanh chóng
- ✅ **Multi-Domain Server** - Hoạt động tốt với nhiều domain
- ✅ **Auto Health Check** - Tự động kiểm tra app healthy

---

## 🛠️ **Server Requirements**

### **Cài đặt Docker trên server:**

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y
```

### **Cấu hình SSH Key (nếu chưa có):**

```bash
# Trên local machine
ssh-copy-id user@your-server-ip

# Test connection
ssh user@your-server-ip "echo 'SSH OK'"
```

---

## 🚀 **Deployment Commands**

### **1. Deploy to Staging:**

```bash
./scripts/deploy.sh staging YOUR-SERVER-IP USERNAME
```

### **2. Deploy to Production:**

```bash
./scripts/deploy.sh production YOUR-SERVER-IP USERNAME
```

### **3. Rollback (nếu có lỗi):**

```bash
./scripts/rollback.sh YOUR-SERVER-IP USERNAME
```

### **Examples:**

```bash
# Deploy staging
./scripts/deploy.sh staging 192.168.1.100 ubuntu

# Deploy production
./scripts/deploy.sh production 192.168.1.100 root

# Rollback
./scripts/rollback.sh 192.168.1.100 ubuntu
```

---

## ⚙️ **Configuration**

### **Environment Variables:**

**File: `.env.staging`**

```bash
NODE_ENV=production
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_REGION_CODE=VN
SITE_URL=http://staging-domain.com:3001
```

**File: `.env.production`**

```bash
NODE_ENV=production
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_REGION_CODE=VN
SITE_URL=http://your-domain.com:3001
```

### **Port Configuration:**

- **Internal Container Port:** 3001
- **External Port:** 3001
- **Nginx/Apache Proxy:** Port 3001 → 80/443

---

## 🔧 **Nginx Configuration (Optional)**

Nếu muốn dùng domain without port:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 **Health Check & Monitoring**

### **Health Check URL:**

```bash
curl http://your-server:3001/api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "port": "3001",
  "version": "1.0.0",
  "youtube_api": "configured"
}
```

### **Server Management Commands:**

```bash
# SSH vào server
ssh user@server-ip

# Check container status
cd /opt/review-phim && docker-compose ps

# View logs
cd /opt/review-phim && docker-compose logs -f

# Restart container
cd /opt/review-phim && docker-compose restart

# Stop container
cd /opt/review-phim && docker-compose down

# Update and restart
cd /opt/review-phim && docker-compose up -d --build
```

---

## 🏗️ **Development Workflow**

### **Local Development:**

```bash
# Build and test Docker locally
npm run docker:build
npm run docker:run

# Or use development compose
npm run docker:dev
```

### **Staging → Production:**

```bash
# 1. Deploy to staging
./scripts/deploy.sh staging 192.168.1.100 ubuntu

# 2. Test staging
curl http://staging-server:3001/api/health

# 3. Deploy to production
./scripts/deploy.sh production 192.168.1.200 ubuntu

# 4. Verify production
curl http://production-server:3001/api/health
```

---

## 🔍 **Multi-Domain Setup**

Server với nhiều domains:

```
Server IP: 192.168.1.100
├── review-phim    → Port 3001
├── blog-app       → Port 3002
├── shop-app       → Port 3003
└── admin-panel    → Port 3004
```

**Nginx routing:**

```nginx
# review-phim.com → Port 3001
server {
    server_name review-phim.com;
    location / { proxy_pass http://localhost:3001; }
}

# blog.com → Port 3002
server {
    server_name blog.com;
    location / { proxy_pass http://localhost:3002; }
}
```

---

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **1. Port Already in Use:**

```bash
# Check what's using port 3001
sudo netstat -tulpn | grep :3001

# Kill process if needed
sudo fuser -k 3001/tcp
```

#### **2. Docker Build Failed:**

```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

#### **3. Container Won't Start:**

```bash
# Check logs
docker-compose logs review-phim

# Check container status
docker ps -a

# Remove and recreate
docker-compose down
docker-compose up -d
```

#### **4. Health Check Failed:**

```bash
# Test locally first
curl http://localhost:3001/api/health

# Check environment variables
docker-compose exec review-phim env | grep YOUTUBE
```

---

## 📈 **Production Checklist**

### **Before Deploy:**

- [ ] Environment variables configured
- [ ] SSH key setup
- [ ] Server has Docker installed
- [ ] Port 3001 available
- [ ] Health check working locally

### **After Deploy:**

- [ ] Health check returns "ok"
- [ ] App accessible via browser
- [ ] YouTube API working
- [ ] Logs show no errors
- [ ] Performance acceptable

---

## 🚨 **Emergency Commands**

### **Quick Rollback:**

```bash
./scripts/rollback.sh SERVER-IP USERNAME
```

### **Force Restart:**

```bash
ssh user@server "cd /opt/review-phim && docker-compose restart"
```

### **Check Logs:**

```bash
ssh user@server "cd /opt/review-phim && docker-compose logs --tail=50"
```

### **Complete Reset:**

```bash
ssh user@server "cd /opt/review-phim && docker-compose down && docker system prune -f && docker-compose up -d"
```

---

## 🎉 **Ready to Deploy!**

**One-Command Deploy:**

```bash
./scripts/deploy.sh production YOUR-SERVER-IP YOUR-USERNAME
```

**Your app will be available at:** `http://your-server-ip:3001`

**Perfect for multi-domain servers!** 🚀
