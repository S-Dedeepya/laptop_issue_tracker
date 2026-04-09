# 📚 Laptop Issue Tracker - Complete API Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication APIs](#authentication-apis)
- [Student APIs](#student-apis)
- [Manager APIs](#manager-apis)

---

## 🔍 Overview

The Laptop Issue Tracker API provides a comprehensive system for managing laptop requests, issues, and extensions in an educational institution. The system supports two user roles:

- **Students**: Can request laptops, view their issues, and request extensions
- **Managers**: Can manage laptops, approve/reject requests, and monitor all issues

---

## 🌐 Base URL

```
http://localhost:8080/api
```

All endpoints are prefixed with `/api` as specified in the application configuration.

---

## 🔐 Authentication

### Authentication Type

The API uses **JWT (JSON Web Token)** based authentication.

### Token Usage

After successful login, you will receive a JWT token in the response. Include this token in subsequent requests:

**Header:**

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

- Token expires after **24 hours** (86400000 milliseconds)

---

## 📤 Response Format

All API responses follow a standard format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 200         | OK - Request successful                 |
| 201         | Created - Resource created successfully |
| 400         | Bad Request - Invalid input             |
| 401         | Unauthorized - Authentication required  |
| 403         | Forbidden - Insufficient permissions    |
| 404         | Not Found - Resource not found          |
| 500         | Internal Server Error                   |

### Common Error Messages

- **400 Bad Request**: Validation errors, invalid data format
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Attempting to access resources without proper role
- **404 Not Found**: Requested resource doesn't exist

---

## 🔑 Authentication APIs

### 1. Student Signup

**Endpoint:** `POST /auth/student/signup`

**Description:** Register a new student account

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "registrationNumber": "REG12345",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, State"
}
```

**Field Validations:**

- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters
- `fullName`: Required, 2-100 characters
- `registrationNumber`: Required, 5-50 characters
- `phoneNumber`: Optional
- `address`: Optional

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "email": "student@example.com",
    "role": "STUDENT",
    "fullName": "John Doe"
  }
}
```

---

### 2. Student Login

**Endpoint:** `POST /auth/student/login`

**Description:** Authenticate and login as a student

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Field Validations:**

- `email`: Required, must be valid email format
- `password`: Required

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "email": "student@example.com",
    "role": "STUDENT",
    "fullName": "John Doe"
  }
}
```

---

### 3. Manager Login

**Endpoint:** `POST /auth/manager/login`

**Description:** Authenticate and login as a manager

**Request Body:**

```json
{
  "email": "manager@example.com",
  "password": "password123"
}
```

**Field Validations:**

- `email`: Required, must be valid email format
- `password`: Required

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 2,
    "email": "manager@example.com",
    "role": "MANAGER",
    "fullName": "Jane Manager"
  }
}
```

---

## 🎓 Student APIs

**Required:** All student endpoints require `STUDENT` role authentication.

**Header Required:**

```
Authorization: Bearer <student-jwt-token>
```

---

### 📱 Laptop Requests

#### 1. Create Laptop Request

**Endpoint:** `POST /student/laptop-requests`

**Description:** Submit a new laptop request

**Request Body:**

```json
{
  "reason": "I need a laptop for my software development course project that requires high-performance computing."
}
```

**Field Validations:**

- `reason`: Required, 10-500 characters

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
      "registrationNumber": "REG12345"
    },
    "reason": "I need a laptop for my software development course project...",
    "status": "PENDING",
    "requestDate": "2026-01-11T10:30:00",
    "reviewedBy": null,
    "reviewDate": null,
    "rejectionReason": null
  }
}
```

---

#### 2. Get My Laptop Requests

**Endpoint:** `GET /student/laptop-requests`

**Description:** Retrieve all laptop requests made by the authenticated student

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "reason": "Need laptop for project work",
      "status": "APPROVED",
      "requestDate": "2026-01-10T10:30:00",
      "reviewedBy": {
        "id": 2,
        "fullName": "Jane Manager"
      },
      "reviewDate": "2026-01-11T09:00:00",
      "rejectionReason": null
    },
    {
      "id": 2,
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "reason": "Urgent requirement for semester exam preparation",
      "status": "PENDING",
      "requestDate": "2026-01-11T10:30:00",
      "reviewedBy": null,
      "reviewDate": null,
      "rejectionReason": null
    }
  ]
}
```

