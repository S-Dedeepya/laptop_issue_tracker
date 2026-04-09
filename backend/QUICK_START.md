# 🚀 Quick Start Guide - Laptop Issue Tracker Backend

## Prerequisites Checklist
- [ ] Java 17 or higher installed
- [ ] MySQL 8.0 or higher installed and running
- [ ] Maven 3.6+ installed
- [ ] Postman or similar API testing tool (optional)

---

## Step 1: Database Setup (2 minutes)

### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Run these commands
CREATE DATABASE laptop_tracker_db;
exit;
```

### Option B: Using the Schema File
```bash
# From the project root directory
mysql -u root -p < database_schema.sql
```

---

## Step 2: Configure Application (1 minute)

Edit `src/main/resources/application.properties`:

```properties
# Update these lines with your MySQL credentials
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

## Step 3: Build the Project (1-2 minutes)

```bash
# Navigate to project directory
cd /home/abhinay/Desktop/laptop_issue_project/backend

# Clean and build
mvn clean install
```

**Expected Output:** `BUILD SUCCESS`

---

## Step 4: Run the Application (30 seconds)

```bash
mvn spring-boot:run
```

**Look for this message:**
```
====================================
Laptop Issue Tracker API is running!
API Base URL: http://localhost:8080/api
====================================
```

---

## Step 5: Test the API (2 minutes)

### Test 1: Manager Login
```bash
curl -X POST http://localhost:8080/api/auth/manager/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@laptoptracker.com",
    "password": "manager123"
  }'
```

**Expected:** You should receive a JWT token in the response.

### Test 2: Student Signup
```bash
curl -X POST http://localhost:8080/api/auth/student/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test123",
    "fullName": "Test Student",
    "registrationNumber": "TEST001"
  }'
```

**Expected:** Student created successfully with a JWT token.

---

## 🎯 You're All Set!

The backend is now running and ready to use.

### What's Next?

1. **Read the API Documentation**
   - Check `README.md` for all endpoints
   - Check `API_SAMPLES.md` for request examples

2. **Test with Postman**
   - Import the endpoints
   - Use the sample requests from `API_SAMPLES.md`

3. **Connect Your Frontend**
   - Backend accepts requests from `localhost:3000` and `localhost:5173`
   - Use the JWT token in Authorization header: `Bearer <token>`

4. **Add Sample Data**
   - Login as manager
   - Add laptops to inventory
   - Test the complete workflow

---

## 📝 Common Issues and Solutions

### Issue: Port 8080 already in use
**Solution:** Change port in `application.properties`:
```properties
server.port=8081
```

### Issue: MySQL connection refused
**Solution:** 
1. Check if MySQL is running: `sudo systemctl status mysql`
2. Start MySQL: `sudo systemctl start mysql`
3. Verify credentials in `application.properties`

### Issue: Build fails
**Solution:**
1. Check Java version: `java -version` (should be 17+)
2. Check Maven version: `mvn -version` (should be 3.6+)
3. Clean and rebuild: `mvn clean install -U`

---

## 🔑 Default Credentials

**Manager Account:**
- Email: `manager@laptoptracker.com`
- Password: `manager123`

**Note:** Create student accounts via the signup endpoint.

---

## 📊 Testing Workflow

### Complete Student Flow:
1. Student signs up → Receives token
2. Student requests laptop → Creates pending request
3. Manager approves → Laptop issued to student
4. Student requests extension → Creates pending extension
5. Manager approves extension → Deadline extended
6. Student returns laptop → Manager marks as returned

---

## 🛠️ Development Mode

For development, you might want to:

1. **Enable Debug Logging**
```properties
logging.level.com.laptoptracker=DEBUG
```

2. **Auto-restart on Code Changes**
   - Spring Boot DevTools is already included
   - Just save your changes and the app will auto-restart

3. **View SQL Queries**
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

---

## 📱 API Base URL

```
http://localhost:8080/api
```

### Key Endpoints:
- POST `/auth/student/signup` - Register student
- POST `/auth/student/login` - Student login
- POST `/auth/manager/login` - Manager login
- GET `/student/*` - Student endpoints (requires auth)
- GET `/manager/*` - Manager endpoints (requires auth)

---

## 🎓 Learning Resources

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **Spring Security:** https://spring.io/projects/spring-security
- **JWT:** https://jwt.io/

---

## ✅ Quick Verification Checklist

Before considering the backend ready for production:

- [ ] Database connection successful
- [ ] Application starts without errors
- [ ] Manager can login
- [ ] Student can signup
- [ ] Student can create laptop request
- [ ] Manager can view requests
- [ ] Manager can approve requests
- [ ] Extension requests work
- [ ] Notifications are created
- [ ] All endpoints return proper HTTP status codes

---

## 🚀 Ready for Production?

When deploying to production, remember to:

1. Change JWT secret to a strong random value
2. Use environment variables for sensitive data
3. Set `spring.jpa.hibernate.ddl-auto=validate` (not update)
4. Disable SQL logging
5. Configure proper CORS origins
6. Set up proper database user with limited privileges
7. Enable HTTPS
8. Set up monitoring and logging

---

**Happy Coding! 🎉**

For detailed documentation, refer to `README.md` and `PROJECT_SUMMARY.md`.
