# Project Structure Documentation

## Overview
This is a full-stack Laptop Issue Tracking System with a Spring Boot backend (Java 17) and a React/TypeScript frontend using Vite.

---

## Backend Structure

### Location: `/backend`

```
backend/
├── pom.xml                          # Maven configuration (Java 17, Spring Boot 3.2.1)
├── src/
│   ├── main/
│   │   ├── java/com/laptoptracker/
│   │   │   ├── LaptopIssueTrackerApplication.java    # Spring Boot application entry point
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java               # Spring Security configuration
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java               # Authentication endpoints
│   │   │   │   ├── ManagerController.java            # Manager-specific endpoints
│   │   │   │   └── StudentController.java            # Student-specific endpoints
│   │   │   ├── dto/                                   # Data Transfer Objects
│   │   │   ├── entity/
│   │   │   │   ├── User.java                         # User entity
│   │   │   │   ├── StudentProfile.java               # Student profile details
│   │   │   │   ├── Laptop.java                       # Laptop device entity
│   │   │   │   ├── LaptopIssue.java                  # Issue report entity
│   │   │   │   ├── LaptopRequest.java                # Laptop request entity
│   │   │   │   ├── ExtensionRequest.java             # Extension request entity
│   │   │   │   └── Notification.java                 # Notification entity
│   │   │   ├── enums/                                 # Enumerations (roles, statuses)
│   │   │   ├── exception/                             # Custom exception classes
│   │   │   ├── repository/                            # JPA repositories
│   │   │   ├── security/
│   │   │   │   ├── JwtTokenProvider.java             # JWT token generation/validation
│   │   │   │   ├── JwtAuthenticationFilter.java      # JWT authentication filter
│   │   │   │   ├── JwtAuthenticationEntryPoint.java  # JWT error handling
│   │   │   │   └── CustomUserDetailsService.java     # Custom user details service
│   │   │   └── service/
│   │   │       ├── AuthService.java                  # Authentication logic
│   │   │       ├── LaptopService.java                # Laptop management
│   │   │       ├── LaptopIssueService.java           # Issue tracking
│   │   │       ├── LaptopRequestService.java         # Laptop requests
│   │   │       ├── ExtensionRequestService.java      # Extension requests
│   │   │       └── NotificationService.java          # Notification handling
│   │   └── resources/
│   │       └── application.properties                 # Application configuration
│   └── test/                                          # Test files
├── target/                          # Compiled output (Maven build)
├── README.md                        # Backend documentation
├── QUICK_START.md                   # Quick start guide
├── ARCHITECTURE.md                  # Architecture documentation
├── API_DOCUMENTATION.md             # API endpoints reference
├── API_SAMPLES.md                   # API usage samples
├── PROJECT_SUMMARY.md               # Project summary
├── TESTING_GUIDE.md                 # Testing documentation
├── INDEX.md                         # Documentation index
├── DEBUG_EXTENSIONS.md              # Debug extensions documentation
└── database_schema.sql              # Database schema
```

### Backend Technology Stack
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: SQL-based (see `database_schema.sql`)
- **Security**: Spring Security + JWT Authentication
- **ORM**: Spring Data JPA
- **Validation**: Spring Validation

### Backend Key Modules

| Module | Purpose |
|--------|---------|
| Controller | REST API endpoints for Auth, Manager, and Student |
| Service | Business logic layer |
| Repository | Data access layer (JPA) |
| Entity | Domain models |
| Security | JWT-based authentication & Spring Security config |
| DTO | Data Transfer Objects for API communication |
| Exception | Custom exception handling |

---

## Frontend Structure

