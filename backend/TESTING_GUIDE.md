# 🧪 Testing Guide - Laptop Issue Tracker Backend

## Complete Testing Workflow

This guide walks you through testing the entire application workflow from start to finish.

---

## Prerequisites

- ✅ Backend is running on `http://localhost:8080/api`
- ✅ Database is set up with default manager account
- ✅ Postman, cURL, or similar API testing tool ready

---

## Test Workflow Overview

```
1. Manager Login
   ↓
2. Add Laptops to Inventory
   ↓
3. Student Registration
   ↓
4. Student Login
   ↓
5. Student Requests Laptop
   ↓
6. Manager Approves Request
   ↓
7. Student Requests Extension
   ↓
8. Manager Approves Extension
   ↓
9. Manager Marks Laptop Returned
   ↓
10. Verify Notifications
```

---

## 📝 Test Case 1: Manager Login

**Objective**: Authenticate as manager and get JWT token

**Request**:
```bash
curl -X POST http://localhost:8080/api/auth/manager/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@laptoptracker.com",
    "password": "manager123"
  }'
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 1,
    "email": "manager@laptoptracker.com",
    "role": "MANAGER"
  }
}
```

**What to Save**: Copy the `token` value for subsequent requests

**Validation**:
- ✅ Response status is 200
- ✅ Token is present
- ✅ Role is "MANAGER"

---

## 📝 Test Case 2: Add Laptop to Inventory

**Objective**: Add laptops that can be issued to students

**Request**:
```bash
curl -X POST http://localhost:8080/api/manager/laptops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -d '{
    "serialNumber": "LAP-TEST-001",
    "brand": "Dell",
    "model": "Latitude 5420",
    "specifications": "Intel i5-1145G7, 16GB RAM, 512GB SSD"
  }'
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Laptop added successfully",
  "data": {
    "id": 1,
    "serialNumber": "LAP-TEST-001",
    "brand": "Dell",
    "model": "Latitude 5420",
    "status": "AVAILABLE"
  }
}
```

**What to Save**: Copy the laptop `id`

**Validation**:
- ✅ Response status is 201
- ✅ Laptop status is "AVAILABLE"
- ✅ Serial number matches

**Repeat this test** to add 2-3 more laptops for testing.

---

## 📝 Test Case 3: Student Registration

**Objective**: Register a new student account

**Request**:
```bash
curl -X POST http://localhost:8080/api/auth/student/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@university.edu",
    "password": "student123",
    "fullName": "John Doe",
    "registrationNumber": "REG2024001",
    "phoneNumber": "9876543210",
    "address": "Room 205, Dormitory A"
  }'
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 2,
    "email": "john.doe@university.edu",
    "role": "STUDENT",
    "fullName": "John Doe",
    "registrationNumber": "REG2024001"
  }
}
```

**What to Save**: Copy the student `token` and `id`

**Validation**:
- ✅ Response status is 201
- ✅ Token is present
- ✅ Role is "STUDENT"
- ✅ Email and registration number match

---

## 📝 Test Case 4: Student Login

**Objective**: Login with student credentials

**Request**:
```bash
curl -X POST http://localhost:8080/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@university.edu",
    "password": "student123"
  }'
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 2,
    "email": "john.doe@university.edu",
    "role": "STUDENT",
    "fullName": "John Doe",
    "registrationNumber": "REG2024001"
  }
}
```

**Validation**:
- ✅ Response status is 200
- ✅ New token generated
- ✅ User details match registration

---

## 📝 Test Case 5: Create Laptop Request

**Objective**: Student requests a laptop

