# 🎓 LAPTOP ISSUE TRACKER - COMPLETE PROJECT WORKFLOW

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Setup & Installation](#setup--installation)
6. [User Workflows](#user-workflows)
7. [API Endpoints](#api-endpoints)
8. [Security Implementation](#security-implementation)
9. [Complete Request-Response Flows](#complete-request-response-flows)
10. [Error Handling](#error-handling)
11. [Deployment Guide](#deployment-guide)

---

## 1. PROJECT OVERVIEW

### Purpose
The Laptop Issue Tracker is a comprehensive web application designed to manage laptop distribution, tracking, and extension requests in educational institutions. It streamlines the process of:
- Students requesting laptops
- Managers approving/rejecting requests
- Issuing laptops to students
- Managing return deadlines
- Handling extension requests
- Tracking overdue devices

### Key Features
✅ JWT-based authentication & authorization  
✅ Role-based access control (STUDENT, MANAGER)  
✅ Laptop inventory management  
✅ Request approval workflow  
✅ Extension request system  
✅ Deadline tracking with notifications  
✅ Comprehensive audit trail  

### User Roles
- **STUDENT**: Can request laptops, view issues, request extensions
- **MANAGER**: Can manage inventory, approve requests, issue laptops

---

## 2. TECHNOLOGY STACK

### Backend
| Component | Technology |
|-----------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.2.1 |
| Security | Spring Security + JWT |
| Database ORM | Spring Data JPA (Hibernate) |
| Build Tool | Maven |
| Database | MySQL 8.0+ |
| Validation | Jakarta Validation API |

### Frontend
| Component | Technology |
|-----------|-----------|
| Language | TypeScript |
| Framework | React 18 |
| Build Tool | Vite |
| UI Library | Shadcn/ui |
| HTTP Client | Axios |
| State Management | Zustand |
| Styling | Tailwind CSS |

### DevOps & Deployment
- Docker (for containerization)
- Docker Compose (for local development)
- CI/CD ready architecture

---

## 3. SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                    React + TypeScript + Vite                    │
│         (Running on localhost:5173 / Production: 3000)          │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Student   │  │  Manager   │  │  Auth      │               │
│  │  Dashboard │  │  Dashboard │  │  Pages     │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/HTTPS + JWT Token
                          │ JSON Request/Response
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                             │
│              Spring Boot 3.2.1 (localhost:8080/api)             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            SECURITY LAYER                               │  │
│  │  • JwtAuthenticationFilter                              │  │
│  │  • JwtTokenProvider (Token generation/validation)       │  │
│  │  • CustomUserDetailsService                             │  │
│  │  • SecurityConfig (CORS, HTTPS redirect, etc.)          │  │
│  │  • JwtAuthenticationEntryPoint (Error handling)         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            CONTROLLER LAYER (REST APIs)                 │  │
│  │  ┌──────────────┬──────────────┬────────────────────┐  │  │
│  │  │AuthController│StudentCtrlr  │ManagerController  │  │  │
│  │  │              │              │                    │  │  │
│  │  │• signup      │• create-req  │• laptops (CRUD)    │  │  │
│  │  │• login       │• get-issues  │• approve/reject    │  │  │
│  │  │• logout      │• extensions  │• mark-returned     │  │  │
│  │  │              │• notifs      │• deadlines mgmt    │  │  │
│  │  └──────────────┴──────────────┴────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           SERVICE LAYER (Business Logic)                │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │• AuthService           • LaptopRequestService     │ │  │
│  │  │• LaptopService         • LaptopIssueService       │ │  │
│  │  │• ExtensionReqService   • NotificationService      │ │  │
│  │  │• Validation & Rules    • Transaction Management   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │          REPOSITORY LAYER (Data Access)                 │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │• UserRepository         • LaptopRepository         │ │  │
│  │  │• StudentProfileRepo     • LaptopRequestRepository  │ │  │
│  │  │• LaptopIssueRepository  • ExtensionRequestRepository│ │  │
│  │  │• NotificationRepository • Custom Query Methods     │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           ENTITY LAYER (Domain Models)                  │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │• User                   • Laptop                  │ │  │
│  │  │• StudentProfile         • LaptopRequest          │ │  │
│  │  │• LaptopIssue           • ExtensionRequest        │ │  │
│  │  │• Notification          • Relationships & Enums   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │        EXCEPTION HANDLING (Global Handler)              │  │
│  │  • GlobalExceptionHandler                               │  │
│  │  • BadRequestException                                  │  │
│  │  • ResourceNotFoundException                            │  │
│  │  • Validation Error Responses                           │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ JDBC + Hibernate
                          │ SQL Queries
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│                    MySQL 8.0+                                   │
│              (laptop_tracker_db)                                │
│                                                                 │
│  Tables:                                                        │
│  • users (Authentication data)                                  │
│  • student_profiles (Student info)                              │
│  • laptops (Device inventory)                                   │
│  • laptop_requests (Request tracking)                           │
│  • laptop_issues (Issue tracking)                               │
│  • extension_requests (Extension tracking)                      │
│  • notifications (Notification history)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. DATABASE DESIGN

### Database Tables

#### 1. **users**
- Stores authentication credentials
- Supports role-based access
- Uses BCrypt for password encryption

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,  -- STUDENT, MANAGER
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

#### 2. **student_profiles**
- Additional student information
- Links to user account
- Unique registration number

```sql
CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    address VARCHAR(200),
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. **laptops**
- Inventory tracking
- Status management (AVAILABLE, ISSUED, MAINTENANCE)
- Device specifications

```sql
CREATE TABLE laptops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    specifications VARCHAR(500),
    status VARCHAR(20) DEFAULT 'AVAILABLE',  -- AVAILABLE, ISSUED, MAINTENANCE
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_status (status)
);
```

#### 4. **laptop_requests**
- Student laptop requests
- Status tracking (PENDING, APPROVED, REJECTED)
- Reason and review history

```sql
CREATE TABLE laptop_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    request_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
    rejection_reason VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
);
```

#### 5. **laptop_issues**
- Approved and issued laptops
- Deadline tracking
- Return tracking

```sql
CREATE TABLE laptop_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    laptop_id BIGINT NOT NULL,
    laptop_request_id BIGINT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    original_return_deadline DATE NOT NULL,
    current_return_deadline DATE NOT NULL,
    actual_return_date DATE,
    is_returned BOOLEAN DEFAULT FALSE,
    extension_count INT DEFAULT 0,
    issued_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id),
    FOREIGN KEY (laptop_id) REFERENCES laptops(id),
    FOREIGN KEY (laptop_request_id) REFERENCES laptop_requests(id)
);
```

#### 6. **extension_requests**
- Extension request tracking
- Status management
- Deadline extensions

```sql
CREATE TABLE extension_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    laptop_issue_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    requested_days INT NOT NULL,
    new_deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
    rejection_reason VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (laptop_issue_id) REFERENCES laptop_issues(id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
);
```

#### 7. **notifications**
- Notification history
- Read/unread tracking
- Student notifications

```sql
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_id BIGINT,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
);
```

### Database Relationships
```
users (1) ─── (1) student_profiles
        │
        └─── (1) laptops (issued_by)
        
student_profiles (1) ─── (∞) laptop_requests
student_profiles (1) ─── (∞) laptop_issues
student_profiles (1) ─── (∞) extension_requests
student_profiles (1) ─── (∞) notifications

laptops (1) ─── (∞) laptop_issues

laptop_requests (1) ─── (1) laptop_issues

laptop_issues (1) ─── (∞) extension_requests
```

---

## 5. SETUP & INSTALLATION

### Prerequisites
- Java 17 or higher
- MySQL 8.0 or higher
- Node.js 18+ (for frontend)
- Maven 3.6+
- Git

### Step 1: Database Setup

```bash
# Create database
mysql -u root -p << EOF
CREATE DATABASE laptop_tracker_db;
USE laptop_tracker_db;
EOF

# Run schema
mysql -u root -p laptop_tracker_db < backend/database_schema.sql

# Create default manager account
mysql -u root -p laptop_tracker_db << EOF
INSERT INTO users (email, password, role, active, created_at, updated_at) 
VALUES (
  'manager@laptoptracker.com', 
  '\$2a\$10\$xZ8YQVyLqY6hGVXJKFvG3eKrYrLqM8fVXNqMQx7YvXPxGKYqPZY6K', 
  'MANAGER', 
  true, 
  NOW(), 
  NOW()
);
EOF
```

### Step 2: Backend Setup

```bash
cd backend

# Configure database credentials
# Edit src/main/resources/application.properties
# Update:
# spring.datasource.username=your_username
# spring.datasource.password=your_password

# Build
mvn clean install

# Run
mvn spring-boot:run
# Backend will start at http://localhost:8080
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will start at http://localhost:5173
```

### Default Manager Account
- **Email**: manager@laptoptracker.com
- **Password**: manager123

---

## 6. USER WORKFLOWS

### WORKFLOW 1: Student Registration & Login

#### Step 1: Student Signup
```
1. Navigate to signup page
2. Enter:
   - Email
   - Password (min 6 chars)
   - Full Name
   - Registration Number
   - Phone (optional)
   - Address (optional)
3. Click "Sign Up"
4. System:
   - Validates input
   - Checks email uniqueness
   - Checks registration number uniqueness
   - Creates User account with STUDENT role
   - Creates StudentProfile
   - Encrypts password with BCrypt
   - Generates JWT token
   - Stores token locally
5. Redirected to Student Dashboard
```

#### Step 2: Student Login
```
1. Navigate to login page
2. Enter email and password
3. Select "Student" role
4. Click "Login"
5. System:
   - Validates credentials
   - Checks user role
   - Validates password
   - Generates JWT token
   - Returns token
6. Token stored in local storage
7. Redirected to Student Dashboard
```

---

### WORKFLOW 2: Laptop Request Flow

#### Step 1: Student Creates Request
```
1. Go to "Laptop Requests" tab
2. Click "Request New Laptop"
3. Enter:
   - Reason for request
   - Duration needed
4. Submit
5. System:
   - Validates input
   - Checks if student already has active laptop
   - Checks if student has pending request
   - Creates LaptopRequest with status PENDING
   - Saves to database
   - Creates notification for managers
   - Returns confirmation
6. Request appears in "My Requests" list with PENDING status
```

#### Step 2: Manager Reviews Request
```
Manager Dashboard → Laptop Requests
  - Views all pending requests
  - Clicks on request
  - Reviews:
    - Student details
    - Request reason
    - Student history
  - Decision: APPROVE or REJECT
```

#### Step 3: Manager Approves Request
```
1. Manager views request
2. Clicks "Approve"
3. Opens approval form
4. Selects:
   - Laptop from available inventory
   - Issue date
   - Return deadline (from dropdown: 7, 14, 21, 30 days)
5. Submits
6. System:
   - Validates laptop availability
   - Validates deadline
   - Updates LaptopRequest status to APPROVED
   - Creates LaptopIssue record
   - Updates Laptop status to ISSUED
   - Creates notification for student
   - Updates extension_count to 0
   - Returns success response
7. Student receives notification
8. Student can now view laptop details
9. Student can request extension before deadline
```

#### Step 4: Manager Rejects Request
```
1. Manager clicks "Reject"
2. Enters rejection reason
3. Submits
4. System:
   - Updates LaptopRequest status to REJECTED
   - Stores rejection reason
   - Creates notification for student
5. Student receives notification with reason
```

---

### WORKFLOW 3: Extension Request Flow

#### Step 1: Student Requests Extension
```
1. Go to "Active Issues" tab
2. Select an active laptop issue
3. If extension_count < 3:
   - Click "Request Extension"
   - Enter:
     - Reason for extension
     - Days needed (7, 14, 21, 30)
   - Submit
4. System:
   - Validates extension limit (max 3)
   - Creates ExtensionRequest with status PENDING
   - Calculates new deadline
   - Creates notification for manager
   - Returns confirmation
5. Student can view status in "My Extensions"
```

#### Step 2: Manager Reviews Extension
```
Manager Dashboard → Extension Requests
  - Views all pending extension requests
  - Clicks on request
  - Reviews:
    - Current deadline
    - Requested deadline
    - Student reason
    - Student history
```

#### Step 3: Manager Approves Extension
```
1. Manager clicks "Approve"
2. System:
   - Updates ExtensionRequest status to APPROVED
   - Updates LaptopIssue:
     - current_return_deadline to new date
     - extension_count incremented by 1
   - Creates notification for student
   - Saves changes
3. Student receives new deadline notification
```

#### Step 4: Manager Rejects Extension
```
1. Manager enters rejection reason
2. Clicks "Reject"
3. System:
   - Updates ExtensionRequest status to REJECTED
   - Stores rejection reason
   - Creates notification for student
4. Student receives rejection notification
```

---

### WORKFLOW 4: Laptop Return Process

#### Step 1: Student Returns Laptop
```
1. Student goes to "Active Issues"
2. Clicks "Mark as Returned"
3. Confirms action
4. System:
   - Updates LaptopIssue:
     - is_returned = true
     - actual_return_date = TODAY
   - Updates Laptop status to AVAILABLE
   - Creates notification for manager
   - Removes from active issues
5. Laptop is back in inventory
```

#### Step 2: Manager Confirms Return
```
Manager Dashboard → Active Issues
  - Can view all returned laptops
  - Can verify physical return
  - Can mark for maintenance if needed
```

---

### WORKFLOW 5: Deadline Monitoring

#### Step 1: Automatic Deadline Notifications
```
System monitors deadlines and sends notifications:
- 7 days before: "Reminder: Return laptop in 7 days"
- 3 days before: "Urgent: Return laptop in 3 days"
- On deadline: "Deadline reached - Please return laptop"
- After deadline: "Overdue: Laptop return deadline has passed"
```

#### Step 2: Manager Monitoring
```
Manager Dashboard → Deadlines
  - View all active issues
  - See color-coded deadlines:
    - Green: > 7 days remaining
    - Yellow: 3-7 days remaining
    - Red: < 3 days or overdue
  - Filter by overdue status
  - Contact students as needed
```

---

## 7. API ENDPOINTS

### Authentication Endpoints

#### POST /api/auth/student/signup
**Register new student**
```json
Request:
{
  "email": "student@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "registrationNumber": "REG12345",
  "phoneNumber": "+1234567890",
  "address": "123 Main St"
}

Response (201):
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "userId": 1,
    "email": "student@example.com",
    "role": "STUDENT",
    "fullName": "John Doe"
  }
}
```

#### POST /api/auth/student/login
**Login as student**
```json
Request:
{
  "email": "student@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "userId": 1,
    "email": "student@example.com",
    "role": "STUDENT"
  }
}
```

#### POST /api/auth/manager/login
**Login as manager**
```json
Request:
{
  "email": "manager@laptoptracker.com",
  "password": "manager123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "userId": 2,
    "email": "manager@laptoptracker.com",
    "role": "MANAGER"
  }
}
```

### Student Endpoints

#### POST /api/student/laptop-requests
**Create laptop request**
```
Authorization: Bearer <token>

