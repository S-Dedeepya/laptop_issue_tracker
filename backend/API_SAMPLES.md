# Laptop Issue Tracker - API Sample Requests

This document contains sample JSON requests and responses for testing the API.

## Authentication

### 1. Student Signup

**Request:**
```json
POST /api/auth/student/signup
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "registrationNumber": "REG2024001",
  "phoneNumber": "9876543210",
  "address": "123 University Avenue, Dormitory A, Room 205"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUB1bml2ZXJzaXR5LmVkdSIsImlhdCI6MTcwNTI0ODAwMCwiZXhwIjoxNzA1MzM0NDAwfQ.abc123...",
    "type": "Bearer",
    "id": 1,
    "email": "john.doe@university.edu",
    "role": "STUDENT",
    "fullName": "John Doe",
    "registrationNumber": "REG2024001"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 2. Student Login

**Request:**
```json
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 1,
    "email": "john.doe@university.edu",
    "role": "STUDENT",
    "fullName": "John Doe",
    "registrationNumber": "REG2024001"
  }
}
```

### 3. Manager Login

**Request:**
```json
POST /api/auth/manager/login
Content-Type: application/json

{
  "email": "manager@laptoptracker.com",
  "password": "manager123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 2,
    "email": "manager@laptoptracker.com",
    "role": "MANAGER",
    "fullName": null,
    "registrationNumber": null
  }
}
```

## Student Endpoints

### 1. Create Laptop Request

**Request:**
```json
POST /api/student/laptop-requests
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "reason": "I need a laptop for my final year project on Machine Learning. The project requires running heavy computational tasks and I don't have a personal laptop with sufficient specifications."
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Laptop request submitted successfully",
  "data": {
    "id": 1,
    "student": {
      "id": 1,
      "fullName": "John Doe",
      "registrationNumber": "REG2024001"
    },
    "reason": "I need a laptop for my final year project...",
    "requestDate": "2024-01-15",
    "status": "PENDING",
    "rejectionReason": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

### 2. Get My Laptop Requests

**Request:**
```json
GET /api/student/laptop-requests
Authorization: Bearer <student_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Laptop requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "reason": "I need a laptop for my final year project...",
      "requestDate": "2024-01-15",
      "status": "APPROVED",
      "createdAt": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "reason": "Previous laptop was returned...",
      "requestDate": "2024-01-10",
      "status": "REJECTED",
      "rejectionReason": "No laptops available at the moment",
      "createdAt": "2024-01-10T09:15:00"
    }
  ]
}
```

### 3. Get My Active Laptop Issue

**Request:**
```json
GET /api/student/laptop-issues/active
Authorization: Bearer <student_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Active laptop issue retrieved successfully",
  "data": {
    "id": 1,
    "student": {
      "id": 1,
      "fullName": "John Doe"
    },
    "laptop": {
      "id": 1,
      "serialNumber": "LAP001",
      "brand": "Dell",
      "model": "Latitude 5420",
      "specifications": "Intel i5, 16GB RAM, 512GB SSD"
    },
    "issueDate": "2024-01-16",
    "originalReturnDeadline": "2024-03-16",
    "currentReturnDeadline": "2024-03-23",
    "isReturned": false,
    "extensionCount": 1,
    "createdAt": "2024-01-16T11:00:00"
  }
}
```

### 4. Create Extension Request

**Request:**
```json
POST /api/student/extension-requests
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "laptopIssueId": 1,
  "reason": "My project deadline has been extended by the professor. I need the laptop for 7 more days to complete the final documentation and testing.",
  "extensionDays": 7
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Extension request submitted successfully",
  "data": {
    "id": 1,
    "laptopIssue": {
      "id": 1
    },
    "reason": "My project deadline has been extended...",
    "extensionDays": 7,
    "status": "PENDING",
    "createdAt": "2024-03-10T14:20:00"
  }
}
```

### 5. Get My Notifications

**Request:**
```json
GET /api/student/notifications
Authorization: Bearer <student_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Laptop Request Approved",
      "message": "Your laptop request has been approved. Laptop Dell Latitude 5420 has been issued to you. Return deadline: 2024-03-16",
      "isRead": false,
      "createdAt": "2024-01-16T11:00:00"
    },
    {
      "id": 2,
      "title": "Extension Request Approved",
      "message": "Your extension request has been approved. New deadline: 2024-03-23. Extensions used: 1/3",
      "isRead": true,
      "createdAt": "2024-03-11T09:30:00"
    }
  ]
}
```

## Manager Endpoints

### 1. Add Laptop to Inventory

**Request:**
```json
POST /api/manager/laptops
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "serialNumber": "LAP006",
  "brand": "Dell",
  "model": "XPS 15 9520",
  "specifications": "Intel i7-12700H, 32GB DDR5 RAM, 1TB NVMe SSD, NVIDIA RTX 3050 Ti"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Laptop added successfully",
  "data": {
    "id": 6,
    "serialNumber": "LAP006",
    "brand": "Dell",
    "model": "XPS 15 9520",
    "specifications": "Intel i7-12700H, 32GB DDR5 RAM...",
    "status": "AVAILABLE",
    "createdAt": "2024-01-15T08:00:00"
  }
}
```

### 2. Get Pending Laptop Requests

**Request:**
```json
GET /api/manager/laptop-requests/pending
Authorization: Bearer <manager_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending laptop requests retrieved successfully",
  "data": [
    {
      "id": 5,
      "student": {
        "id": 3,
        "fullName": "Jane Smith",
        "registrationNumber": "REG2024003"
      },
      "reason": "Need laptop for web development course...",
      "requestDate": "2024-01-15",
      "status": "PENDING",
      "createdAt": "2024-01-15T13:45:00"
    }
  ]
}
```

### 3. Approve Laptop Request

**Request:**
```json
POST /api/manager/laptop-requests/5/approve
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "laptopId": 2,
  "issueDate": "2024-01-16",
  "returnDeadline": "2024-04-16"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Laptop request approved and laptop issued successfully",
  "data": {
    "id": 2,
    "student": {
      "id": 3,
      "fullName": "Jane Smith"
    },
    "laptop": {
      "id": 2,
      "brand": "HP",
      "model": "EliteBook 840 G8"
    },
    "issueDate": "2024-01-16",
    "originalReturnDeadline": "2024-04-16",
    "currentReturnDeadline": "2024-04-16",
    "isReturned": false,
    "extensionCount": 0
  }
}
```

### 4. Reject Laptop Request

**Request:**
```json
POST /api/manager/laptop-requests/6/reject
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "approved": false,
  "rejectionReason": "All laptops are currently issued. Please try again after 2 weeks."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Laptop request rejected successfully"
}
```

### 5. Get Overdue Laptops

**Request:**
```json
GET /api/manager/laptop-issues/overdue
Authorization: Bearer <manager_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Overdue laptops retrieved successfully",
  "data": [
    {
      "id": 3,
      "student": {
        "id": 4,
        "fullName": "Mike Johnson",
        "registrationNumber": "REG2024004"
      },
      "laptop": {
        "id": 3,
        "brand": "Lenovo",
        "model": "ThinkPad X1 Carbon"
      },
      "currentReturnDeadline": "2024-01-10",
      "isReturned": false
    }
  ]
}
```

### 6. Get Laptops Nearing Deadline

**Request:**
```json
GET /api/manager/laptop-issues/nearing-deadline?days=7
Authorization: Bearer <manager_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Laptops nearing deadline retrieved successfully",
  "data": [
    {
      "id": 1,
      "student": {
        "fullName": "John Doe"
      },
      "laptop": {
        "brand": "Dell",
        "model": "Latitude 5420"
      },
      "currentReturnDeadline": "2024-01-20"
    }
  ]
}
```

### 7. Approve Extension Request

**Request:**
```json
POST /api/manager/extension-requests/1/approve
Authorization: Bearer <manager_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Extension request approved successfully"
}
```

### 8. Reject Extension Request

**Request:**
```json
POST /api/manager/extension-requests/2/reject
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "approved": false,
  "rejectionReason": "You have already used all 3 extensions. No further extensions can be granted."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Extension request rejected successfully"
}
```

### 9. Mark Laptop as Returned

**Request:**
```json
PUT /api/manager/laptop-issues/1/return
Authorization: Bearer <manager_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Laptop marked as returned successfully"
}
```

## Error Responses

### Validation Error Example

**Request with Invalid Data:**
```json
POST /api/auth/student/signup
{
  "email": "invalid-email",
  "password": "123",
  "fullName": "",
  "registrationNumber": ""
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters",
    "fullName": "Full name is required",
    "registrationNumber": "Registration number is required"
  }
}
```

### Unauthorized Access Example

**Request without Token:**
```json
GET /api/student/laptop-requests
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### Business Logic Error Example

**Request:**
```json
POST /api/student/laptop-requests
Authorization: Bearer <student_token>
{
  "reason": "Need another laptop"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "You already have an active laptop. Please return it before requesting a new one."
}
```
