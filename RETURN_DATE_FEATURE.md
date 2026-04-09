# Laptop Request Return Date Feature - Implementation Guide

## Overview
This implementation adds comprehensive return date management to the laptop request system, allowing students to specify their intended return dates and managers to approve or override these dates with proper notifications.

## Changes Summary

### Database Schema Changes

**New Columns in `laptop_requests` table:**
```sql
ALTER TABLE laptop_requests ADD COLUMN requested_return_date DATE AFTER request_date;
ALTER TABLE laptop_requests ADD COLUMN manager_approved_return_date DATE AFTER status;
ALTER TABLE laptop_requests ADD COLUMN manager_return_date_reason VARCHAR(500) AFTER manager_approved_return_date;
```

### Backend Changes

#### 1. Entity Model (`LaptopRequest.java`)
- Added `requestedReturnDate` field: Stores the date the student wants to return the laptop
- Added `managerApprovedReturnDate` field: Stores the date set by manager if different from student's request
- Added `managerReturnDateReason` field: Explanation when manager overrides the return date

#### 2. Data Transfer Objects
- **`LaptopRequestDTO.java`** - Updated to include `requestedReturnDate` field with validation
- **`RequestApprovalDTO.java`** - New DTO for manager approval with:
  - `issueDate`: When the laptop is issued
  - `approveRequestedDate`: Boolean indicating if manager approves student's return date
  - `returnDeadline`: The actual return deadline (student's or manager's)
  - `returnDateReason`: Reason for changing the date
  - Validation method to ensure manager's date is earlier than student's (if overriding)

#### 3. Service Layer (`LaptopIssueService.java`)
- **`approveLaptopRequest(Long requestId, RequestApprovalDTO approvalDTO)`**
  - Validates that manager's return deadline (if overriding) is earlier than student's requested date
  - Stores both requested and approved dates for audit purposes
  - Sends notification to student with appropriate message if date is modified
  - Uses laptop from the request (selected by student) instead of allowing manager to select

- **`approveLaptopRequestLegacy(...)`**
  - Backward compatibility method for legacy API calls

#### 4. Validation Logic (`LaptopRequestService.java`)
- Validates that `requestedReturnDate` is after `requestDate`
- Enforces minimum date validation

#### 5. API Controller (`ManagerController.java`)
- Updated `/manager/laptop-requests/{id}/approve` to use `RequestApprovalDTO`

### Frontend Changes

#### 1. Types (`src/types/index.ts`)
Updated interfaces:
- **`LaptopRequestDTO`**: Added `requestedReturnDate: string`
- **`LaptopRequest`**: Added optional fields:
  - `requestedReturnDate?: string`
  - `managerApprovedReturnDate?: string`
  - `managerReturnDateReason?: string`

#### 2. Student Component (`StudentLaptopRequests.tsx`)
**Form Changes:**
- Added "Requested return date" date picker field
- Validation ensures return date is after request date
- Conditional rendering: laptops only load when all 3 fields are complete (reason, request date, return date)

**Submission:**
- Includes `requestedReturnDate` in the API request
- Client-side validation before submission

**Request History Table:**
- Added "Requested Return Date" column
- Displays formatted return date or "—" if not set

#### 3. Manager Component (`ManagerLaptopRequests.tsx`)
**Approval Dialog:**
- Displays student's requested return date in a highlighted box
- Approval form with two clear options:
  1. **"Yes, approve the student's requested return date"** (Radio button)
     - Return deadline field is disabled and auto-populated
  2. **"No, set a different (earlier) return deadline"** (Radio button)
     - Return deadline field is enabled
     - Requires a "Reason for Different Return Date"
     - Enforces that manager's date must be earlier than student's

**Validation:**
- Prevents saving if manager's date is same as or later than student's requested date
- Shows helpful error messages

**Notification:**
- When date is modified, student receives detailed notification including:
  - Original requested date
  - New approved date
  - Manager's reason

### Service Layer (`manager.service.ts`)
- Updated `approveLaptopRequest` to accept flexible data structure (changed from `LaptopIssueApprovalDTO`)

## User Interface Behavior

### Student Flow
1. Fill in reason for laptop request (min 10 characters)
2. Select date they need the laptop
3. **[NEW]** Select when they plan to return it (must be after start date)
4. Once all fields complete, available laptops appear
5. Select a laptop specification
6. Submit request
7. See their requested return date in the request history

### Manager Flow
1. View pending laptop requests
2. Click "Approve" on a request
3. In the approval dialog:
   - See student's requested return date prominently displayed
   - Choose: Approve the requested date OR set a different date
   - If approving student's date: Issue date field + auto-filled return deadline
   - If modifying: Issue date + custom return deadline (must be earlier) + required reason
4. Click "Approve & Issue"
5. Student automatically receives notification with decision details

## Business Rules Enforced

✅ **Frontend Validation:**
- Return date must be after request date
- Return date is required
- Manager's return deadline must be earlier than student's requested date
- Reason is required when manager overrides return date

✅ **Backend Validation:**
- Same validations as frontend (server-side)
- Prevents data integrity issues
- Returns clear error messages

✅ **Audit Trail:**
- Both `requestedReturnDate` and `managerApprovedReturnDate` stored
- `managerReturnDateReason` explains any modifications
- Timestamps on all approvals

## Database Migration Steps

### For Existing Databases
```sql
-- Add new columns to laptop_requests table
ALTER TABLE laptop_requests ADD COLUMN requested_return_date DATE AFTER request_date;
ALTER TABLE laptop_requests ADD COLUMN manager_approved_return_date DATE AFTER status;
ALTER TABLE laptop_requests ADD COLUMN manager_return_date_reason VARCHAR(500) AFTER manager_approved_return_date;

-- Optional: Populate existing requests with a default return date (30 days after request)
UPDATE laptop_requests 
SET requested_return_date = DATE_ADD(request_date, INTERVAL 30 DAY)
WHERE requested_return_date IS NULL AND status IN ('PENDING', 'APPROVED');

-- Create indexes for performance
CREATE INDEX idx_requested_return_date ON laptop_requests(requested_return_date);
CREATE INDEX idx_manager_approved_return_date ON laptop_requests(manager_approved_return_date);
```

### For New Installations
Run the updated `database_schema.sql` file - schema already includes new columns.

## Testing Checklist

- [ ] Student can create request with start date and return date
- [ ] Student sees error if return date is before or equal to start date
- [ ] Requested return date appears in student's request history
- [ ] Manager sees "Approved requested date" option by default
- [ ] Manager can switch to override mode and set earlier date
- [ ] Manager sees error if trying to set later date
- [ ] Manager must provide reason when overriding
- [ ] "Approve & Issue" button works for both scenarios
- [ ] Student receives notification with correct dates
- [ ] If date was overridden, notification mentions manager's reason
- [ ] Laptop issue record has correct return deadline
- [ ] Historical records show both requested and approved dates

## Backward Compatibility

The `approveLaptopRequestLegacy` method in `LaptopIssueService` allows the old `LaptopIssueApprovalDTO` to still work if needed, though it's recommended to use the new `RequestApprovalDTO`.

## Notes

- Passwords are hashed with BCrypt (never stored plaintext)
- All requests use JWT tokens for authentication
- HTTPS enforcement is configured in the frontend API client
- Notifications are sent for all approval/rejection events
- Returns dates are flexible: manager can approve, override, or extend later via extension requests