Request:
{
  "reason": "Need laptop for coursework"
}

Response (201):
{
  "success": true,
  "message": "Laptop request created successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "reason": "Need laptop for coursework",
    "status": "PENDING",
    "requestDate": "2026-01-19"
  }
}
```

#### GET /api/student/laptop-requests
**Get all my requests**
```
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "APPROVED",
      "reason": "Need laptop for coursework",
      "requestDate": "2026-01-19"
    }
  ]
}
```

#### GET /api/student/laptop-issues
**Get all my active laptop issues**
```
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "laptopId": 5,
      "laptopBrand": "Dell",
      "laptopModel": "XPS 13",
      "issueDate": "2026-01-19",
      "returnDeadline": "2026-02-19",
      "daysRemaining": 31,
      "isOverdue": false
    }
  ]
}
```

#### POST /api/student/extension-requests
**Request extension**
```
Authorization: Bearer <token>

Request:
{
  "laptopIssueId": 1,
  "reason": "Need more time for project",
  "requestedDays": 7
}

Response (201):
{
  "success": true,
  "message": "Extension request created",
  "data": {
    "id": 1,
    "laptopIssueId": 1,
    "status": "PENDING",
    "newDeadline": "2026-02-26",
    "reason": "Need more time for project"
  }
}
```

#### GET /api/student/notifications
**Get my notifications**
```
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Laptop Approved",
      "message": "Your laptop request has been approved",
      "type": "REQUEST_APPROVED",
      "isRead": false,
      "createdAt": "2026-01-19"
    }
  ]
}
```

#### PUT /api/student/laptop-issues/{id}/return
**Mark laptop as returned**
```
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Laptop marked as returned",
  "data": {
    "id": 1,
    "isReturned": true,
    "actualReturnDate": "2026-01-19"
  }
}
```

### Manager Endpoints

#### POST /api/manager/laptops
**Add new laptop to inventory**
```
Authorization: Bearer <token>

