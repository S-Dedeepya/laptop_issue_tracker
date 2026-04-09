# Security Implementation Guide

## Overview

This document outlines the security measures implemented in the Laptop Issue Tracker application to ensure secure authentication, password protection, and HTTPS enforcement.

## ✅ Security Requirements Implemented

### 1. HTTPS Enforcement

#### Backend
- **Configuration**: `application.properties`
  - `server.ssl.enabled=false` (for local development with HTTP)
  - `server.servlet.session.cookie.secure=false` (local development)
  - `server.servlet.session.cookie.http-only=true` (all environments)
  - Security filter chain configured with HTTPS requirement

- **Production Setup**:
  ```properties
  server.ssl.enabled=true
  server.ssl.key-store=classpath:keystore/keystore.jks
  server.ssl.key-store-password=your-password
  server.ssl.key-store-type=JKS
  server.servlet.session.cookie.secure=true
  ```

#### Frontend
- **API Client** (`frontend/src/lib/api-client.ts`):
  - Enforces HTTPS when frontend is served over HTTPS
  - Allows localhost/127.0.0.1 for local development
  - Warns about non-HTTPS production URLs
  - Blocks insecure API calls when app uses HTTPS

- **Environment Configuration** (`.env` and `.env.example`):
  - Production example: `VITE_API_BASE_URL=https://api.yourdomain.com/api`

### 2. Password Management

#### Backend
- **Hashing Algorithm**: BCrypt (Spring Security default)
  - Configuration: `SecurityConfig.java` - `BCryptPasswordEncoder`
  - Passwords are hashed before storage in the database
  - Automatic salt generation per password

- **Password Handling in AuthService**:
  ```java
  user.setPassword(passwordEncoder.encode(request.getPassword()));
  ```
  
- **Never Logged or Returned**:
  - DTOs exclude password field
  - AuthResponse contains only: `token`, `email`, `id`, `role`, `fullName`, etc.
  - No password in any API response

#### Frontend
- **No Password Storage**:
  - Authentication store (`auth.store.ts`) stores ONLY:
    - JWT token
    - User email
    - User role
    - User ID
    - Full name and other non-sensitive data
  - Passwords are immediately discarded after login

- **Form Handling**:
  - Login forms accept passwords in the form state
  - Password is sent directly to API during login
  - Password is NOT persisted to localStorage or Zustand store

### 3. JWT Token-Based Authentication

#### Backend
- **JWT Generation** (`JwtTokenProvider.java`):
  ```
  Token Algorithm: HS256 (HMAC SHA-256)
  Token Expiration: 24 hours (86400000 milliseconds)
  Token Secret: Stored in application.properties
  ```

- **Token Structure**:
  - Subject: User email
  - Issued At: Current timestamp
  - Expiration: 24 hours from issuance
  - Signature: HS256 with secret key

- **Token Validation** (`JwtAuthenticationFilter.java`):
  - Extracts token from `Authorization: Bearer {token}` header
  - Validates token signature
  - Checks token expiration
  - Sets authenticated user in SecurityContext

#### Frontend
- **Token Storage**:
  - JWT token stored in `localStorage` as `authToken`
  - Token automatically added to all API requests via axios interceptor
  - Format: `Authorization: Bearer {token}`

- **Token Lifecycle**:
  ```
  1. User logs in with email/password
  2. Backend validates credentials
  3. Backend generates and returns JWT token
  4. Frontend stores token in localStorage
  5. Token automatically added to all subsequent API requests
  6. Token expiration (24h) forces re-login
  7. Logout clears token from storage
  ```

### 4. Request/Response Security

#### API Client Security Headers
- `Content-Type: application/json`
- `X-Content-Type-Options: nosniff` (prevent MIME-type sniffing)
- `withCredentials: true` (CSRF protection)

#### Error Handling
- **401 Unauthorized**: 
  - Clears auth state
  - Redirects to login page
  - Prevents redirect loops

- **Password in Network Traffic**:
  - Password appears in request body during login (expected browser behavior)
  - **PROTECTED** by HTTPS encryption in transit
  - Only visible to server, never logged or stored

### 5. Logging Configuration

#### Backend (`application.properties`)
- `logging.level.org.springframework.security=WARN` (minimal security logs)
- `logging.level.com.laptoptracker=INFO` (application logs)
- `logging.level.org.springframework.web=WARN` (request logs)
- `logging.level.org.hibernate=WARN` (database logs)