**Status Values:** `PENDING`, `APPROVED`, `REJECTED`

---

### 💻 Laptop Issues

#### 3. Get My Laptop Issue History

**Endpoint:** `GET /student/laptop-issues`

**Description:** Retrieve complete laptop issue history for the authenticated student

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop issue history retrieved successfully",
  "data": [
    {
      "id": 1,
      "laptop": {
        "id": 1,
        "serialNumber": "LAP001",
        "brand": "Dell",
        "model": "Latitude 5520",
        "specifications": "Intel i5, 8GB RAM, 256GB SSD"
      },
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "issueDate": "2026-01-05",
      "returnDeadline": "2026-01-19",
      "actualReturnDate": "2026-01-18",
      "status": "RETURNED",
      "isOverdue": false
    }
  ]
}
```

**Status Values:** `ISSUED`, `RETURNED`, `OVERDUE`

---

#### 4. Get My Active Laptop Issue

**Endpoint:** `GET /student/laptop-issues/active`

**Description:** Retrieve currently active laptop issue (if any) for the authenticated student

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Active laptop issue retrieved successfully",
  "data": {
    "id": 2,
    "laptop": {
      "id": 3,
      "serialNumber": "LAP003",
      "brand": "HP",
      "model": "EliteBook 840",
      "specifications": "Intel i7, 16GB RAM, 512GB SSD"
    },
    "student": {
      "id": 1,
      "fullName": "John Doe",
      "registrationNumber": "REG12345"
    },
    "issueDate": "2026-01-11",
    "returnDeadline": "2026-01-25",
    "actualReturnDate": null,
    "status": "ISSUED",
    "isOverdue": false
  }
}
```

**Note:** Returns `null` if no active issue exists

---

### 📅 Extension Requests

#### 5. Create Extension Request

**Endpoint:** `POST /student/extension-requests`

**Description:** Submit a request to extend the laptop return deadline

**Request Body:**

```json
{
  "laptopIssueId": 2,
  "reason": "My project deadline has been extended by 10 days due to additional requirements from the supervisor.",
  "extensionDays": 10
}
```

**Field Validations:**

- `laptopIssueId`: Required, must be a valid active laptop issue
- `reason`: Required, 10-500 characters
- `extensionDays`: Required, minimum 1 day

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Extension request submitted successfully",
  "data": {
    "id": 1,
    "laptopIssue": {
      "id": 2,
      "laptop": {
        "serialNumber": "LAP003",
        "brand": "HP",
        "model": "EliteBook 840"
      }
    },
    "student": {
      "id": 1,
      "fullName": "John Doe"
    },
    "reason": "My project deadline has been extended...",
    "extensionDays": 10,
    "status": "PENDING",
    "requestDate": "2026-01-11T14:30:00",
    "reviewedBy": null,
    "reviewDate": null,
    "rejectionReason": null
  }
}
```

---

#### 6. Get My Extension Requests

**Endpoint:** `GET /student/extension-requests`

**Description:** Retrieve all extension requests made by the authenticated student

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Extension requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "laptopIssue": {
        "id": 2,
        "laptop": {
          "serialNumber": "LAP003",
          "brand": "HP",
          "model": "EliteBook 840"
        }
      },
      "student": {
        "id": 1,
        "fullName": "John Doe"
      },
      "reason": "Project deadline extended",
      "extensionDays": 10,
      "status": "APPROVED",
      "requestDate": "2026-01-11T14:30:00",
      "reviewedBy": {
        "id": 2,
        "fullName": "Jane Manager"
      },
      "reviewDate": "2026-01-11T15:00:00",
      "rejectionReason": null
    }
  ]
}
```

**Status Values:** `PENDING`, `APPROVED`, `REJECTED`

---

### 🔔 Notifications

#### 7. Get My Notifications

**Endpoint:** `GET /student/notifications`