Request:
{
  "serialNumber": "SN123456",
  "brand": "Dell",
  "model": "XPS 13",
  "specifications": "Intel i7, 16GB RAM, 512GB SSD"
}

Response (201):
{
  "success": true,
  "message": "Laptop added successfully",
  "data": {
    "id": 1,
    "serialNumber": "SN123456",
    "brand": "Dell",
    "status": "AVAILABLE"
  }
}
```

#### GET /api/manager/laptops
**Get all laptops**
```
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "serialNumber": "SN123456",
      "brand": "Dell",
      "model": "XPS 13",
      "status": "AVAILABLE"
    }
  ]
}
```

#### POST /api/manager/laptop-requests/{id}/approve
**Approve laptop request**
```
Authorization: Bearer <token>

Request:
{
  "laptopId": 1,
  "issueDate": "2026-01-19",
  "returnDeadline": "2026-02-19"
}

Response (200):
{
  "success": true,
  "message": "Request approved and laptop issued",
  "data": {
    "laptopIssueId": 1,
    "laptopId": 1,
    "studentId": 1,
    "issueDate": "2026-01-19",
    "returnDeadline": "2026-02-19"
  }
}
```

#### POST /api/manager/laptop-requests/{id}/reject
**Reject laptop request**
```
Authorization: Bearer <token>

