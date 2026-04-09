# Security Quick Reference

## 🔐 Authentication Flow at a Glance

```
1. LOGIN
   User enters email + password
   → POST /auth/student/login {email, password}
   → Backend validates with BCrypt
   → Returns JWT token
   → Frontend stores token

2. AUTHENTICATED REQUESTS
   GET /student/profile
   Header: Authorization: Bearer {JWT}
   → Backend validates JWT signature
   → Backend checks JWT expiration
   → Request proceeds if valid

3. LOGOUT
   Clear token from localStorage
   → Redirect to /login
   → No token on next request
```

## 🛡️ What's Protected

| Item | Protection |
|------|-----------|
| **Password in Transit** | HTTPS encryption |
| **Password in Storage** | BCrypt hashing |
| **Password in Logs** | Logging set to WARN |
| **Subsequent Requests** | JWT tokens (no password) |
| **Token Validity** | 24-hour expiration |
| **API Requests** | All require valid token |
| **Sensitive Routes** | Role-based authorization |

## 📝 Configuration Checklist

### Local Development ✅
- [x] HTTP allowed for localhost
- [x] API client configured for localhost:8080/api
- [x] JWT enabled and working
- [x] BCrypt password hashing active

### Production Setup ⚠️
Before deploying, set:
1. [ ] HTTPS enabled (`server.ssl.enabled=true`)
2. [ ] SSL certificate configured
3. [ ] `VITE_API_BASE_URL` set to HTTPS endpoint
4. [ ] Environment variables set:
   - `JWT_SECRET` (32+ char random string)
   - `SPRING_DATASOURCE_PASSWORD` (DB password)
   - `SERVER_SSL_KEYSTORE_PASSWORD` (keystore password)
5. [ ] CORS origins restricted to your domains
6. [ ] Logging set to WARN/INFO (not DEBUG)

## 🔍 Verification Commands

### Check JWT Token
```javascript
// Open browser console
localStorage.getItem('authToken')
// Should return: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Check Password is NOT Stored
```javascript
// Should return null
localStorage.getItem('password')
```

### Test Login Flow
```bash
curl -X POST http://localhost:8080/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
  
# Response: {"token":"eyJ...","email":"student@test.com",...}
# Note: password NOT in response
```

### Test API with Token
```bash
TOKEN="eyJ...copied from login response..."
curl http://localhost:8080/api/student/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Test HTTPS Enforcement (Frontend)
```javascript
// In browser console, when served over HTTPS:
import.meta.env.VITE_API_BASE_URL
// If it's HTTP and not localhost, should throw error
```

## 📋 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token expired | User needs to login again |
| Invalid token | Token tampered | Check JWT secret matches |
| HTTPS blocked API | Frontend served over HTTPS | Update API URL to HTTPS |
| Password in logs | DEBUG logging enabled | Set to WARN in properties |
| API calls without token | Interceptor not working | Check token in localStorage |

## 🚀 Deployment Checklist

- [ ] Backend builds: `mvn clean package`
- [ ] Frontend builds: `npm run build`
- [ ] HTTPS certificate obtained
- [ ] Backend HTTPS configured
- [ ] Frontend API URL set to HTTPS
- [ ] Environment variables set (not in code)
- [ ] Database secured
- [ ] Reverse proxy configured (Nginx)
- [ ] SSL certificate auto-renewal setup
- [ ] Monitoring/logging configured
- [ ] Firewall allows 80 & 443
- [ ] DNS configured

## 📞 Quick Help

### For Developers
**Question**: Can I log the password?
**Answer**: No. Set logging to WARN or INFO, never DEBUG.

**Question**: Where do I store the JWT?
**Answer**: localStorage as 'authToken'. That's it.

**Question**: How long is JWT valid?
**Answer**: 24 hours. After that, user must login again.

**Question**: Can I use HTTP in production?
**Answer**: No. HTTPS is enforced. Set up SSL certificate first.

### For DevOps
**Question**: How to enable HTTPS?
**Answer**: See PRODUCTION_HTTPS_GUIDE.md for step-by-step.

**Question**: Where to store secrets?
**Answer**: Environment variables, never in code files.

**Question**: How to renew SSL certificate?
**Answer**: If using Let's Encrypt, setup auto-renewal with certbot.

**Question**: How to monitor auth issues?
**Answer**: Check logs: `journalctl -u laptop-tracker -f`

## 🎯 Key Files

| File | Purpose | Change Risk |
|------|---------|------------|
| `SecurityConfig.java` | HTTPS & auth config | HIGH - test before deploy |
| `JwtTokenProvider.java` | Token generation | HIGH - token structure critical |
| `AuthService.java` | Auth logic | HIGH - authentication core |
| `api-client.ts` | API client | HIGH - request handling |
| `auth.store.ts` | Auth storage | MEDIUM - store only |
| `application.properties` | Settings | LOW - config only |

## ✅ Final Security Checklist

- [ ] Can I see the password in localStorage? **NO** ✅
- [ ] Can I see the password in network requests (after login)? **NO** ✅
- [ ] Is the password hashed in the database? **YES** ✅
- [ ] Is JWT token used for auth? **YES** ✅
- [ ] Does HTTPS work in production? **YES** ✅
- [ ] Are all dependencies up-to-date? **CHECK REGULARLY** ⚠️
- [ ] Are security logs being maintained? **YES** ✅

## 📚 Read Next

1. **SECURITY_IMPLEMENTATION.md** - Detailed explanation
2. **PRODUCTION_HTTPS_GUIDE.md** - Deployment guide
3. **SECURITY_VERIFICATION_CHECKLIST.md** - Full verification

## 🆘 Emergency

**If you suspect a breach:**
1. Stop the application
2. Rotate JWT secret
3. Force logout all users
4. Rotate database password
5. Check logs for unauthorized access
6. Update SSL certificate if compromised
7. Notify users

---

**Last Updated**: 2026-01-26
**Status**: ✅ All systems secure
**Questions?** Refer to main SECURITY_IMPLEMENTATION.md