**Description:** Retrieve all notifications for the authenticated student

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 1,
      "message": "Your laptop request has been approved",
      "isRead": true,
      "createdAt": "2026-01-11T09:00:00"
    },
    {
      "id": 2,
      "message": "Your extension request has been approved. New deadline: 2026-02-04",
      "isRead": false,
      "createdAt": "2026-01-11T15:00:00"
    },
    {
      "id": 3,
      "message": "Reminder: Your laptop is due for return on 2026-02-04",
      "isRead": false,
      "createdAt": "2026-01-11T16:00:00"
    }
  ]
}
```

---

#### 8. Get My Unread Notifications

**Endpoint:** `GET /student/notifications/unread`

**Description:** Retrieve only unread notifications

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Unread notifications retrieved successfully",
  "data": [
    {
      "id": 2,
      "message": "Your extension request has been approved. New deadline: 2026-02-04",
      "isRead": false,
      "createdAt": "2026-01-11T15:00:00"
    },
    {
      "id": 3,
      "message": "Reminder: Your laptop is due for return on 2026-02-04",
      "isRead": false,
      "createdAt": "2026-01-11T16:00:00"
    }
  ]
}
```

---

#### 9. Get Unread Notification Count

**Endpoint:** `GET /student/notifications/unread/count`

**Description:** Get the count of unread notifications

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Unread notification count retrieved successfully",
  "data": 2
}
```

---

#### 10. Mark Notification as Read

**Endpoint:** `PUT /student/notifications/{id}/read`

**Description:** Mark a specific notification as read

**Path Parameters:**

- `id`: Notification ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": null
}
```

---

#### 11. Mark All Notifications as Read

**Endpoint:** `PUT /student/notifications/read-all`

**Description:** Mark all notifications as read for the authenticated student

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": null
}
```

---

## 👔 Manager APIs

**Required:** All manager endpoints require `MANAGER` role authentication.

**Header Required:**

```
Authorization: Bearer <manager-jwt-token>
```

---

### 💼 Laptop Management

#### 1. Add New Laptop

**Endpoint:** `POST /manager/laptops`

**Description:** Add a new laptop to the inventory

**Request Body:**

```json
{
  "serialNumber": "LAP005",
  "brand": "Dell",
  "model": "XPS 15",
  "specifications": "Intel i7, 16GB RAM, 512GB SSD, NVIDIA GTX 1650"
}
```

**Field Validations:**

- `serialNumber`: Required, must be unique
- `brand`: Required
- `model`: Required
- `specifications`: Optional

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Laptop added successfully",
  "data": {
    "id": 5,
    "serialNumber": "LAP005",
    "brand": "Dell",
    "model": "XPS 15",
    "specifications": "Intel i7, 16GB RAM, 512GB SSD, NVIDIA GTX 1650",
    "status": "AVAILABLE",
    "createdAt": "2026-01-11T10:00:00",
    "updatedAt": "2026-01-11T10:00:00"
  }
}
```

---

#### 2. Get All Laptops

**Endpoint:** `GET /manager/laptops`

**Description:** Retrieve all laptops in the inventory

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptops retrieved successfully",
  "data": [
    {
      "id": 1,
      "serialNumber": "LAP001",
      "brand": "Dell",
      "model": "Latitude 5520",
      "specifications": "Intel i5, 8GB RAM, 256GB SSD",
      "status": "ISSUED",
      "createdAt": "2026-01-01T10:00:00",
      "updatedAt": "2026-01-11T09:00:00"
    },
    {
      "id": 2,
      "serialNumber": "LAP002",
      "brand": "HP",
      "model": "ProBook 450",
      "specifications": "Intel i5, 8GB RAM, 512GB HDD",
      "status": "AVAILABLE",
      "createdAt": "2026-01-01T10:00:00",
      "updatedAt": "2026-01-01T10:00:00"
    }
  ]
}
```

**Status Values:** `AVAILABLE`, `ISSUED`, `MAINTENANCE`

---

#### 3. Get Available Laptops

**Endpoint:** `GET /manager/laptops/available`

**Description:** Retrieve only available laptops that can be issued

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Available laptops retrieved successfully",
  "data": [
    {
      "id": 2,
      "serialNumber": "LAP002",
      "brand": "HP",
      "model": "ProBook 450",
      "specifications": "Intel i5, 8GB RAM, 512GB HDD",
      "status": "AVAILABLE",
      "createdAt": "2026-01-01T10:00:00",
      "updatedAt": "2026-01-01T10:00:00"
    }
  ]
}
```