Request:
{
  "rejectionReason": "Quota limit exceeded"
}

Response (200):
{
  "success": true,
  "message": "Request rejected",
  "data": {
    "id": 1,
    "status": "REJECTED",
    "rejectionReason": "Quota limit exceeded"
  }
}
```

#### GET /api/manager/laptop-requests
**Get all laptop requests (filter by status)**
```
Authorization: Bearer <token>
Query: ?status=PENDING

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "studentName": "John Doe",
      "reason": "Need laptop for coursework",
      "status": "PENDING",
      "requestDate": "2026-01-19"
    }
  ]
}
```

#### POST /api/manager/extension-requests/{id}/approve
**Approve extension request**
```
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Extension approved",
  "data": {
    "id": 1,
    "status": "APPROVED",
    "newDeadline": "2026-02-26"
  }
}
```

#### POST /api/manager/extension-requests/{id}/reject
**Reject extension request**
```
Authorization: Bearer <token>

Request:
{
  "rejectionReason": "Extension limit reached"
}

Response (200):
{
  "success": true,
  "message": "Extension rejected",
  "data": {
    "id": 1,
    "status": "REJECTED"
  }
}
```

---

## 8. SECURITY IMPLEMENTATION

### Authentication Flow

```
User Login Request
        │
        ▼
