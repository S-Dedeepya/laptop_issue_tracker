# Debugging Extensions Blank Page Issue

## Quick Test Steps

### 1. Check if Component is Mounting
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Extensions page (click Extensions in sidebar)
4. Look for these log messages:
   - `[Extensions] Component rendering`
   - `[Extensions] State initialized: ...`
   - `[Extensions] useForm initialized successfully`
   - `[Extensions] Rendering loading state`
   - `[Extensions] Loading extension data...`

### 2. If You See "Component rendering" But Nothing Else
- Check the Network tab (F12 → Network)
- Filter by "Fetch/XHR"
- Look for these requests:
  - `/api/student/extension-requests` - should return 200 with list
  - `/api/student/laptop-issues/active` - should return 200 with laptop or null
- If you see red X or 401 errors, the auth token is missing
- If the requests don't appear at all, check if useEffect is running

### 3. If You See No Logs At All
- The component may not be mounting
- The page may be redirecting
- Webpack/Vite dev server may not have latest build
- Try: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### 4. Check for Errors in Console
- Any red error messages?
- If yes, copy the full error stack trace
- Common errors to look for:
  - "Cannot read property 'X' of undefined"
  - "Cannot read property 'X' of null"
  - Uncaught promise rejection

### 5. If Page Shows "Loading..." But Doesn't Progress
- Check Network tab for pending requests
- Look for `extension-requests` API call
- If pending indefinitely: backend may be hung or auth token invalid
- If failed with 401: logout and login again
- If failed with 500: check backend logs

### 6. If You See Error Message on Page
- The error should be displayed
- Click "Retry" button
- Check console for the exact error

## Expected Behavior

When you click Extensions:
1. Page shows "Loading..." message briefly
2. API requests made to `/student/extension-requests` and `/student/laptop-issues/active`
3. Page should show either:
   - Extension history table (if you have extensions)
   - "No extension requests yet." message
   - Request Extension button (if you have active laptop issue)

## Backend Health Check

Run these commands to verify backend is responding:

```bash
# Check if backend is running
ps aux | grep java | grep LaptopIssueTrackerApplication

# Check if backend is responding on port 8080
curl -s http://localhost:8080/api/public/health || echo "Backend not responding"

# Check backend logs for errors (if running in terminal)
# Look for ERROR or Exception messages
```

## Frontend Health Check

```bash
# Check if dev server is running
ps aux | grep vite

# Check browser console for Vite errors
# Frontend should be at http://localhost:5173
```

## What to Report

If you're stuck, please provide:
1. Screenshot of DevTools Console tab while on Extensions page
2. Copy of any error messages shown
3. Results of the "Check Component Mounting" test above
4. Output of: `ps aux | grep -E "(java|vite)" | grep -v grep`