---

#### 4. Get Laptop by ID

**Endpoint:** `GET /manager/laptops/{id}`

**Description:** Retrieve details of a specific laptop

**Path Parameters:**

- `id`: Laptop ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop retrieved successfully",
  "data": {
    "id": 1,
    "serialNumber": "LAP001",
    "brand": "Dell",
    "model": "Latitude 5520",
    "specifications": "Intel i5, 8GB RAM, 256GB SSD",
    "status": "ISSUED",
    "createdAt": "2026-01-01T10:00:00",
    "updatedAt": "2026-01-11T09:00:00"
  }
}
```

---

#### 5. Update Laptop

**Endpoint:** `PUT /manager/laptops/{id}`

**Description:** Update laptop information

**Path Parameters:**

- `id`: Laptop ID

**Request Body:**

```json
{
  "serialNumber": "LAP001-UPDATED",
  "brand": "Dell",
  "model": "Latitude 5520",
  "specifications": "Intel i5, 16GB RAM (Upgraded), 512GB SSD"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop updated successfully",
  "data": {
    "id": 1,
    "serialNumber": "LAP001-UPDATED",
    "brand": "Dell",
    "model": "Latitude 5520",
    "specifications": "Intel i5, 16GB RAM (Upgraded), 512GB SSD",
    "status": "ISSUED",
    "createdAt": "2026-01-01T10:00:00",
    "updatedAt": "2026-01-11T11:00:00"
  }
}
```

---

#### 6. Delete Laptop

**Endpoint:** `DELETE /manager/laptops/{id}`

**Description:** Delete a laptop from the inventory

**Path Parameters:**

- `id`: Laptop ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop deleted successfully",
  "data": null
}
```

**Note:** Only laptops with status `AVAILABLE` can be deleted

---

### 📋 Laptop Request Management

#### 7. Get All Laptop Requests

**Endpoint:** `GET /manager/laptop-requests`

**Description:** Retrieve all laptop requests from all students

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "reason": "Need laptop for project work",
      "status": "APPROVED",
      "requestDate": "2026-01-10T10:30:00",
      "reviewedBy": {
        "id": 2,
        "fullName": "Jane Manager"
      },
      "reviewDate": "2026-01-11T09:00:00",
      "rejectionReason": null
    }
  ]
}
```

---

#### 8. Get Pending Laptop Requests

**Endpoint:** `GET /manager/laptop-requests/pending`

**Description:** Retrieve only pending laptop requests that need review

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Pending laptop requests retrieved successfully",
  "data": [
    {
      "id": 3,
      "student": {
        "id": 5,
        "fullName": "Alice Smith",
        "registrationNumber": "REG67890"
      },
      "reason": "Required for research work and data analysis",
      "status": "PENDING",
      "requestDate": "2026-01-11T10:30:00",
      "reviewedBy": null,
      "reviewDate": null,
      "rejectionReason": null
    }
  ]
}
```

---

#### 9. Get Laptop Request by ID

**Endpoint:** `GET /manager/laptop-requests/{id}`

**Description:** Retrieve details of a specific laptop request

**Path Parameters:**

- `id`: Laptop Request ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop request retrieved successfully",
  "data": {
    "id": 1,
    "student": {
      "id": 1,
      "fullName": "John Doe",
      "registrationNumber": "REG12345",
      "email": "john@example.com"
    },
    "reason": "Need laptop for project work",
    "status": "PENDING",
    "requestDate": "2026-01-10T10:30:00",
    "reviewedBy": null,
    "reviewDate": null,
    "rejectionReason": null
  }
}
```

---

#### 10. Approve Laptop Request and Issue Laptop

**Endpoint:** `POST /manager/laptop-requests/{id}/approve`

**Description:** Approve a laptop request and issue a laptop to the student

**Path Parameters:**

- `id`: Laptop Request ID

**Request Body:**

```json
{
  "laptopId": 2,
  "issueDate": "2026-01-11",
  "returnDeadline": "2026-01-25"
}
```

**Field Validations:**

- `laptopId`: Required, must be an available laptop
- `issueDate`: Required, cannot be in the past
- `returnDeadline`: Required, must be after issue date

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop request approved and laptop issued successfully",
  "data": {
    "id": 3,
    "laptop": {
      "id": 2,
      "serialNumber": "LAP002",
      "brand": "HP",
      "model": "ProBook 450"
    },
    "student": {
      "id": 1,
      "fullName": "John Doe",
      "registrationNumber": "REG12345"
    },
    "issueDate": "2026-01-11",
    "returnDeadline": "2026-01-25",
    "actualReturnDate": null,
    "status": "ISSUED",
    "isOverdue": false
  }
}
```