JwtAuthenticationFilter catches request
        │
        ├─► Extract JWT token from Authorization header
        │
        ▼
JwtTokenProvider validates token
        │
        ├─► Check token signature
        ├─► Check token expiration
        ├─► Extract username/email
        │
        ├─► INVALID → Return 401 Unauthorized
        │
        ▼
CustomUserDetailsService loads user details
        │
        ├─► Query users table
        ├─► Query roles
        ├─► Build UserDetails object
        │
        ▼
SecurityContext stores authentication
        │
        ▼
Request proceeds to Controller
```

### Key Security Components

#### 1. JwtTokenProvider
- Generates JWT tokens with 24-hour expiration
- Uses HMAC-SHA256 signature algorithm
- Stores JWT secret in application.properties
- Validates token signature and expiration

#### 2. JwtAuthenticationFilter
- Intercepts all requests
- Extracts JWT from Authorization header
- Validates token
- Sets authentication in SecurityContext

#### 3. CustomUserDetailsService
- Implements UserDetailsService
- Loads user from database
- Builds UserDetails with roles
- Handles user not found scenarios

#### 4. SecurityConfig
- Configures Spring Security
- Enables CORS for React frontend
- Disables CSRF (using JWT)
- Configures filter chain
- Sets authentication entry point

#### 5. Password Encryption
- Uses BCrypt algorithm
- Strength level: 10
- Random salt generation
- Irreversible one-way encryption

### Authorization Rules

```
Public Endpoints (No Auth Required):
- POST /api/auth/student/signup
- POST /api/auth/student/login
- POST /api/auth/manager/login