**Request**:
```bash
curl -X POST http://localhost:8080/api/student/laptop-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -d '{
    "reason": "I need a laptop for my final year project on Machine Learning. The project requires running computational tasks and I do not have a personal laptop."
  }'
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Laptop request submitted successfully",
  "data": {
    "id": 1,
    "reason": "I need a laptop for my final year project...",
    "requestDate": "2024-01-15",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

**What to Save**: Copy the request `id`

**Validation**:
- ✅ Response status is 201
- ✅ Status is "PENDING"
- ✅ Request date is today

---

## 📝 Test Case 6: Manager Views Pending Requests

**Objective**: Manager sees the pending request

**Request**:
```bash
curl -X GET http://localhost:8080/api/manager/laptop-requests/pending \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Pending laptop requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "student": {
        "fullName": "John Doe",
        "registrationNumber": "REG2024001"
      },
      "reason": "I need a laptop for my final year project...",
      "status": "PENDING",
      "requestDate": "2024-01-15"
    }
  ]
}
```

**Validation**:
- ✅ Response status is 200
- ✅ Request appears in pending list
- ✅ Student details are correct

---

## 📝 Test Case 7: Manager Approves Request

**Objective**: Manager approves the request and issues laptop

**Request**:
```bash
curl -X POST http://localhost:8080/api/manager/laptop-requests/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -d '{
    "laptopId": 1,
    "issueDate": "2024-01-16",
    "returnDeadline": "2024-03-16"
  }'
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Laptop request approved and laptop issued successfully",
  "data": {
    "id": 1,
    "laptop": {
      "id": 1,
      "brand": "Dell",
      "model": "Latitude 5420",
      "serialNumber": "LAP-TEST-001"
    },
    "issueDate": "2024-01-16",
    "originalReturnDeadline": "2024-03-16",
    "currentReturnDeadline": "2024-03-16",
    "isReturned": false,
    "extensionCount": 0
  }
}
```

**What to Save**: Copy the laptop issue `id`

**Validation**:
- ✅ Response status is 200
- ✅ Laptop is issued
- ✅ Return deadline is set correctly
- ✅ Extension count is 0

---

## 📝 Test Case 8: Student Views Active Laptop

**Objective**: Student checks their active laptop issue

**Request**:
```bash
curl -X GET http://localhost:8080/api/student/laptop-issues/active \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Active laptop issue retrieved successfully",
  "data": {
    "id": 1,
    "laptop": {
      "brand": "Dell",
      "model": "Latitude 5420",
      "serialNumber": "LAP-TEST-001"
    },
    "issueDate": "2024-01-16",
    "currentReturnDeadline": "2024-03-16",
    "isReturned": false,
    "extensionCount": 0
  }
}
```

**Validation**:
- ✅ Active laptop is shown
- ✅ Details match approved request
- ✅ Extension count is 0

---

## 📝 Test Case 9: Student Checks Notifications

**Objective**: Verify approval notification was created

**Request**:
```bash
curl -X GET http://localhost:8080/api/student/notifications \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response (200 OK)**:
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
    }
  ]
}
```

**Validation**:
- ✅ Notification exists
- ✅ Title is "Laptop Request Approved"
- ✅ isRead is false

---

## 📝 Test Case 10: Create Extension Request

**Objective**: Student requests extension of deadline

**Request**:
```bash
curl -X POST http://localhost:8080/api/student/extension-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -d '{
    "laptopIssueId": 1,
    "reason": "My project deadline has been extended by the professor. I need 7 more days to complete testing.",
    "extensionDays": 7
  }'
```

**Expected Response (201 Created)**:
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
    "status": "PENDING"
  }
}
```

**What to Save**: Copy the extension request `id`

**Validation**:
- ✅ Response status is 201
- ✅ Status is "PENDING"
- ✅ Extension days is 7

---

## 📝 Test Case 11: Manager Approves Extension

**Objective**: Manager approves the extension request

**Request**:
```bash
curl -X POST http://localhost:8080/api/manager/extension-requests/1/approve \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Extension request approved successfully"
}
```

**Validation**:
- ✅ Response status is 200
- ✅ Success message received

---

## 📝 Test Case 12: Verify Extension Applied

**Objective**: Check that deadline was extended

**Request**:
```bash
curl -X GET http://localhost:8080/api/student/laptop-issues/active \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Active laptop issue retrieved successfully",
  "data": {
    "id": 1,
    "originalReturnDeadline": "2024-03-16",
    "currentReturnDeadline": "2024-03-23",
    "extensionCount": 1
  }
}
```

**Validation**:
- ✅ Current deadline is 7 days after original
- ✅ Extension count is 1

---

## 📝 Test Case 13: Manager Views Overdue Laptops

**Objective**: Check overdue laptop monitoring (use past deadline for testing)

**Request**:
```bash
curl -X GET http://localhost:8080/api/manager/laptop-issues/overdue \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Overdue laptops retrieved successfully",
  "data": []
}
```