---

#### 11. Reject Laptop Request

**Endpoint:** `POST /manager/laptop-requests/{id}/reject`

**Description:** Reject a laptop request with a reason

**Path Parameters:**

- `id`: Laptop Request ID

**Request Body:**

```json
{
  "approved": false,
  "rejectionReason": "Insufficient justification. Please provide more details about the academic requirement."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop request rejected successfully",
  "data": null
}
```

---

### 🖥️ Laptop Issue Management

#### 12. Get All Laptop Issues

**Endpoint:** `GET /manager/laptop-issues`

**Description:** Retrieve all laptop issues (issued laptops)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop issues retrieved successfully",
  "data": [
    {
      "id": 1,
      "laptop": {
        "id": 1,
        "serialNumber": "LAP001",
        "brand": "Dell",
        "model": "Latitude 5520"
      },
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "issueDate": "2026-01-05",
      "returnDeadline": "2026-01-19",
      "actualReturnDate": "2026-01-18",
      "status": "RETURNED",
      "isOverdue": false
    }
  ]
}
```

---

#### 13. Get Active Laptop Issues

**Endpoint:** `GET /manager/laptop-issues/active`

**Description:** Retrieve all currently active (not returned) laptop issues

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Active laptop issues retrieved successfully",
  "data": [
    {
      "id": 2,
      "laptop": {
        "id": 3,
        "serialNumber": "LAP003",
        "brand": "HP",
        "model": "EliteBook 840"
      },
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "issueDate": "2026-01-11",
      "returnDeadline": "2026-01-25",
      "actualReturnDate": null,
      "status": "ISSUED",
      "isOverdue": false
    }
  ]
}
```

---

#### 14. Get Overdue Laptops

**Endpoint:** `GET /manager/laptop-issues/overdue`

**Description:** Retrieve all laptop issues where the return deadline has passed

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Overdue laptops retrieved successfully",
  "data": [
    {
      "id": 5,
      "laptop": {
        "id": 4,
        "serialNumber": "LAP004",
        "brand": "Lenovo",
        "model": "ThinkPad E14"
      },
      "student": {
        "id": 3,
        "fullName": "Bob Johnson",
        "registrationNumber": "REG54321"
      },
      "issueDate": "2025-12-20",
      "returnDeadline": "2026-01-03",
      "actualReturnDate": null,
      "status": "OVERDUE",
      "isOverdue": true
    }
  ]
}
```

---

#### 15. Get Laptops Nearing Deadline

**Endpoint:** `GET /manager/laptop-issues/nearing-deadline`

**Description:** Retrieve laptop issues nearing their return deadline

**Query Parameters:**

- `days`: Number of days threshold (default: 7)

**Example Request:**

```
GET /manager/laptop-issues/nearing-deadline?days=3
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptops nearing deadline retrieved successfully",
  "data": [
    {
      "id": 6,
      "laptop": {
        "id": 5,
        "serialNumber": "LAP005",
        "brand": "Dell",
        "model": "XPS 15"
      },
      "student": {
        "id": 4,
        "fullName": "Charlie Brown",
        "registrationNumber": "REG11111"
      },
      "issueDate": "2026-01-08",
      "returnDeadline": "2026-01-14",
      "actualReturnDate": null,
      "status": "ISSUED",
      "isOverdue": false
    }
  ]
}
```

---

#### 16. Get Laptop Issue by ID

**Endpoint:** `GET /manager/laptop-issues/{id}`

**Description:** Retrieve details of a specific laptop issue

**Path Parameters:**

- `id`: Laptop Issue ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop issue retrieved successfully",
  "data": {
    "id": 2,
    "laptop": {
      "id": 3,
      "serialNumber": "LAP003",
      "brand": "HP",
      "model": "EliteBook 840",
      "specifications": "Intel i7, 16GB RAM, 512GB SSD"
    },
    "student": {
      "id": 1,
      "fullName": "John Doe",
      "registrationNumber": "REG12345",
      "email": "john@example.com"
    },
    "issueDate": "2026-01-11",
    "returnDeadline": "2026-01-25",
    "actualReturnDate": null,
    "status": "ISSUED",
    "isOverdue": false
  }
}
```