Student Endpoints (Require STUDENT role):
- GET /api/student/*
- POST /api/student/*
- PUT /api/student/*

Manager Endpoints (Require MANAGER role):
- GET /api/manager/*
- POST /api/manager/*
- PUT /api/manager/*
- DELETE /api/manager/*
```

### JWT Token Structure
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "student@example.com",
  "iat": 1640000000,
  "exp": 1640086400,
  "iss": "laptop-tracker"
}

Signature: HMAC-SHA256(header.payload, secret)
```

---

## 9. COMPLETE REQUEST-RESPONSE FLOWS

### FLOW 1: Complete Student Registration to Laptop Request

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT SIGNUP FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. Frontend → Backend: POST /api/auth/student/signup
   {
     "email": "john@example.com",
     "password": "secure123",
     "fullName": "John Doe",
     "registrationNumber": "REG2024001"
   }

2. Backend Processing:
   a) AuthController receives request
   b) AuthService.registerStudent() called
      - Validates input (email format, password length, etc.)
      - Check UserRepository: email not exists ✓
      - Check StudentProfileRepository: registration# not exists ✓
      - Create User entity:
        * email: john@example.com
        * password: BCrypt.encode("secure123")
        * role: STUDENT
        * active: true
        * created_at: NOW()
      - Save to users table → user_id = 1
      - Create StudentProfile entity:
        * user_id: 1
        * fullName: John Doe
        * registration_number: REG2024001
      - Save to student_profiles table
      - JwtTokenProvider.generateToken(email) → JWT token
      - Return AuthResponse with token

3. Backend → Frontend: 201 Created
   {
     "success": true,
     "message": "Student registered successfully",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "userId": 1,
       "email": "john@example.com",
       "role": "STUDENT",
       "fullName": "John Doe"
     }
   }

4. Frontend Processing:
   - Store token in localStorage
   - Set auth context
   - Redirect to Student Dashboard

5. Frontend → Backend: GET /api/student/laptop-requests
   Header: Authorization: Bearer eyJhbGci...

6. Backend Processing:
   a) JwtAuthenticationFilter intercepts
   b) Extract token from Authorization header
   c) JwtTokenProvider.validateToken() → Valid ✓
   d) Extract email from token
   e) CustomUserDetailsService.loadUserByUsername() → UserDetails
   f) Set SecurityContext with authentication
   g) Request proceeds to StudentController
   h) StudentController.getLaptopRequests(authentication) called
   i) Get current student from authentication principal
   j) LaptopRequestRepository.findByStudentId(studentId)
   k) Return empty list (first time)

7. Backend → Frontend: 200 OK
   {
     "success": true,
     "data": []
   }

┌─────────────────────────────────────────────────────────────────┐
│              STUDENT CREATE LAPTOP REQUEST FLOW                 │
└─────────────────────────────────────────────────────────────────┘

8. Frontend → Backend: POST /api/student/laptop-requests
   Header: Authorization: Bearer eyJhbGci...
   {
     "reason": "Need laptop for semester project"
   }

9. Backend Processing:
   a) JwtAuthenticationFilter validates token ✓
   b) Request reaches StudentController
   c) StudentController.createLaptopRequest() called
   d) Extract current student from authentication
   e) LaptopRequestService.createRequest() called
      - Validate reason not empty ✓
      - Check LaptopIssueRepository: 
        * Student has no active laptop ✓
      - Check LaptopRequestRepository:
        * Student has no pending request ✓
      - Create LaptopRequest entity:
        * student_id: 1
        * reason: "Need laptop for semester project"
        * status: PENDING
        * request_date: 2026-01-19
        * created_at: NOW()
      - Save to laptop_requests table → request_id = 1
      - NotificationService.notifyManagers():
        * Create notification for all managers
        * title: "New Laptop Request"
        * message: "John Doe requested a laptop"
      - Return LaptopRequestDTO

10. Backend → Frontend: 201 Created
    {
      "success": true,
      "message": "Laptop request created successfully",
      "data": {
        "id": 1,
        "studentId": 1,
        "reason": "Need laptop for semester project",
        "status": "PENDING",
        "requestDate": "2026-01-19"
      }
    }

11. Frontend Updates UI:
    - Add new request to "My Requests" list
    - Show success message
    - Display status as "PENDING"
```

### FLOW 2: Complete Manager Approval to Student Receiving Laptop

```
┌─────────────────────────────────────────────────────────────────┐
│              MANAGER APPROVE REQUEST FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. Manager logs in (similar to student login)
   - Token generated
   - Set as MANAGER role

2. Frontend → Backend: GET /api/manager/laptop-requests?status=PENDING
   Header: Authorization: Bearer <manager-token>

3. Backend Processing:
   a) JwtAuthenticationFilter validates manager token ✓
   b) ManagerController.getLaptopRequests() called
   c) LaptopRequestRepository.findByStatus(RequestStatus.PENDING)
   d) Join with StudentProfile to get student names
   e) Return list of pending requests

4. Backend → Frontend: 200 OK
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "studentId": 1,
         "studentName": "John Doe",
         "studentEmail": "john@example.com",
         "reason": "Need laptop for semester project",
         "status": "PENDING",
         "requestDate": "2026-01-19"
       }
     ]
   }

5. Manager UI displays request
   - Manager clicks on request
   - Sees student details
   - Checks available laptops

6. Frontend → Backend: GET /api/manager/laptops?status=AVAILABLE
   Header: Authorization: Bearer <manager-token>

7. Backend Processing:
   a) ManagerController.getAvailableLaptops() called
   b) LaptopRepository.findByStatus(LaptopStatus.AVAILABLE)
   c) Return list of available laptops

8. Backend → Frontend: 200 OK
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "serialNumber": "SN001",
         "brand": "Dell",
         "model": "XPS 13",
         "specifications": "Intel i7, 16GB, 512GB SSD",
         "status": "AVAILABLE"
       }
     ]
   }

9. Manager selects laptop and deadline
   - Selects Laptop ID: 1
   - Selects Return Deadline: 30 days

10. Frontend → Backend: POST /api/manager/laptop-requests/1/approve
    Header: Authorization: Bearer <manager-token>
    {
      "laptopId": 1,
      "issueDate": "2026-01-19",
      "returnDeadline": "2026-02-19"
    }

11. Backend Processing:
    a) ManagerController.approveLaptopRequest(requestId, approval) called
    b) LaptopRequestService.approveLaptopRequest() called
       - Get LaptopRequest by ID
       - Validate status is PENDING ✓
       - Get Laptop by ID
       - Validate laptop status is AVAILABLE ✓
       - Update LaptopRequest:
         * status: APPROVED
         * reviewed_by: manager_id
         * reviewed_at: NOW()
       - Save to laptop_requests table
       - Create LaptopIssue entity:
         * student_id: 1
         * laptop_id: 1
         * laptop_request_id: 1
         * issue_date: 2026-01-19
         * original_return_deadline: 2026-02-19
         * current_return_deadline: 2026-02-19
         * is_returned: false
         * extension_count: 0
         * issued_by: manager_id
         * created_at: NOW()
       - Save to laptop_issues table → issue_id = 1
       - Update Laptop:
         * status: ISSUED
         * updated_at: NOW()
       - Save to laptops table
       - NotificationService.notifyStudent():
         * Find student: john@example.com
         * Create notification:
           - title: "Laptop Request Approved"
           - message: "Your laptop request has been approved. Dell XPS 13 will be issued."
           - type: REQUEST_APPROVED
           - is_read: false
       - Insert to notifications table
       - Return LaptopIssueDTO with laptop details

12. Backend → Frontend: 200 OK
    {
      "success": true,
      "message": "Request approved and laptop issued",
      "data": {
        "id": 1,
        "laptopId": 1,
        "laptopBrand": "Dell",
        "laptopModel": "XPS 13",
        "issueDate": "2026-01-19",
        "returnDeadline": "2026-02-19",
        "daysRemaining": 31
      }
    }

13. Manager UI updates:
    - Request status changed to APPROVED
    - Removed from pending list
    - Added to approved list

14. Frontend → Backend (Student Dashboard):
    GET /api/student/notifications
    Header: Authorization: Bearer <student-token>

15. Backend Processing:
    a) StudentController.getNotifications() called
    b) NotificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
    c) Return all notifications

16. Backend → Frontend: 200 OK
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "Laptop Request Approved",
          "message": "Your laptop request has been approved...",
          "type": "REQUEST_APPROVED",
          "isRead": false,
          "createdAt": "2026-01-19T10:30:00Z"
        }
      ]
    }

17. Student receives notification
    - Desktop notification (if enabled)
    - Notification badge appears
    - Click to view laptop details
```

---

## 10. ERROR HANDLING

### Exception Hierarchy

```
Exception
├── RuntimeException
│   ├── BadRequestException
│   │   └── Used for validation errors, business rule violations
│   └── ResourceNotFoundException
│       └── Used for missing entities, not found scenarios
└── Checked Exceptions (wrapped in runtime)
```

### Global Exception Handler

```java
@ExceptionHandler(BadRequestException.class)
→ 400 Bad Request

@ExceptionHandler(ResourceNotFoundException.class)
→ 404 Not Found

@ExceptionHandler(MethodArgumentNotValidException.class)
→ 400 Bad Request with validation errors

@ExceptionHandler(AccessDeniedException.class)
→ 403 Forbidden

@ExceptionHandler(AuthenticationException.class)
→ 401 Unauthorized

@ExceptionHandler(Exception.class)
→ 500 Internal Server Error
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "timestamp": "2026-01-19T10:30:00Z",
  "status": 400
}
```

### Common Errors

| Error | Status | Message |
|-------|--------|---------|
| Invalid email format | 400 | Email must be valid format |
| Duplicate email | 400 | Email already exists |
| Short password | 400 | Password must be at least 6 characters |
| Student has active laptop | 400 | Student already has an active laptop |
| Invalid credentials | 401 | Invalid email or password |
| Missing token | 401 | Authorization header missing |
| Invalid token | 401 | Invalid or expired token |
| Insufficient permissions | 403 | User does not have permission |
| Laptop not found | 404 | Laptop does not exist |
| Request not found | 404 | Laptop request does not exist |
| Laptop not available | 400 | Selected laptop is not available |
| Extension limit reached | 400 | Maximum 3 extensions allowed |

---

## 11. DEPLOYMENT GUIDE

### Production Build

#### Backend

```bash
cd backend

# Build production JAR
mvn clean package -DskipTests

# JAR location: target/laptoptracker-1.0.0.jar

# Run JAR
java -jar target/laptoptracker-1.0.0.jar
```

#### Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Output directory: dist/

# Deploy to web server (nginx, Apache, etc.)
# Serve files from dist/
```

### Docker Deployment

#### Create Dockerfile (Backend)

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/laptoptracker-1.0.0.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: laptop_tracker_db
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/laptop_tracker_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  db_data:
```

### Environment Configuration

#### Backend (application.properties)

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/laptop_tracker_db
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT
jwt.secret=your-secret-key-should-be-long-and-random
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.max-age=3600
```

#### Frontend (.env.production)

```
VITE_API_URL=https://api.laptoptracker.com/api
VITE_JWT_STORAGE_KEY=laptop_tracker_jwt
```

### Deployment Checklist

- [ ] Database backup created
- [ ] SSL/HTTPS configured
- [ ] Environment variables set
- [ ] CORS properly configured
- [ ] JWT secret changed to production value
- [ ] Email notifications configured (if applicable)
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Database migrations applied
- [ ] Frontend build optimized
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Load balancer setup (if needed)
- [ ] Backup and recovery plan documented

---

## Summary

This comprehensive workflow covers the entire Laptop Issue Tracker system from initial setup through production deployment. The system provides:

✅ Secure JWT-based authentication  
✅ Complete request-response lifecycle  
✅ Role-based access control  
✅ Extension request management  
✅ Deadline tracking and notifications  
✅ Complete audit trail  
✅ Production-ready architecture  

The system is scalable, secure, and ready for educational institution deployment.

---

**Last Updated**: January 19, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
