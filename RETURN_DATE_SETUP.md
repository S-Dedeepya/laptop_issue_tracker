# Return Date Feature - Quick Setup

## Files Modified

### Backend
1. **Entity Model**
   - `backend/src/main/java/com/laptoptracker/entity/LaptopRequest.java`
   
2. **DTOs**
   - `backend/src/main/java/com/laptoptracker/dto/LaptopRequestDTO.java` (updated)
   - `backend/src/main/java/com/laptoptracker/dto/RequestApprovalDTO.java` (new)

3. **Service Layer**
   - `backend/src/main/java/com/laptoptracker/service/LaptopRequestService.java` (updated)
   - `backend/src/main/java/com/laptoptracker/service/LaptopIssueService.java` (updated)

4. **Controller**
   - `backend/src/main/java/com/laptoptracker/controller/ManagerController.java` (updated)

5. **Database**
   - `backend/database_schema.sql` (updated with new columns)

### Frontend
1. **Type Definitions**
   - `frontend/src/types/index.ts` (updated)

2. **Services**
   - `frontend/src/services/manager.service.ts` (updated)

3. **UI Components**
   - `frontend/src/pages/student/StudentLaptopRequests.tsx` (updated)
   - `frontend/src/pages/manager/ManagerLaptopRequests.tsx` (updated)

## Setup Steps

### 1. Database Migration
If you have an existing database, run:
```sql
ALTER TABLE laptop_requests ADD COLUMN requested_return_date DATE AFTER request_date;
ALTER TABLE laptop_requests ADD COLUMN manager_approved_return_date DATE AFTER status;
ALTER TABLE laptop_requests ADD COLUMN manager_return_date_reason VARCHAR(500) AFTER manager_approved_return_date;
```

For new installations, the updated `database_schema.sql` includes these columns.

### 2. Backend Compilation
```bash
cd backend
mvn clean install
```

### 3. Frontend Installation
```bash
cd frontend
npm install
```

### 4. Run Application
```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Feature Walkthrough

### Student Side
1. Click "New Request" button
2. Fill in:
   - Reason (min 10 chars)
   - Request date (when you need the laptop)
   - **Requested return date** (when you plan to return it)
3. Wait for available laptops to load
4. Select a laptop
5. Submit request
6. View request in history showing requested return date

### Manager Side
1. Go to "Laptop Requests" section
2. Click "Approve" on a pending request
3. Review student's requested return date (highlighted in blue)
4. Choose approval option:
   - **Option A:** "Yes, approve the student's requested return date"
     - Return deadline auto-fills with student's date
   - **Option B:** "No, set a different (earlier) return deadline"
     - Enter manager's deadline (must be earlier)
     - Enter reason for change
5. Click "Approve & Issue"
6. Student gets notified with details

## Key Features

✅ **Security:**
- Passwords hashed with BCrypt
- JWT token-based authentication
- HTTPS enforcement in API client
- Server-side validation

✅ **Audit Trail:**
- Both requested and approved return dates stored
- Manager's reason for changes recorded
- Timestamps on all actions

✅ **Notifications:**
- Students notified on approval
- If date modified, notification includes:
  - Original requested date
  - Manager-approved date
  - Manager's reason

✅ **Validation:**
- Client-side validation for better UX
- Server-side validation for data integrity
- Clear error messages
- Manager can't set later date than student requested

## Common Issues & Solutions

**Issue:** Frontend shows "Requested return date" field but backend returns 400 error

**Solution:** 
- Ensure database migration ran successfully
- Check that Java models are recompiled (`mvn clean install`)
- Restart backend server

---

**Issue:** Manager approval dialog doesn't show return date option

**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild frontend (`npm run build`)
- Restart development server

---

**Issue:** Notifications not showing when request approved

**Solution:**
- Check NotificationService is working
- Ensure student is viewing dashboard/notifications page when request is approved
- Verify database connection

## Testing the Feature

### Test Case 1: Complete Student Request with Return Date
1. Login as student
2. Create request with dates 10 days apart
3. Verify request appears in history with both dates
4. ✅ Expected: Success with dates displayed

### Test Case 2: Manager Approves Student's Date
1. Login as manager
2. View pending request
3. Select "Approve requested date"
4. Issue date auto-fills, deadline shows student's date
5. Click approve
6. ✅ Expected: Success, student notified

### Test Case 3: Manager Overrides with Earlier Date
1. Login as manager
2. View pending request
3. Select "Set different date"
4. Enter earlier date with reason
5. Click approve
6. ✅ Expected: Success, student notified of modification

### Test Case 4: Validation - Later Date Rejected
1. In manager approval (override mode)
2. Try to set date AFTER student's requested date
3. Click approve
4. ✅ Expected: Error message "Manager-defined return deadline must be earlier..."

### Test Case 5: Student Return Date Before Request Date
1. Create new request
2. Set return date BEFORE request date
3. Try to submit
4. ✅ Expected: Error message "Requested return date must be after..."

## Support

For issues or questions about this feature, review:
- `RETURN_DATE_FEATURE.md` - Detailed technical documentation
- Inline code comments in modified files
- Database schema comments in `database_schema.sql`