---

#### 17. Mark Laptop as Returned

**Endpoint:** `PUT /manager/laptop-issues/{id}/return`

**Description:** Mark a laptop as returned by a student

**Path Parameters:**

- `id`: Laptop Issue ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Laptop marked as returned successfully",
  "data": null
}
```

**Note:** This updates the laptop status to `AVAILABLE` and sets the `actualReturnDate` to current date

---

### ⏰ Extension Request Management

#### 18. Get All Extension Requests

**Endpoint:** `GET /manager/extension-requests`

**Description:** Retrieve all extension requests from all students

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Extension requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "laptopIssue": {
        "id": 2,
        "laptop": {
          "serialNumber": "LAP003",
          "brand": "HP",
          "model": "EliteBook 840"
        }
      },
      "student": {
        "id": 1,
        "fullName": "John Doe",
        "registrationNumber": "REG12345"
      },
      "reason": "Project deadline extended",
      "extensionDays": 10,
      "status": "APPROVED",
      "requestDate": "2026-01-11T14:30:00",
      "reviewedBy": {
        "id": 2,
        "fullName": "Jane Manager"
      },
      "reviewDate": "2026-01-11T15:00:00",
      "rejectionReason": null
    }
  ]
}
```

---

#### 19. Get Pending Extension Requests

**Endpoint:** `GET /manager/extension-requests/pending`

**Description:** Retrieve only pending extension requests that need review

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Pending extension requests retrieved successfully",
  "data": [
    {
      "id": 2,
      "laptopIssue": {
        "id": 6,
        "laptop": {
          "serialNumber": "LAP005",
          "brand": "Dell",
          "model": "XPS 15"
        }
      },
      "student": {
        "id": 4,
        "fullName": "Charlie Brown",
        "registrationNumber": "REG11111"
      },
      "reason": "Additional time needed for thesis completion",
      "extensionDays": 7,
      "status": "PENDING",
      "requestDate": "2026-01-11T16:00:00",
      "reviewedBy": null,
      "reviewDate": null,
      "rejectionReason": null
    }
  ]
}
```

---

#### 20. Get Extension Request by ID

**Endpoint:** `GET /manager/extension-requests/{id}`

**Description:** Retrieve details of a specific extension request

**Path Parameters:**

- `id`: Extension Request ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Extension request retrieved successfully",
  "data": {
    "id": 1,
    "laptopIssue": {
      "id": 2,
      "laptop": {
        "serialNumber": "LAP003",
        "brand": "HP",
        "model": "EliteBook 840"
      },
      "issueDate": "2026-01-11",
      "returnDeadline": "2026-01-25"
    },
    "student": {
      "id": 1,
      "fullName": "John Doe",
      "registrationNumber": "REG12345",
      "email": "john@example.com"
    },
    "reason": "Project deadline extended",
    "extensionDays": 10,
    "status": "PENDING",
    "requestDate": "2026-01-11T14:30:00",
    "reviewedBy": null,
    "reviewDate": null,
    "rejectionReason": null
  }
}
```

---

#### 21. Approve Extension Request

**Endpoint:** `POST /manager/extension-requests/{id}/approve`

**Description:** Approve an extension request and extend the return deadline

**Path Parameters:**

- `id`: Extension Request ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Extension request approved successfully",
  "data": null
}
```

**Note:** This automatically updates the laptop issue's return deadline by adding the requested extension days

---

#### 22. Reject Extension Request

**Endpoint:** `POST /manager/extension-requests/{id}/reject`

**Description:** Reject an extension request with a reason

**Path Parameters:**

- `id`: Extension Request ID

**Request Body:**

```json
{
  "approved": false,
  "rejectionReason": "Extension cannot be granted. Please return the laptop by the original deadline."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Extension request rejected successfully",
  "data": null
}
```

---

## 📊 Data Models

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "STUDENT | MANAGER"
}
```

