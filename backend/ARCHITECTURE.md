# 🏗️ Architecture Diagram - Laptop Issue Tracker Backend

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                              │
│                     (localhost:3000 / 5173)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/HTTPS
                             │ JSON + JWT Token
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SPRING BOOT BACKEND                            │
│                     (localhost:8080/api)                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              SECURITY LAYER (JWT Filter)                      │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  JwtAuthenticationFilter  →  JwtTokenProvider          │ │ │
│  │  │  CustomUserDetailsService →  SecurityConfig             │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              CONTROLLER LAYER (REST APIs)                     │ │
│  │  ┌──────────────┬──────────────┬──────────────────────────┐  │ │
│  │  │  Auth        │   Student    │      Manager             │  │ │
│  │  │  Controller  │   Controller │      Controller          │  │ │
│  │  │              │              │                          │  │ │
│  │  │  - signup    │  - requests  │  - laptops CRUD          │  │ │
│  │  │  - login     │  - issues    │  - approve/reject        │  │ │
│  │  │              │  - extensions│  - monitor deadlines     │  │ │
│  │  │              │  - notifs    │  - mark returned         │  │ │
│  │  └──────────────┴──────────────┴──────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER (Business Logic)                   │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  AuthService           LaptopRequestService             │ │ │
│  │  │  LaptopService         LaptopIssueService               │ │ │
│  │  │  ExtensionRequestService   NotificationService          │ │ │
│  │  │                                                          │ │ │
│  │  │  • Business rules validation                            │ │ │
│  │  │  • Transaction management                               │ │ │
│  │  │  • Data transformation                                  │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              REPOSITORY LAYER (Data Access)                   │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  UserRepository              LaptopRepository           │ │ │
│  │  │  StudentProfileRepository    LaptopRequestRepository    │ │ │
│  │  │  LaptopIssueRepository       ExtensionRequestRepository │ │ │
│  │  │  NotificationRepository                                 │ │ │
│  │  │                                                          │ │ │
│  │  │  • JPA/Hibernate abstraction                            │ │ │
│  │  │  • Custom query methods                                 │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              ENTITY LAYER (Domain Models)                     │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  User                 Laptop                            │ │ │
│  │  │  StudentProfile       LaptopRequest                     │ │ │
│  │  │  LaptopIssue         ExtensionRequest                   │ │ │
│  │  │  Notification                                           │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           EXCEPTION HANDLING (Global Handler)                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  GlobalExceptionHandler                                 │ │ │
│  │  │  • BadRequestException                                  │ │ │
│  │  │  • ResourceNotFoundException                            │ │ │
│  │  │  • Validation errors                                    │ │ │
│  │  │  • Authentication errors                                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ JDBC
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MySQL DATABASE                               │
│                     (laptop_tracker_db)                             │
│                                                                     │
│  Tables: users, student_profiles, laptops,                         │
│          laptop_requests, laptop_issues,                           │
│          extension_requests, notifications                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Student Registration Flow
```
Frontend
   │
   │ POST /api/auth/student/signup
   │ { email, password, fullName, registrationNumber }
   │
   ▼
AuthController
   │
   ▼
AuthService
   │
   ├─► Check email exists (UserRepository)
   ├─► Check registration number exists (StudentProfileRepository)
   ├─► Create User entity (encrypt password with BCrypt)
   ├─► Save User (UserRepository)
   ├─► Create StudentProfile entity
   ├─► Save StudentProfile (StudentProfileRepository)
   ├─► Generate JWT token (JwtTokenProvider)
   │
   ▼
Response with JWT token
```

### 2. Laptop Request Flow
```
Student Frontend
   │
   │ POST /api/student/laptop-requests
   │ Authorization: Bearer <token>
   │ { reason }
   │
   ▼
JwtAuthenticationFilter
   │
   ├─► Extract token
   ├─► Validate token
   ├─► Load user details
   │
   ▼
StudentController
   │
   ▼
LaptopRequestService
   │
   ├─► Get current student (AuthService)
   ├─► Check active laptop (LaptopIssueRepository)
   ├─► Check pending request (LaptopRequestRepository)
   ├─► Create LaptopRequest entity
   ├─► Save LaptopRequest (LaptopRequestRepository)
   │
   ▼
Response with created request
```

### 3. Manager Approve Request Flow
```
Manager Frontend
   │
   │ POST /api/manager/laptop-requests/{id}/approve
   │ Authorization: Bearer <token>
   │ { laptopId, issueDate, returnDeadline }
   │
   ▼
JwtAuthenticationFilter
   │
   ├─► Validate manager token
   │
   ▼
ManagerController
   │
   ▼
LaptopIssueService
   │
   ├─► Get laptop request (LaptopRequestRepository)
   ├─► Validate request status
   ├─► Get laptop (LaptopRepository)
   ├─► Check laptop availability
   ├─► Update request status to APPROVED
   ├─► Create LaptopIssue entity
   ├─► Save LaptopIssue (LaptopIssueRepository)
   ├─► Update laptop status to ISSUED
   ├─► Create notification (NotificationService)
   │
   ▼
Response with laptop issue details
```

---

## Security Flow

```
Client Request
   │
   │ Headers: Authorization: Bearer <JWT_TOKEN>
   │
   ▼
JwtAuthenticationFilter
   │
   ├─► Extract JWT from header
   │
   ▼
JwtTokenProvider
   │
   ├─► Parse token
   ├─► Validate signature
   ├─► Check expiration
   ├─► Extract username (email)
   │
   ▼
CustomUserDetailsService
   │
   ├─► Load user by email
   ├─► Get role (STUDENT/MANAGER)
   │
   ▼
SecurityContextHolder
   │
   ├─► Set authentication
   │
   ▼
Controller (with @PreAuthorize)
   │
   ├─► Check role matches endpoint requirement
   │
   ▼
Proceed to business logic
```

