# Production HTTPS Configuration Guide

## Quick Start - Enable HTTPS in Production

### Step 1: Generate SSL Certificate

#### Option A: Self-Signed Certificate (Development/Testing)
```bash
cd backend/src/main/resources/keystore
keytool -genkeypair -alias tomcat \
  -keyalg RSA -keysize 2048 \
  -keystore keystore.jks \
  -validity 365 \
  -keypass password \
  -storepass password
```

#### Option B: Let's Encrypt (Production Recommended)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Get certificate
sudo certbot certonly --apache -d yourdomain.com

# Convert to PKCS12
sudo openssl pkcs12 -export -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/yourdomain.com/privkey.pem \
  -out keystore.p12 \
  -name tomcat \
  -password pass:your-keystore-password

# Convert PKCS12 to JKS (if needed)
keytool -importkeystore -srckeystore keystore.p12 \
  -srcstoretype PKCS12 \
  -srcstorepass your-keystore-password \
  -destkeystore keystore.jks \
  -deststoretype JKS \
  -deststorepass your-keystore-password
```

### Step 2: Configure Backend for HTTPS

Update `application.properties`:

```properties
# ===== HTTP Configuration (Redirect to HTTPS) =====
server.port=8080
server.http2.enabled=true

# ===== HTTPS Configuration =====
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore/keystore.jks
server.ssl.key-store-password=your-keystore-password
server.ssl.key-store-type=JKS
server.ssl.key-alias=tomcat

# For PKCS12 format:
# server.ssl.key-store-type=PKCS12
# server.ssl.key-store=file:/path/to/keystore.p12

# ===== Session Security =====
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.tracking-modes=cookie

# ===== HSTS Header (Enforce HTTPS) =====
server.servlet.session.cookie.same-site=strict
```

### Step 3: Add Security Headers Configuration

Update `SecurityConfig.java` - modify the `filterChain` method:

```java
http
    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
    .csrf(csrf -> csrf.disable())
    .headers(headers -> headers
        .contentSecurityPolicy(csp -> csp
            .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'"))
        .frameOptions(frameOptions -> frameOptions.deny())
        .xxssProtection(xxssProtection -> xxssProtection.and(true)))
    .requiresChannel(channel -> channel
        .anyRequest().requiresSecure())
    // ... rest of configuration
```

### Step 4: Update Frontend Configuration

Create `.env.production`:
```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

Update `vite.config.ts` for production build:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://yourdomain.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

### Step 5: Configure CORS for Production

Update `SecurityConfig.java` - modify `corsConfigurationSource()`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Production domains only
    configuration.setAllowedOrigins(Arrays.asList(
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## Environment Variables (Recommended)

Instead of storing sensitive data in properties files:

```bash
# Set environment variables
export SPRING_DATASOURCE_URL=jdbc:mysql://db-server:3306/laptop_tracker_db
export SPRING_DATASOURCE_USERNAME=db_user
export SPRING_DATASOURCE_PASSWORD=secure_db_password
export JWT_SECRET=your-very-long-random-secret-key-32-plus-chars
export SERVER_SSL_KEYSTORE_PASSWORD=keystore_password
```

Update `application.properties`:
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
jwt.secret=${JWT_SECRET}
server.ssl.key-store-password=${SERVER_SSL_KEYSTORE_PASSWORD}
```

## Deployment Steps

### 1. Build Backend
```bash
cd backend
mvn clean package
```

### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 3. Deploy to Server

#### Using Docker (Recommended)
```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

COPY backend/target/laptop-issue-tracker-1.0.0.jar app.jar
COPY frontend/dist /static

ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/laptop_tracker_db
ENV SERVER_SSL_ENABLED=true

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t laptop-tracker:latest .
docker run -d \
  -e SPRING_DATASOURCE_USERNAME=db_user \
  -e SPRING_DATASOURCE_PASSWORD=secure_password \
  -e JWT_SECRET=your-secret \
  -p 8443:8443 \
  -v /path/to/keystore.jks:/app/keystore.jks \
  laptop-tracker:latest
```

#### Using Traditional Server
```bash
# Copy JAR to server
scp backend/target/laptop-issue-tracker-1.0.0.jar user@server:/opt/app/

# Copy keystore
scp backend/src/main/resources/keystore/keystore.jks user@server:/opt/app/keystore/

# SSH to server
ssh user@server

# Create systemd service
sudo nano /etc/systemd/system/laptop-tracker.service
```

`/etc/systemd/system/laptop-tracker.service`:
```ini
[Unit]
Description=Laptop Issue Tracker
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/app
Environment="SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/laptop_tracker_db"
Environment="SPRING_DATASOURCE_USERNAME=db_user"
Environment="SPRING_DATASOURCE_PASSWORD=secure_password"
Environment="JWT_SECRET=your-secret"
ExecStart=/usr/bin/java -jar laptop-issue-tracker-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable laptop-tracker
sudo systemctl start laptop-tracker
sudo systemctl status laptop-tracker
```

### 4. Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {
        root /var/www/laptop-tracker/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy
    location /api {
        proxy_pass https://localhost:8443/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
}
```

### 5. Verify HTTPS

```bash
# Test HTTPS connection
curl -v https://yourdomain.com/api/auth

# Check certificate
openssl s_client -connect yourdomain.com:443

# Test with SSL Labs
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

## Monitoring & Maintenance

### Certificate Renewal (Let's Encrypt)
```bash
# Auto-renewal (runs twice daily)
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

### Security Updates
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Java
sudo apt-get install --only-upgrade openjdk-17-jdk-headless

# Update dependencies (quarterly)
cd backend && mvn clean package -U
```

### Monitoring Logs
```bash
# Spring Boot logs
sudo journalctl -u laptop-tracker -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo tail -f /var/log/syslog
```

## Troubleshooting

### Certificate Issues
```bash
# View certificate details
keytool -list -v -keystore keystore.jks

# Test keystore password
keytool -list -keystore keystore.jks
```

### HTTPS Not Working
1. Check if port 8443 is open: `sudo netstat -tlnp | grep 8443`
2. Verify keystore path is correct
3. Check logs: `sudo journalctl -u laptop-tracker -n 50`
4. Verify DNS: `nslookup yourdomain.com`

### Mixed Content Issues
- Ensure all resources use HTTPS
- Update API_BASE_URL in frontend
- Check browser console for insecure resource warnings

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Certificate auto-renewal configured
- [ ] Strong TLS cipher suites configured
- [ ] HSTS header enabled (Strict-Transport-Security)
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] CORS restricted to production domains only
- [ ] JWT secret stored in environment variable
- [ ] Database password in environment variable
- [ ] Firewall allows only 80, 443, and management ports
- [ ] Rate limiting configured on login endpoint
- [ ] Account lockout after failed attempts
- [ ] Audit logging enabled
- [ ] Regular security updates scheduled
- [ ] SSL/TLS certificate monitored for expiration

---

**Last Updated**: 2026-01-26