### Student Profile

```json
{
  "id": 1,
  "registrationNumber": "REG12345",
  "phoneNumber": "+1234567890",
  "address": "123 Main St"
}
```

### Laptop

```json
{
  "id": 1,
  "serialNumber": "LAP001",
  "brand": "Dell",
  "model": "Latitude 5520",
  "specifications": "Intel i5, 8GB RAM, 256GB SSD",
  "status": "AVAILABLE | ISSUED | MAINTENANCE"
}
```

### Laptop Request

```json
{
  "id": 1,
  "student": {
    /* Student object */
  },
  "reason": "Need for project work",
  "status": "PENDING | APPROVED | REJECTED",
  "requestDate": "2026-01-11T10:30:00",
  "reviewedBy": {
    /* Manager object */
  },
  "reviewDate": "2026-01-11T15:00:00",
  "rejectionReason": "Optional rejection reason"
}
```

### Laptop Issue

```json
{
  "id": 1,
  "laptop": {
    /* Laptop object */
  },
  "student": {
    /* Student object */
  },
  "issueDate": "2026-01-11",
  "returnDeadline": "2026-01-25",
  "actualReturnDate": "2026-01-24",
  "status": "ISSUED | RETURNED | OVERDUE",
  "isOverdue": false
}
```

### Extension Request

```json
{
  "id": 1,
  "laptopIssue": {
    /* Laptop Issue object */
  },
  "student": {
    /* Student object */
  },
  "reason": "Need more time for project",
  "extensionDays": 10,
  "status": "PENDING | APPROVED | REJECTED",
  "requestDate": "2026-01-11T14:30:00",
  "reviewedBy": {
    /* Manager object */
  },
  "reviewDate": "2026-01-11T15:00:00",
  "rejectionReason": "Optional rejection reason"
}
```

### Notification

```json
{
  "id": 1,
  "message": "Your laptop request has been approved",
  "isRead": false,
  "createdAt": "2026-01-11T10:00:00"
}
```

---

## 🔧 Common Use Cases

### For Students

#### 1. Complete Workflow: Request and Receive Laptop

```
1. POST /auth/student/signup (Register)
2. POST /auth/student/login (Login)
3. POST /student/laptop-requests (Submit request)
4. GET /student/notifications (Check approval status)
5. GET /student/laptop-issues/active (View issued laptop details)
```

#### 2. Request Extension

```
1. GET /student/laptop-issues/active (Get current laptop issue ID)
2. POST /student/extension-requests (Submit extension request)
3. GET /student/notifications (Check extension approval)
```

### For Managers

#### 1. Process Laptop Request

```
1. POST /auth/manager/login (Login)
2. GET /manager/laptop-requests/pending (View pending requests)
3. GET /manager/laptops/available (Check available laptops)
4. POST /manager/laptop-requests/{id}/approve (Approve and issue)
```

#### 2. Monitor Overdue Laptops

```
1. GET /manager/laptop-issues/overdue (Check overdue laptops)
2. GET /manager/laptop-issues/nearing-deadline?days=3 (Check upcoming deadlines)
```

#### 3. Process Extension Request

```
1. GET /manager/extension-requests/pending (View pending extensions)
2. POST /manager/extension-requests/{id}/approve (Approve extension)
   OR
   POST /manager/extension-requests/{id}/reject (Reject extension)
```

---

## 📝 Notes

1. **Authentication**: All endpoints except signup and login require JWT authentication
2. **Role-Based Access**: Student endpoints require STUDENT role, Manager endpoints require MANAGER role
3. **CORS**: All endpoints support CORS with `*` origin (configured for development)
4. **Date Format**: All dates use ISO 8601 format
5. **Timezone**: All timestamps are in UTC
6. **Validation**: Request bodies are validated automatically with detailed error messages

---

## 🛡️ Security Considerations

- JWT tokens are required for all protected endpoints
- Passwords are hashed using BCrypt
- Role-based access control is enforced at the controller level
- SQL injection protection through JPA/Hibernate
- Input validation on all request DTOs

---

## 📧 Support

For API issues or questions, please contact the development team or refer to the project documentation.

---

**Last Updated:** January 11, 2026  
**API Version:** 1.0.0  
**Base URL:** http://localhost:8080/api
