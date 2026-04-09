# Laptop Issue Tracker - Backend API

A production-ready Spring Boot backend for managing laptop issue requests and tracking in educational institutions.

## 🚀 Technology Stack

- **Java**: 17
- **Framework**: Spring Boot 3.2.1
- **Security**: Spring Security with JWT Authentication
- **Database**: MySQL
- **ORM**: Spring Data JPA (Hibernate)
- **Build Tool**: Maven
- **Validation**: Jakarta Validation API

## 📋 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (STUDENT, MANAGER)
- BCrypt password encryption
- Separate login endpoints for students and managers

### Student Features
- User registration with student profile
- Request laptops with reasons
- View request history
- Request extensions (max 3 per laptop)
- View active laptop issues
- Receive notifications
- Track deadlines

### Manager Features
- Manage laptop inventory
- View and approve/reject laptop requests
- Issue laptops to students
- View and approve/reject extension requests
- Monitor deadlines and overdue laptops
- Mark laptops as returned
- View all student records

## 🗄️ Database Schema

### Tables
- **users**: Authentication and user roles
- **student_profiles**: Student information
- **laptops**: Laptop inventory
- **laptop_requests**: Student laptop requests
- **laptop_issues**: Approved and issued laptops
- **extension_requests**: Extension requests
- **notifications**: Student notifications

## 🛠️ Setup Instructions

### Prerequisites
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE laptop_tracker_db;
```

2. Update `application.properties` with your MySQL credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Create Default Manager Account

After running the application, execute this SQL to create a manager account:

```sql
INSERT INTO users (email, password, role, active, created_at, updated_at) 
VALUES (
  'manager@laptoptracker.com', 
  '$2a$10$xZ8YQVyLqY6hGVXJKFvG3eKrYrLqM8fVXNqMQx7YvXPxGKYqPZY6K', 
  'MANAGER', 
  true, 
  NOW(), 
  NOW()
);
```

**Default Manager Credentials:**
- Email: `manager@laptoptracker.com`
- Password: `manager123`

### Build and Run

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080/api`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### 1. Student Signup
```http
POST /auth/student/signup
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "registrationNumber": "REG2024001",
  "phoneNumber": "1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 1,
    "email": "student@example.com",
    "role": "STUDENT",
    "fullName": "John Doe",
    "registrationNumber": "REG2024001"
  }
}
```

#### 2. Student Login
```http
POST /auth/student/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### 3. Manager Login
```http
POST /auth/manager/login
Content-Type: application/json

{
  "email": "manager@laptoptracker.com",
  "password": "manager123"
}
```

### Student Endpoints

**Note:** All student endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

#### 1. Create Laptop Request
```http
POST /student/laptop-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "I need a laptop for my final year project and online classes"
}
```

#### 2. Get My Laptop Requests
```http
GET /student/laptop-requests
Authorization: Bearer <token>
```

#### 3. Get My Active Laptop Issue
```http
GET /student/laptop-issues/active
Authorization: Bearer <token>
```

#### 4. Create Extension Request
```http
POST /student/extension-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "laptopIssueId": 1,
  "reason": "Need more time to complete my project",
  "extensionDays": 7
}
```

#### 5. Get My Notifications
```http
GET /student/notifications
Authorization: Bearer <token>
```

#### 6. Mark Notification as Read
```http
PUT /student/notifications/{id}/read
Authorization: Bearer <token>
```

### Manager Endpoints

**Note:** All manager endpoints require authentication with MANAGER role.

#### 1. Add Laptop to Inventory
```http
POST /manager/laptops
Authorization: Bearer <token>
Content-Type: application/json