---

## Database Relationships

```
┌──────────────┐
│    User      │
│              │
│ - id         │
│ - email      │◄─────────┐
│ - password   │          │
│ - role       │          │ 1:1
└──────────────┘          │
                          │
                 ┌────────┴──────────┐
                 │ StudentProfile    │
                 │                   │
                 │ - id              │
                 │ - fullName        │
                 │ - regNumber       │
                 └─────────┬─────────┘
                           │
                ┌──────────┼──────────┬───────────┐
                │ 1:N      │ 1:N      │ 1:N       │
                ▼          ▼          ▼           ▼
        ┌────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐
        │  Laptop    │ │ Laptop  │ │ Laptop   │ │Notification  │
        │  Request   │ │ Issue   │ │ Issue    │ │              │
        └──────┬─────┘ └────┬────┘ └──────────┘ └──────────────┘
               │            │
               │ 1:1        │ 1:N
               │            │
               ▼            ▼
        ┌────────────┐ ┌────────────────┐
        │  Laptop    │ │   Extension    │
        │  Issue     │ │   Request      │
        └────────────┘ └────────────────┘
               │
               │ N:1
               ▼
        ┌────────────┐
        │   Laptop   │
        │            │
        │ - id       │
        │ - serial   │
        │ - brand    │
        │ - status   │
        └────────────┘
```

---

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST PROCESSING                        │
└─────────────────────────────────────────────────────────────┘

1. HTTP Request arrives
   ↓
2. Security Filter Chain
   ├─► CORS Filter (check origin)
   ├─► JWT Authentication Filter (validate token)
   └─► Authorization Filter (check role)
   ↓
3. Controller
   ├─► Validate request body (@Valid)
   ├─► Map DTO to domain objects
   └─► Call service layer
   ↓
4. Service Layer
   ├─► Business logic validation
   ├─► Transaction management (@Transactional)
   ├─► Call repository layer
   └─► Create notifications
   ↓
5. Repository Layer
   ├─► JPA query execution
   └─► Hibernate ORM
   ↓
6. Database
   ├─► Execute SQL
   └─► Return results
   ↓
7. Response Processing
   ├─► Map entities to DTOs
   ├─► Wrap in ApiResponse
   └─► Return JSON with HTTP status
   ↓
8. Exception Handling (if error occurs)
   ├─► GlobalExceptionHandler
   ├─► Map exception to error response
   └─► Return appropriate HTTP status
```

---

## Role-Based Access Control

```
┌──────────────────────────────────────────────────────────┐
│                    PUBLIC ENDPOINTS                       │
│                   (No authentication)                     │
├──────────────────────────────────────────────────────────┤
│  • POST /api/auth/student/signup                         │
│  • POST /api/auth/student/login                          │
│  • POST /api/auth/manager/login                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   STUDENT ENDPOINTS                       │
│            @PreAuthorize("hasRole('STUDENT')")           │
├──────────────────────────────────────────────────────────┤
│  • POST   /api/student/laptop-requests                   │
│  • GET    /api/student/laptop-requests                   │
│  • GET    /api/student/laptop-issues                     │
│  • GET    /api/student/laptop-issues/active              │
│  • POST   /api/student/extension-requests                │
│  • GET    /api/student/extension-requests                │
│  • GET    /api/student/notifications                     │
│  • PUT    /api/student/notifications/{id}/read           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   MANAGER ENDPOINTS                       │
│            @PreAuthorize("hasRole('MANAGER')")           │
├──────────────────────────────────────────────────────────┤
│  • POST   /api/manager/laptops                           │
│  • GET    /api/manager/laptops                           │
│  • PUT    /api/manager/laptops/{id}                      │
│  • DELETE /api/manager/laptops/{id}                      │
│  • GET    /api/manager/laptop-requests                   │
│  • POST   /api/manager/laptop-requests/{id}/approve      │
│  • POST   /api/manager/laptop-requests/{id}/reject       │
│  • GET    /api/manager/laptop-issues/overdue             │
│  • PUT    /api/manager/laptop-issues/{id}/return         │
│  • POST   /api/manager/extension-requests/{id}/approve   │
└──────────────────────────────────────────────────────────┘
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  • Spring Web MVC                                       │
│  • REST Controllers                                     │
│  • JSON Serialization (Jackson)                         │
│  • Request/Response DTOs                                │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYER                        │
│  • Spring Security                                      │
│  • JWT (JSON Web Tokens)                                │
│  • BCrypt Password Encoding                             │
│  • Role-Based Access Control                            │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LAYER                         │
│  • Service Classes                                      │
│  • Business Logic                                       │
│  • Transaction Management                               │
│  • Validation                                           │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                       │
│  • Spring Data JPA                                      │
│  • Hibernate ORM                                        │
│  • Repository Interfaces                                │
│  • Entity Relationships                                 │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                        │
│  • MySQL 8.0                                            │
│  • Relational Schema                                    │
│  • Indexes and Constraints                              │
│  • Transactions (ACID)                                  │
└─────────────────────────────────────────────────────────┘
```

---

This architecture follows industry best practices:
- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Injection**: Loose coupling between components
- **Security First**: JWT authentication and role-based access
- **Scalability**: Stateless API design
- **Maintainability**: Clean code structure
- **Testability**: Each layer can be tested independently