### Location: `/frontend`

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── main.tsx                     # React entry point
│   ├── App.tsx                      # Main App component
│   ├── App.css                      # Global styles
│   ├── index.css                    # Global index styles
│   ├── assets/                      # Images, icons, etc.
│   ├── components/
│   │   ├── ProfileModal.tsx         # Profile modal component
│   │   ├── example.tsx              # Example component
│   │   └── ui/                      # Reusable UI components
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── combobox.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── form.tsx
│   │       ├── input-group.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx           # Toast notifications
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   ├── api-client.ts            # API client for backend communication
│   │   └── utils.ts                 # Utility functions
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx        # User login page
│   │   │   └── SignupPage.tsx       # User registration page
│   │   ├── manager/                 # Manager role pages
│   │   │   ├── ManagerLayout.tsx    # Manager layout wrapper
│   │   │   ├── ManagerDashboard.tsx # Manager dashboard
│   │   │   ├── ManagerLaptops.tsx   # Manage laptops
│   │   │   ├── ManagerLaptopIssues.tsx              # Manage issues
│   │   │   ├── ManagerLaptopIssuesFilter.tsx        # Issue filtering
│   │   │   ├── ManagerLaptopRequests.tsx            # Manage laptop requests
│   │   │   └── ManagerExtensions.tsx                # Manage extensions
│   │   └── student/                 # Student role pages
│   │       ├── StudentLayout.tsx    # Student layout wrapper
│   │       ├── StudentDashboard.tsx # Student dashboard
│   │       ├── StudentLaptopIssues.tsx              # Report/view issues
│   │       ├── StudentLaptopRequests.tsx            # Request laptops
│   │       ├── StudentExtensions.tsx                # Request extensions
│   │       └── StudentNotifications.tsx             # View notifications
│   ├── services/
│   │   ├── auth.service.ts          # Authentication service
│   │   ├── manager.service.ts       # Manager API calls
│   │   ├── student.service.ts       # Student API calls
│   │   └── profile.service.ts       # Profile-related API calls
│   ├── store/
│   │   ├── auth.store.ts            # Authentication state management
│   │   └── notification.store.ts    # Notification state management
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── hugeicons.d.ts               # Icon library type definitions
├── package.json                     # Node dependencies
├── package-lock.json                # Dependency lock file
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # TypeScript app configuration
├── tsconfig.node.json               # TypeScript node configuration
├── components.json                  # Component configuration
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── .env                             # Environment variables
├── .env.example                     # Example environment variables
├── README.md                        # Frontend documentation
└── README_FRONTEND.md               # Additional frontend documentation
```

### Frontend Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (with potential Tailwind/Shadcn components)
- **State Management**: Custom store (auth.store.ts, notification.store.ts)
- **HTTP Client**: Custom API client (api-client.ts)
- **UI Components**: Shadcn-style component library
- **Linting**: ESLint
- **Icons**: HugeIcons

### Frontend Key Modules

| Module | Purpose |
|--------|---------|
| Pages | Full-page components for different routes and roles |
| Components | Reusable UI components (modals, dialogs, tables, etc.) |
| Services | API communication layer |
| Store | State management (authentication, notifications) |
| Types | TypeScript interface and type definitions |
| Lib | Utility functions and API client configuration |

### Frontend Role-Based Pages

#### Manager Pages
- Dashboard: Overview and statistics
- Laptops: View and manage all laptops
- Laptop Issues: Track and resolve issues
- Laptop Requests: Approve/deny laptop requests
- Extensions: Manage device usage extensions

#### Student Pages
- Dashboard: Personal overview
- Laptop Issues: Report and view issues
- Laptop Requests: Request new laptops
- Extensions: Request usage extensions
- Notifications: View system notifications

---

## API Integration

The frontend communicates with the backend through:
- **Base API Client**: `frontend/src/lib/api-client.ts`
- **Service Layer**: `frontend/src/services/`
- **Backend Endpoints**: Documented in `backend/API_DOCUMENTATION.md`

---

## Build & Deployment

### Backend
- Build: `mvn clean package`
- Run: `java -jar target/laptop-issue-tracker-1.0.0.jar`

### Frontend
- Build: `npm run build`
- Preview: `npm run preview`
- Development: `npm run dev`

---

## Database

- Schema: `backend/database_schema.sql`
- ORM: Spring Data JPA
- Entities: Located in `backend/src/main/java/com/laptoptracker/entity/`

---

## Security

- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-based access control (RBAC)
- **Roles**: Student, Manager, Admin (configurable in enums)
- **Provider**: Spring Security with custom JWT filter

---

## Documentation Files

| File | Purpose |
|------|---------|
| [README.md](backend/README.md) | Backend overview |
| [QUICK_START.md](backend/QUICK_START.md) | Quick start instructions |
| [ARCHITECTURE.md](backend/ARCHITECTURE.md) | Architecture overview |
| [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) | Detailed API endpoints |
| [API_SAMPLES.md](backend/API_SAMPLES.md) | API usage examples |
| [TESTING_GUIDE.md](backend/TESTING_GUIDE.md) | Testing instructions |
| [PROJECT_SUMMARY.md](backend/PROJECT_SUMMARY.md) | Project summary |