**Validation**:
- ✅ Response status is 200
- ✅ Empty array (no overdue laptops yet)

---

## 📝 Test Case 14: Manager Marks Laptop Returned

**Objective**: Student returns laptop, manager marks it returned

**Request**:
```bash
curl -X PUT http://localhost:8080/api/manager/laptop-issues/1/return \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Laptop marked as returned successfully"
}
```

**Validation**:
- ✅ Response status is 200
- ✅ Success message received

---

## 📝 Test Case 15: Verify Laptop Available Again

**Objective**: Check that laptop is available in inventory

**Request**:
```bash
curl -X GET http://localhost:8080/api/manager/laptops/available \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Available laptops retrieved successfully",
  "data": [
    {
      "id": 1,
      "serialNumber": "LAP-TEST-001",
      "brand": "Dell",
      "model": "Latitude 5420",
      "status": "AVAILABLE"
    }
  ]
}
```

**Validation**:
- ✅ Laptop appears in available list
- ✅ Status is "AVAILABLE"

---

## 🚫 Negative Test Cases

### Test: Student Cannot Have Multiple Active Laptops

**Request**:
```bash
curl -X POST http://localhost:8080/api/student/laptop-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -d '{
    "reason": "Need another laptop"
  }'
```

**Expected Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "You already have an active laptop. Please return it before requesting a new one."
}
```

### Test: Invalid Login Credentials

**Request**:
```bash
curl -X POST http://localhost:8080/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@university.edu",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Test: Accessing Endpoint Without Token

**Request**:
```bash
curl -X GET http://localhost:8080/api/student/laptop-requests
```

**Expected Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### Test: Student Accessing Manager Endpoint

**Request**:
```bash
curl -X GET http://localhost:8080/api/manager/laptops \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response (403 Forbidden)**

### Test: Extension Limit Exceeded

After 3 extensions, request 4th:

**Expected Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Maximum extension limit (3) reached"
}
```

---

## ✅ Testing Checklist

### Authentication Tests
- [ ] Manager can login
- [ ] Student can signup
- [ ] Student can login
- [ ] Invalid credentials are rejected
- [ ] Token is required for protected endpoints

### Student Workflow Tests
- [ ] Student can create laptop request
- [ ] Student can view own requests
- [ ] Student can view active laptop issue
- [ ] Student can request extension
- [ ] Student can view notifications
- [ ] Student cannot have multiple active laptops
- [ ] Student cannot exceed 3 extensions

### Manager Workflow Tests
- [ ] Manager can add laptops
- [ ] Manager can view all laptops
- [ ] Manager can view pending requests
- [ ] Manager can approve requests
- [ ] Manager can reject requests
- [ ] Manager can view overdue laptops
- [ ] Manager can approve extensions
- [ ] Manager can mark laptop returned

### Notification Tests
- [ ] Notification created on request approval
- [ ] Notification created on request rejection
- [ ] Notification created on extension approval
- [ ] Notification created on laptop return
- [ ] Student can mark notifications as read

### Business Logic Tests
- [ ] Laptop status changes to ISSUED when approved
- [ ] Laptop status changes to AVAILABLE when returned
- [ ] Extension count increments on approval
- [ ] Deadline extends by requested days
- [ ] Cannot approve already processed requests

---

## 🔍 Database Verification

After testing, verify in MySQL:

```sql
-- Check users
SELECT * FROM users;

-- Check student profiles
SELECT * FROM student_profiles;

-- Check laptops
SELECT * FROM laptops;

-- Check requests
SELECT * FROM laptop_requests;

-- Check issues
SELECT * FROM laptop_issues;

-- Check extensions
SELECT * FROM extension_requests;

-- Check notifications
SELECT * FROM notifications;
```

---

## 📊 Performance Testing

### Basic Load Test (Optional)

Test with multiple students:
1. Create 10 student accounts
2. Each creates a laptop request
3. Manager approves all
4. Each requests extension
5. Manager approves all extensions

**Expected**: All operations should complete successfully without errors.

---

## 🎉 Testing Complete!

If all tests pass, the backend is working correctly and ready for integration with the frontend!

**Next Steps**:
1. Connect React frontend
2. Implement UI for all tested workflows
3. Add additional validation on frontend
4. Deploy to staging environment