**Why?**
- Prevents password exposure in DEBUG logs
- Reduces information leakage
- Maintains audit trail without sensitive data

## 🔐 Password Flow Diagram

```
┌─────────────────┐
│   Frontend      │
│   Login Form    │
└────────┬────────┘
         │ User enters email & password
         │
         ▼
┌─────────────────────────┐
│  API Client (axios)     │
│  Sends POST request to  │
│  /auth/student/login    │
│  with email & password  │
└────────┬────────────────┘
         │ HTTPS encrypted
         │
         ▼
┌──────────────────────────────┐
│     Backend (Spring Boot)    │
│  1. Receive email & password │
│  2. Query user from DB       │
│  3. Compare password with    │
│     BCrypt hash (NO PLAIN)   │
│  4. If valid, generate JWT   │
│  5. Return JWT (not password)│
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│   Frontend Auth Store        │
│  1. Store JWT in localStorage│
│  2. Update auth state        │
│  3. Discard password        │
│  4. Redirect to dashboard   │
└──────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ All Future API Requests     │
│ Use JWT token, no password  │
│ Authorization: Bearer {jwt} │
└─────────────────────────────┘
```

## 🛡️ Security Best Practices

### Development Environment
- Use HTTP locally for convenience
- Database connection requires secure credentials
- API base URL can be `http://localhost:8080/api`

### Production Environment
- **Enable HTTPS**:
  1. Configure SSL certificate in backend
  2. Update `VITE_API_BASE_URL` to HTTPS endpoint
  3. Enable secure session cookies
  4. Enforce HSTS headers

- **JWT Secret Management**:
  - Use environment variable instead of properties file
  - Rotate secret regularly
  - Use strong, random secret (32+ characters)

- **Session Timeout**:
  - Current: 24 hours
  - Consider reducing for sensitive operations
  - Update `jwt.expiration` in properties

- **Password Requirements**:
  - Enforce strong password policy
  - Minimum length: 8 characters
  - Require mix of upper, lower, numbers, special chars
  - Implement rate limiting on login attempts

## 📋 Checklist for Production Deployment

- [ ] Enable HTTPS in backend (`server.ssl.enabled=true`)
- [ ] Configure SSL certificate/keystore
- [ ] Update `VITE_API_BASE_URL` to production HTTPS endpoint
- [ ] Enable secure cookies (`server.servlet.session.cookie.secure=true`)
- [ ] Set strong JWT secret (environment variable)
- [ ] Disable DEBUG logging
- [ ] Implement login rate limiting
- [ ] Add password strength validation
- [ ] Set up CORS for production domain only
- [ ] Enable security headers (CSP, X-Frame-Options, etc.)
- [ ] Implement account lockout after failed attempts
- [ ] Add password expiration policy
- [ ] Enable audit logging

## 🔍 Security Verification

### Frontend Console
```javascript
// Check that password is NOT in localStorage
localStorage.getItem('authToken')  // ✅ Returns JWT token
localStorage.getItem('password')   // ✅ Returns null (never stored)

// Check auth store
// ✅ Token exists, password doesn't
```

### Network Tab (Browser DevTools)
```
POST /auth/student/login
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json

Body:
  {
    "email": "student@example.com",
    "password": "SecurePassword123"  // Only visible during login request
  }

Response:
  {
    "token": "eyJhbGc...",  // JWT returned
    "email": "student@example.com",
    "role": "STUDENT"
    // ✅ NO password in response
  }
```

### After Login
All subsequent requests use:
```
Authorization: Bearer {jwt-token}
// ✅ Password never sent again
```

## 🚨 Security Warnings

### ❌ Never Do
- Store passwords in localStorage
- Log passwords to console/files
- Send passwords in GET requests (URLs)
- Return passwords in API responses
- Use plain text passwords in database
- Hardcode JWT secrets in code

### ✅ Always Do
- Use HTTPS in production
- Hash passwords with bcrypt/argon2
- Expire tokens periodically
- Validate tokens on every request
- Clear tokens on logout
- Use secure, HTTP-only cookies (when using sessions)
- Monitor failed login attempts

## 📞 Support

For security concerns or vulnerability reports:
1. Do not disclose publicly
2. Contact: security@yourdomain.com
3. Provide detailed reproduction steps
4. Allow reasonable time for patching

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-26 | Initial security implementation with HTTPS, BCrypt hashing, JWT tokens |

---

**Last Updated**: 2026-01-26
**Status**: ✅ All security requirements implemented