{
  "serialNumber": "LAP001",
  "brand": "Dell",
  "model": "Latitude 5420",
  "specifications": "Intel i5, 16GB RAM, 512GB SSD"
}
```

#### 2. Get All Laptops
```http
GET /manager/laptops
Authorization: Bearer <token>
```

#### 3. Get Available Laptops
```http
GET /manager/laptops/available
Authorization: Bearer <token>
```

#### 4. Get Pending Laptop Requests
```http
GET /manager/laptop-requests/pending
Authorization: Bearer <token>
```

#### 5. Approve Laptop Request
```http
POST /manager/laptop-requests/{id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "laptopId": 1,
  "issueDate": "2024-01-15",
  "returnDeadline": "2024-03-15"
}
```

#### 6. Reject Laptop Request
```http
POST /manager/laptop-requests/{id}/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": false,
  "rejectionReason": "No laptops currently available"
}
```

#### 7. Get Overdue Laptops
```http
GET /manager/laptop-issues/overdue
Authorization: Bearer <token>
```

#### 8. Get Laptops Nearing Deadline
```http
GET /manager/laptop-issues/nearing-deadline?days=7
Authorization: Bearer <token>
```

#### 9. Mark Laptop as Returned
```http
PUT /manager/laptop-issues/{id}/return
Authorization: Bearer <token>
```

#### 10. Get Pending Extension Requests
```http
GET /manager/extension-requests/pending
Authorization: Bearer <token>
```

#### 11. Approve Extension Request
```http
POST /manager/extension-requests/{id}/approve
Authorization: Bearer <token>
```

#### 12. Reject Extension Request
```http
POST /manager/extension-requests/{id}/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": false,
  "rejectionReason": "Extension limit reached"
}
```

## 🔒 Security

- All passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours (configurable in application.properties)
- Role-based access control enforced at controller level
- CORS enabled for frontend integration (configured for localhost:3000 and localhost:5173)

## 📁 Project Structure

```
src/main/java/com/laptoptracker/
├── config/              # Configuration classes
│   └── SecurityConfig.java
├── controller/          # REST Controllers
│   ├── AuthController.java
│   ├── StudentController.java
│   └── ManagerController.java
├── dto/                 # Data Transfer Objects
│   ├── ApiResponse.java
│   ├── AuthResponse.java
│   ├── LoginRequest.java
│   ├── StudentSignupRequest.java
│   ├── LaptopRequestDTO.java
│   ├── ExtensionRequestDTO.java
│   ├── LaptopIssueApprovalDTO.java
│   ├── RequestReviewDTO.java
│   └── LaptopDTO.java
├── entity/              # JPA Entities
│   ├── User.java
│   ├── StudentProfile.java
│   ├── Laptop.java
│   ├── LaptopRequest.java
│   ├── LaptopIssue.java
│   ├── ExtensionRequest.java
│   └── Notification.java
├── enums/               # Enumerations
│   ├── Role.java
│   ├── RequestStatus.java
│   ├── ExtensionStatus.java
│   └── LaptopStatus.java
├── exception/           # Exception Handling
│   ├── BadRequestException.java
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
├── repository/          # JPA Repositories
│   ├── UserRepository.java
│   ├── StudentProfileRepository.java
│   ├── LaptopRepository.java
│   ├── LaptopRequestRepository.java
│   ├── LaptopIssueRepository.java
│   ├── ExtensionRequestRepository.java
│   └── NotificationRepository.java
├── security/            # Security Components
│   ├── JwtTokenProvider.java
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtAuthenticationEntryPoint.java
├── service/             # Business Logic
│   ├── AuthService.java
│   ├── LaptopService.java
│   ├── LaptopRequestService.java
│   ├── LaptopIssueService.java
│   ├── ExtensionRequestService.java
│   └── NotificationService.java
└── LaptopIssueTrackerApplication.java  # Main Application
```

## 🧪 Testing with Postman

1. Import the API endpoints into Postman
2. Create a new environment with variable `base_url` = `http://localhost:8080/api`
3. Create a new environment variable `token` to store JWT tokens
4. After login, save the token and use it in subsequent requests

## 🌐 Frontend Integration

The backend is configured to work with React frontends running on:
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

Update CORS configuration in `SecurityConfig.java` if using different ports.

## 📝 Business Rules

1. **Laptop Requests:**
   - Students can only have one active laptop at a time
   - Students cannot have multiple pending requests

2. **Extensions:**
   - Maximum 3 extensions per laptop issue
   - Cannot request extension for returned laptops
   - Only one pending extension request at a time

3. **Laptop Returns:**
   - Manager must mark laptop as returned
   - Laptop becomes available after return

4. **Notifications:**
   - Automatic notifications sent on:
     - Request approval/rejection
     - Extension approval/rejection
     - Laptop return confirmation

## 🚨 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

This project is developed for educational purposes.
