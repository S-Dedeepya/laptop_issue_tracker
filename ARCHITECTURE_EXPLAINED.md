# 🏗️ LAPTOP ISSUE TRACKER - ARCHITECTURE EXPLAINED

## Table of Contents
1. [Overall Architecture Layers](#1-overall-architecture-layers)
2. [Backend Architecture Layers](#2-backend-architecture-layers)
3. [Frontend Architecture Layers](#3-frontend-architecture-layers)
4. [Complete Data Flow Example](#4-complete-data-flow-example)
5. [Component Interactions](#5-component-interactions)
6. [Key Architectural Principles](#6-key-architectural-principles)

---

## 1. OVERALL ARCHITECTURE LAYERS

The Laptop Issue Tracker follows a **3-Tier Layered Architecture** with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (Frontend)              │
│           React + TypeScript + Vite                     │
│         (User Interface & Client-side Logic)            │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/HTTPS + JSON
                  │ JWT Token in Headers
                  ▼
┌─────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Backend)                │
│           Spring Boot 3.2.1 + Java 17                   │
│         (Business Logic & REST APIs)                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │        SECURITY LAYER                           │  │
│  │  (JWT Filter, Authentication, Authorization)    │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │        CONTROLLER LAYER                         │  │
│  │  (REST Endpoints, Request Handling)             │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │        SERVICE LAYER                            │  │
│  │  (Business Logic, Rules Validation)             │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │        REPOSITORY LAYER                         │  │
│  │  (Data Access, JPA/Hibernate)                   │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │        ENTITY LAYER                             │  │
│  │  (Domain Models, Database Mapping)              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │ JDBC + SQL
                  │ Hibernate ORM
                  ▼
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER (Database)                      │
│           MySQL 8.0+                                    │
│         (Persistent Data Storage)                       │
└─────────────────────────────────────────────────────────┘
```

### Architecture Tiers

| Tier | Technology | Purpose |
|------|-----------|---------|
| **Presentation** | React + TypeScript | User interface, client-side logic |
| **Application** | Spring Boot + Java | Business logic, REST APIs, security |
| **Data** | MySQL + JPA/Hibernate | Persistent data storage, queries |

---

## 2. BACKEND ARCHITECTURE LAYERS

### Layer 1: Security Layer 🔒
**Location**: `backend/src/main/java/com/laptoptracker/security/`

#### Components:
- `JwtAuthenticationFilter` - Intercepts requests, validates JWT tokens
- `JwtTokenProvider` - Generates and validates JWT tokens
- `CustomUserDetailsService` - Loads user details from database
- `JwtAuthenticationEntryPoint` - Handles unauthorized access
- `SecurityConfig` - Configures Spring Security

#### Responsibilities:
✅ Validate incoming requests  
✅ Extract and verify JWT tokens  
✅ Load user information  
✅ Set authentication context  
✅ Enforce authorization rules  

#### Security Flow:
```
Request with JWT Token
         ↓
JwtAuthenticationFilter extracts token
         ↓
JwtTokenProvider validates signature & expiration
         ↓
CustomUserDetailsService loads user from DB
         ↓
SecurityContext stores authentication
         ↓
Request proceeds to Controller
```

#### Code Example:
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        try {
            // 1. Extract JWT from Authorization header
            String jwt = getJwtFromRequest(request);
            
            // 2. Validate token and get user email
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                String email = jwtTokenProvider.getEmailFromJWT(jwt);
                
                // 3. Load user details
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                
                // 4. Set authentication in security context
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication", ex);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

### Layer 2: Controller Layer 🎮
**Location**: `backend/src/main/java/com/laptoptracker/controller/`

#### Components:
- `AuthController` - Handles signup, login
- `StudentController` - Student endpoints (requests, issues, extensions)
- `ManagerController` - Manager endpoints (inventory, approvals)

#### Responsibilities:
✅ Receive HTTP requests  
✅ Extract and validate request data  
✅ Call appropriate service methods  
✅ Format and return responses  
✅ Handle HTTP status codes  

#### Code Example:
```java
@RestController
@RequestMapping("/api/student")
public class StudentController {
    
    @Autowired
    private LaptopRequestService laptopRequestService;
    
    @PostMapping("/laptop-requests")
    public ResponseEntity<ApiResponse> createLaptopRequest(
        @Valid @RequestBody LaptopRequestDTO request,
        Authentication authentication
    ) {
        // 1. Controller receives request (validation done by @Valid)
        // 2. JWT already validated by security filter
        // 3. Get current student from authentication
        String email = authentication.getName();
        
        // 4. Call service layer
        LaptopRequest created = laptopRequestService.createRequest(request, email);
        
        // 5. Return formatted response
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse(true, "Request created successfully", created));
    }
    
    @GetMapping("/laptop-requests")
    public ResponseEntity<ApiResponse> getMyRequests(Authentication auth) {
        List<LaptopRequest> requests = laptopRequestService.getStudentRequests(auth.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Requests retrieved", requests));
    }
}
```

#### Request Mapping:
| Endpoint | Method | Controller Method |
|----------|--------|------------------|
| `/api/auth/student/signup` | POST | `AuthController.registerStudent()` |
| `/api/auth/student/login` | POST | `AuthController.loginStudent()` |
| `/api/student/laptop-requests` | POST | `StudentController.createLaptopRequest()` |
| `/api/student/laptop-requests` | GET | `StudentController.getMyRequests()` |
| `/api/manager/laptops` | GET | `ManagerController.getAllLaptops()` |

---

### Layer 3: Service Layer 🧠
**Location**: `backend/src/main/java/com/laptoptracker/service/`

#### Components:
- `AuthService` - User registration, login
- `LaptopService` - Laptop inventory management
- `LaptopRequestService` - Request creation, status updates
- `LaptopIssueService` - Laptop issuance, return handling
- `ExtensionRequestService` - Extension approval workflow
- `NotificationService` - Notification management

#### Responsibilities:
✅ Implement business logic  
✅ Validate business rules  
✅ Coordinate between repositories  
✅ Handle transactions  
✅ Perform calculations  
✅ Manage notifications  

#### Code Example:
```java
@Service
@Transactional
public class LaptopRequestService {
    
    @Autowired
    private LaptopRequestRepository laptopRequestRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private LaptopIssueRepository laptopIssueRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public LaptopRequest createRequest(LaptopRequestDTO dto, String email) {
        // 1. Get student profile
        StudentProfile student = studentProfileRepository.findByUserEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        // 2. Validate business rules
        // Check if student already has an active laptop
        boolean hasActiveLaptop = laptopIssueRepository
            .existsByStudentIdAndIsReturnedFalse(student.getId());
        if (hasActiveLaptop) {
            throw new BadRequestException("Student already has an active laptop");
        }
        
        // Check if student has a pending request
        boolean hasPendingRequest = laptopRequestRepository
            .existsByStudentIdAndStatus(student.getId(), RequestStatus.PENDING);
        if (hasPendingRequest) {
            throw new BadRequestException("Student already has a pending request");
        }
        
        // 3. Create entity
        LaptopRequest request = new LaptopRequest();
        request.setStudent(student);
        request.setReason(dto.getReason());
        request.setRequestDate(LocalDate.now());
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        
        // 4. Save to database
        LaptopRequest savedRequest = laptopRequestRepository.save(request);
        
        // 5. Create notification for managers
        notificationService.notifyManagers(
            "New Laptop Request",
            student.getFullName() + " requested a laptop"
        );
        
        // 6. Return saved entity
        return savedRequest;
    }
}
```

#### Business Rules Enforced:
| Rule | Validation |
|------|-----------|
| One active laptop per student | Check `laptop_issues` for unreturned devices |
| One pending request per student | Check `laptop_requests` for PENDING status |
| Max 3 extensions per laptop | Check `extension_count` in `laptop_issues` |
| Laptop must be available | Check `laptop.status == AVAILABLE` |
| Valid deadline dates | Ensure `returnDeadline > issueDate` |

---

### Layer 4: Repository Layer 💾
**Location**: `backend/src/main/java/com/laptoptracker/repository/`

#### Components:
- `UserRepository` - User queries
- `StudentProfileRepository` - Student queries
- `LaptopRepository` - Laptop queries
- `LaptopRequestRepository` - Request queries
- `LaptopIssueRepository` - Issue queries
- `ExtensionRequestRepository` - Extension queries
- `NotificationRepository` - Notification queries

#### Responsibilities:
✅ Database access  
✅ CRUD operations (Create, Read, Update, Delete)  
✅ Custom query methods  
✅ Data persistence  
✅ JPA/Hibernate abstraction  

#### Code Example:
```java
@Repository
public interface LaptopRequestRepository extends JpaRepository<LaptopRequest, Long> {
    
    // Spring Data JPA automatically implements these methods
    
    // Find requests by student ID and status
    List<LaptopRequest> findByStudentIdAndStatus(Long studentId, RequestStatus status);
    
    // Find all requests by status
    List<LaptopRequest> findByStatus(RequestStatus status);
    
    // Find specific request for a student
    Optional<LaptopRequest> findByIdAndStudentId(Long requestId, Long studentId);
    
    // Check if student has pending request
    boolean existsByStudentIdAndStatus(Long studentId, RequestStatus status);
    
    // Find all requests by student, ordered by date
    @Query("SELECT lr FROM LaptopRequest lr WHERE lr.student.id = :studentId ORDER BY lr.requestDate DESC")
    List<LaptopRequest> findByStudentIdOrderByRequestDateDesc(@Param("studentId") Long studentId);
    
    // Count pending requests
    @Query("SELECT COUNT(lr) FROM LaptopRequest lr WHERE lr.status = 'PENDING'")
    long countPendingRequests();
}
```

#### Repository Methods:
| Method Type | Example | Generated SQL |
|-------------|---------|---------------|
| Find by field | `findByStatus(status)` | `SELECT * FROM laptop_requests WHERE status = ?` |
| Exists check | `existsByStudentId(id)` | `SELECT COUNT(*) > 0 FROM laptop_requests WHERE student_id = ?` |
| Custom query | `@Query("SELECT...")` | User-defined JPQL/SQL |
| Count | `countByStatus(status)` | `SELECT COUNT(*) FROM laptop_requests WHERE status = ?` |

---

### Layer 5: Entity Layer 📦
**Location**: `backend/src/main/java/com/laptoptracker/entity/`

#### Components (7 Entities):
- `User` - Authentication data
- `StudentProfile` - Student information
- `Laptop` - Device inventory
- `LaptopRequest` - Request tracking
- `LaptopIssue` - Issued device tracking
- `ExtensionRequest` - Extension tracking
- `Notification` - Notification history

#### Responsibilities:
✅ Map to database tables  
✅ Define data structure  
✅ Specify relationships  
✅ Enforce constraints  

#### Code Example:
```java
@Entity
@Table(name = "laptop_requests")
public class LaptopRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;
    
    @Column(name = "reason", nullable = false, length = 500)
    private String reason;
    
    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RequestStatus status;
    
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
    
    @Column(name = "reviewed_by")
    private Long reviewedBy;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters, setters, constructors
}
```

#### Entity Relationships:
```
User (1) ─────── (1) StudentProfile
                      │
                      ├─── (∞) LaptopRequest
                      ├─── (∞) LaptopIssue
                      ├─── (∞) ExtensionRequest
                      └─── (∞) Notification

Laptop (1) ─────── (∞) LaptopIssue

LaptopRequest (1) ─ (1) LaptopIssue

LaptopIssue (1) ─── (∞) ExtensionRequest
```

#### JPA Annotations Explained:
| Annotation | Purpose | Example |
|-----------|---------|---------|
| `@Entity` | Marks class as JPA entity | Maps to table |
| `@Table(name="...")` | Specifies table name | `@Table(name = "laptop_requests")` |
| `@Id` | Primary key field | `private Long id;` |
| `@GeneratedValue` | Auto-increment ID | `strategy = GenerationType.IDENTITY` |
| `@Column` | Maps to column | `@Column(name = "reason")` |
| `@ManyToOne` | Many-to-one relationship | Multiple requests per student |
| `@OneToMany` | One-to-many relationship | One student, many requests |
| `@JoinColumn` | Foreign key column | `@JoinColumn(name = "student_id")` |
| `@Enumerated` | Enum field mapping | `@Enumerated(EnumType.STRING)` |

---

### DTO Layer (Data Transfer Objects) 📤
**Location**: `backend/src/main/java/com/laptoptracker/dto/`

#### Purpose:
Transfer data between layers without exposing entities directly to clients.

#### Components:
- `StudentSignupRequest` - Signup data
- `LoginRequest` - Login credentials
- `AuthResponse` - Auth response with JWT
- `LaptopRequestDTO` - Request data
- `ExtensionRequestDTO` - Extension data
- `LaptopDTO` - Laptop data
- `ApiResponse<T>` - Generic response wrapper

#### Why Use DTOs?

**Without DTOs (❌ Bad)**:
```java
// Exposing entity directly - includes sensitive data, lazy-loaded fields
return ResponseEntity.ok(userEntity); 
// Returns password hash, internal IDs, etc.
```

**With DTOs (✅ Good)**:
```java
// Clean, controlled data transfer
AuthResponse dto = new AuthResponse(token, user.getEmail(), user.getRole());
return ResponseEntity.ok(dto);
// Only returns what client needs
```

#### DTO Flow:
```
Client Sends JSON
         ↓
@RequestBody → Converted to DTO (StudentSignupRequest)
         ↓
Service receives DTO
         ↓
Service validates DTO
         ↓
Service creates Entity from DTO
         ↓
Repository saves Entity
         ↓
Service converts Entity → ResponseDTO
         ↓
@ResponseBody → Returns JSON to client
```

#### Code Example:
```java
// Request DTO
public class LaptopRequestDTO {
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 500, message = "Reason must be 10-500 characters")
    private String reason;
    
    // Getters, setters
}

// Response DTO
public class LaptopRequestResponseDTO {
    private Long id;
    private String status;
    private LocalDate requestDate;
    private String studentName;
    
    // Getters, setters, constructor
}

// Generic API Response wrapper
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    // Constructors, getters, setters
}
```

---

### Exception Handling Layer ⚠️
**Location**: `backend/src/main/java/com/laptoptracker/exception/`

#### Components:
- `BadRequestException` - Validation errors, business rule violations
- `ResourceNotFoundException` - Missing resources
- `GlobalExceptionHandler` - Centralized error handling with `@ControllerAdvice`

#### Responsibilities:
✅ Catch exceptions globally  
✅ Format error responses  
✅ Return appropriate HTTP status codes  
✅ Provide meaningful error messages  
✅ Hide internal errors from clients  

#### Code Example:
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    // Handle bad request exceptions
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse> handleBadRequest(BadRequestException ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // Handle resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(ResourceNotFoundException ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ApiResponse response = new ApiResponse(false, "Validation failed", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // Handle authentication errors
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse> handleAuthError(AuthenticationException ex) {
        ApiResponse response = new ApiResponse(false, "Authentication failed", null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    // Handle generic errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGenericError(Exception ex) {
        ApiResponse response = new ApiResponse(false, "Internal server error", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

#### Exception Hierarchy:
```
Exception
├── RuntimeException
│   ├── BadRequestException
│   │   └── Used for: Validation errors, business rule violations
│   └── ResourceNotFoundException
│       └── Used for: Missing entities, not found scenarios
└── AuthenticationException
    └── Used for: Invalid credentials, token errors
```

---

## 3. FRONTEND ARCHITECTURE LAYERS

### Layer 1: UI Components 🎨
**Location**: `frontend/src/components/`

#### Components:
- `ui/` - 20+ reusable components (Button, Input, Modal, Table, etc.)
- `ProfileModal.tsx` - User profile display
- Custom page-specific components

#### Responsibilities:
✅ Render UI elements  
✅ Handle user interactions  
✅ Display data from state/props  
✅ Emit events to parent components  

#### Code Example:
```typescript
// Reusable Button Component
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### UI Component Library:
| Component | Purpose |
|-----------|---------|
| `button.tsx` | Clickable actions |
| `input.tsx` | Form inputs |
| `card.tsx` | Content containers |
| `table.tsx` | Data tables |
| `dialog.tsx` | Modal dialogs |
| `alert.tsx` | Notifications |
| `badge.tsx` | Status indicators |
| `form.tsx` | Form handling with validation |

---

### Layer 2: Pages 📄
**Location**: `frontend/src/pages/`

#### Role-Based Pages:

**Manager Pages** (`/manager/*`):
- `ManagerLayout.tsx` - Layout wrapper with navigation
- `ManagerDashboard.tsx` - Overview & statistics
- `ManagerLaptops.tsx` - Inventory CRUD operations
- `ManagerLaptopRequests.tsx` - Request approval/rejection
- `ManagerLaptopIssues.tsx` - Issue monitoring
- `ManagerExtensions.tsx` - Extension approvals

**Student Pages** (`/student/*`):
- `StudentLayout.tsx` - Layout wrapper with navigation
- `StudentDashboard.tsx` - Personal overview
- `StudentLaptopRequests.tsx` - Create and view requests
- `StudentLaptopIssues.tsx` - View active laptops
- `StudentExtensions.tsx` - Request extensions
- `StudentNotifications.tsx` - View notifications

**Auth Pages** (`/auth/*`):
- `LoginPage.tsx` - Login form
- `SignupPage.tsx` - Student registration

#### Responsibilities:
✅ Full page components  
✅ Coordinate multiple UI components  
✅ Fetch data from services  
✅ Manage local page state  
✅ Handle routing  

#### Code Example:
```typescript
// StudentLaptopRequests.tsx
import { useState, useEffect } from 'react';
import { studentService } from '@/services/student.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function StudentLaptopRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Fetch requests on mount
  useEffect(() => {
    loadRequests();
  }, []);
  
  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await studentService.getLaptopRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (reason: string) => {
    try {
      await studentService.createLaptopRequest(reason);
      setShowForm(false);
      loadRequests(); // Refresh list
    } catch (error) {
      console.error('Failed to create request', error);
    }
  };
  
  return (
    <div className="container">
      <div className="header">
        <h1>My Laptop Requests</h1>
        <Button onClick={() => setShowForm(true)}>
          Request Laptop
        </Button>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="requests-grid">
          {requests.map(request => (
            <Card key={request.id}>
              <h3>Status: {request.status}</h3>
              <p>{request.reason}</p>
              <p>Date: {request.requestDate}</p>
            </Card>
          ))}
        </div>
      )}
      
      {showForm && (
        <RequestForm 
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
```

---

### Layer 3: Services 🔌
**Location**: `frontend/src/services/`

#### Components:
- `auth.service.ts` - Authentication API calls
- `student.service.ts` - Student API endpoints
- `manager.service.ts` - Manager API endpoints
- `profile.service.ts` - Profile endpoints

#### Responsibilities:
✅ API communication with backend  
✅ HTTP request construction  
✅ Error handling  
✅ Response parsing  
✅ Data transformation  

#### Code Example:
```typescript
// student.service.ts
import { apiClient } from '@/lib/api-client';
import { LaptopRequest, LaptopIssue, ExtensionRequest } from '@/types';

export const studentService = {
  // Get all laptop requests for current student
  async getLaptopRequests(): Promise<LaptopRequest[]> {
    const response = await apiClient.get('/student/laptop-requests');
    return response.data.data;
  },
  
  // Create new laptop request
  async createLaptopRequest(reason: string): Promise<LaptopRequest> {
    const response = await apiClient.post('/student/laptop-requests', {
      reason
    });
    return response.data.data;
  },
  
  // Get active laptop issues
  async getLaptopIssues(): Promise<LaptopIssue[]> {
    const response = await apiClient.get('/student/laptop-issues');
    return response.data.data;
  },
  
  // Request extension
  async requestExtension(
    laptopIssueId: number, 
    reason: string, 
    requestedDays: number
  ): Promise<ExtensionRequest> {
    const response = await apiClient.post('/student/extension-requests', {
      laptopIssueId,
      reason,
      requestedDays
    });
    return response.data.data;
  },
  
  // Mark laptop as returned
  async markLaptopReturned(issueId: number): Promise<void> {
    await apiClient.put(`/student/laptop-issues/${issueId}/return`);
  },
  
  // Get notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/student/notifications');
    return response.data.data;
  }
};
```

---

### Layer 4: State Management 🗄️
**Location**: `frontend/src/store/`

#### Components:
- `auth.store.ts` - Authentication state (using Zustand)
- `notification.store.ts` - Notification state

#### Responsibilities:
✅ Store global application state  
✅ Manage user authentication  
✅ Handle notifications  
✅ Persist state to localStorage  
✅ Provide state to components  

#### Code Example:
```typescript
// auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: {
    id: number;
    email: string;
    role: string;
    fullName: string;
  } | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (token: string, user: any) => void;
  logout: () => void;
  updateUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: (token, user) => {
        localStorage.setItem('jwt_token', token);
        set({ 
          token, 
          user, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        localStorage.removeItem('jwt_token');
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
      },
      
      updateUser: (user) => {
        set({ user });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      })
    }
  )
);
```

#### Using State in Components:
```typescript
import { useAuthStore } from '@/store/auth.store';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.fullName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

### Layer 5: API Client 🌐
**Location**: `frontend/src/lib/api-client.ts`

#### Responsibilities:
✅ Configure HTTP client (Axios)  
✅ Set base URL  
✅ Add JWT token to all requests  
✅ Handle request/response interceptors  
✅ Global error handling  

#### Code Example:
```typescript
// api-client.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Create axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 4. COMPLETE DATA FLOW EXAMPLE

### Example: Student Creates Laptop Request

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: USER INTERACTION (Frontend)                        │
└─────────────────────────────────────────────────────────────┘

Student navigates to "Laptop Requests" page
  ↓
StudentLaptopRequests.tsx component loads
  ↓
Student clicks "Request Laptop" button
  ↓
Opens request form
  ↓
Student enters reason: "Need laptop for semester project"
  ↓
Student clicks "Submit" button
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 2: FRONTEND PROCESSING                                │
└─────────────────────────────────────────────────────────────┘

handleSubmit() function called
  ↓
Validate form data (client-side)
  ↓
Call studentService.createLaptopRequest(reason)
  ↓
studentService makes HTTP call:
  - Method: POST
  - URL: /api/student/laptop-requests
  - Headers: Authorization: Bearer eyJhbGc...
  - Body: { "reason": "Need laptop for semester project" }
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 3: NETWORK LAYER                                      │
└─────────────────────────────────────────────────────────────┘

HTTP Request sent to backend:
  POST http://localhost:8080/api/student/laptop-requests
  Headers:
    - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    - Content-Type: application/json
  Body:
    {
      "reason": "Need laptop for semester project"
    }
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 4: BACKEND SECURITY LAYER                             │
└─────────────────────────────────────────────────────────────┘

Request hits JwtAuthenticationFilter
  ↓
Filter extracts JWT from Authorization header
  ↓
JwtTokenProvider.validateToken(jwt) called
  ↓
Token validation checks:
  - Signature verification ✓
  - Expiration check ✓
  - Token format ✓
  ↓
Extract email from token: "john@example.com"
  ↓
CustomUserDetailsService.loadUserByUsername("john@example.com")
  ↓
Query database for user:
  SELECT * FROM users WHERE email = 'john@example.com'
  ↓
User found, create UserDetails object
  ↓
Create Authentication object with user details and role (STUDENT)
  ↓
Set authentication in SecurityContext
  ↓
Request proceeds to controller layer
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 5: BACKEND CONTROLLER LAYER                           │
└─────────────────────────────────────────────────────────────┘

Request reaches StudentController
  ↓
@PostMapping("/laptop-requests") method matched
  ↓
createLaptopRequest(LaptopRequestDTO dto, Authentication auth) called
  ↓
@Valid annotation triggers validation:
  - @NotBlank on reason ✓
  - @Size(min=10, max=500) on reason ✓
  ↓
Extract authenticated user email from Authentication object
  ↓
Call service layer:
  laptopRequestService.createRequest(dto, email)
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 6: BACKEND SERVICE LAYER (Business Logic)             │
└─────────────────────────────────────────────────────────────┘

LaptopRequestService.createRequest() method executes
  ↓
1. Get student profile from email:
   studentProfileRepository.findByUserEmail("john@example.com")
   Query: SELECT sp.* FROM student_profiles sp 
          JOIN users u ON sp.user_id = u.id 
          WHERE u.email = 'john@example.com'
   Result: StudentProfile(id=1, fullName="John Doe", ...)
  ↓
2. Business rule validation - Check active laptop:
   laptopIssueRepository.existsByStudentIdAndIsReturnedFalse(1)
   Query: SELECT COUNT(*) > 0 FROM laptop_issues 
          WHERE student_id = 1 AND is_returned = false
   Result: false (no active laptop) ✓
  ↓
3. Business rule validation - Check pending request:
   laptopRequestRepository.existsByStudentIdAndStatus(1, PENDING)
   Query: SELECT COUNT(*) > 0 FROM laptop_requests 
          WHERE student_id = 1 AND status = 'PENDING'
   Result: false (no pending request) ✓
  ↓
4. Create LaptopRequest entity:
   LaptopRequest request = new LaptopRequest();
   request.setStudent(student);  // student_id = 1
   request.setReason("Need laptop for semester project");
   request.setRequestDate(LocalDate.now());  // 2026-01-19
   request.setStatus(RequestStatus.PENDING);
   request.setCreatedAt(LocalDateTime.now());
  ↓
5. Save entity to database:
   laptopRequestRepository.save(request)
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 7: BACKEND REPOSITORY LAYER (Data Persistence)        │
└─────────────────────────────────────────────────────────────┘

JpaRepository.save() method called
  ↓
Hibernate converts entity to SQL INSERT:
  INSERT INTO laptop_requests 
    (student_id, reason, request_date, status, created_at)
  VALUES 
    (1, 'Need laptop for semester project', '2026-01-19', 'PENDING', NOW())
  ↓
Database executes query
  ↓
Auto-generated ID returned: 1
  ↓
Entity updated with ID: request.setId(1)
  ↓
Return saved entity to service layer
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 8: BACKEND SERVICE - NOTIFICATIONS                    │
└─────────────────────────────────────────────────────────────┘

LaptopRequestService continues:
  ↓
Call NotificationService.notifyManagers():
  ↓
  Query managers:
    SELECT * FROM users WHERE role = 'MANAGER' AND active = true
  ↓
  For each manager, create notification:
    INSERT INTO notifications 
      (student_id, title, message, notification_type, is_read, created_at)
    VALUES 
      (1, 'New Laptop Request', 'John Doe requested a laptop', 
       'REQUEST_CREATED', false, NOW())
  ↓
Return to service layer
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 9: BACKEND CONTROLLER - RESPONSE FORMATTING           │
└─────────────────────────────────────────────────────────────┘

Service returns saved LaptopRequest entity
  ↓
Controller creates ApiResponse:
  ApiResponse response = new ApiResponse(
    true,  // success
    "Laptop request created successfully",  // message
    savedRequest  // data
  );
  ↓
Return ResponseEntity:
  ResponseEntity.status(HttpStatus.CREATED)  // 201 status
    .body(response)
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 10: NETWORK LAYER - HTTP RESPONSE                     │
└─────────────────────────────────────────────────────────────┘

HTTP Response sent to frontend:
  Status: 201 Created
  Headers:
    Content-Type: application/json
  Body:
    {
      "success": true,
      "message": "Laptop request created successfully",
      "data": {
        "id": 1,
        "studentId": 1,
        "reason": "Need laptop for semester project",
        "status": "PENDING",
        "requestDate": "2026-01-19",
        "createdAt": "2026-01-19T10:30:00Z"
      }
    }
  ↓


┌─────────────────────────────────────────────────────────────┐
│ STEP 11: FRONTEND - RESPONSE HANDLING                      │
└─────────────────────────────────────────────────────────────┘

studentService.createLaptopRequest() receives response
  ↓
Parse response.data.data (the laptop request object)
  ↓
Return to page component
  ↓
StudentLaptopRequests component:
  - Closes request form
  - Calls loadRequests() to refresh the list
  - Shows success notification
  - Updates UI with new request
  ↓
Student sees their request in the list with status "PENDING"
  ↓
Done! ✓
```

---

## 5. COMPONENT INTERACTIONS

### Authentication Flow

```
┌─────────────┐
│  LoginPage  │
└──────┬──────┘
       │ User enters email & password
       │ Clicks "Login"
       ▼
┌───────────────────┐
│ auth.service.ts   │
│ login(email, pwd) │
└──────┬────────────┘
       │ POST /api/auth/student/login
       ▼
┌──────────────────────┐
│ Backend:             │
│ AuthController       │
│ .loginStudent()      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend:             │
│ AuthService          │
│ .authenticateStudent │
└──────┬───────────────┘
       │ Query user from database
       ▼
┌──────────────────────┐
│ Backend:             │
│ UserRepository       │
│ .findByEmail()       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Database:            │
│ SELECT * FROM users  │
│ WHERE email = ?      │
└──────┬───────────────┘
       │ Return user record
       ▼
┌──────────────────────┐
│ Backend:             │
│ BCrypt.matches()     │
│ Validate password    │
└──────┬───────────────┘
       │ Password correct ✓
       ▼
┌──────────────────────┐
│ Backend:             │
│ JwtTokenProvider     │
│ .generateToken()     │
└──────┬───────────────┘
       │ Create JWT token
       ▼
┌──────────────────────┐
│ Response:            │
│ { token, user }      │
└──────┬───────────────┘
       │ Return to frontend
       ▼
┌───────────────────┐
│ auth.service.ts   │
│ Parse response    │
└──────┬────────────┘
       │
       ▼
┌───────────────────┐
│ auth.store.ts     │
│ .login(token,user)│
└──────┬────────────┘
       │ Store in state
       ▼
┌───────────────────┐
│ localStorage      │
│ Store JWT token   │
└──────┬────────────┘
       │
       ▼
┌───────────────────┐
│ Navigate to       │
│ /student/dashboard│
└───────────────────┘
```

---

### Manager Approves Laptop Request Flow

```
┌──────────────────────┐
│ ManagerLaptopRequests│
│ Page loads           │
└──────┬───────────────┘
       │ useEffect on mount
       ▼
┌──────────────────────┐
│ manager.service.ts   │
│ .getLaptopRequests() │
└──────┬───────────────┘
       │ GET /api/manager/laptop-requests?status=PENDING
       ▼
┌──────────────────────┐
│ Backend:             │
│ ManagerController    │
│ .getLaptopRequests() │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend:             │
│ LaptopRequestService │
│ .getPendingRequests()│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend:             │
│ LaptopRequestRepo    │
│ .findByStatus()      │
└──────┬───────────────┘
       │ Query database
       ▼
┌──────────────────────┐
│ Database:            │
│ SELECT * FROM        │
│ laptop_requests      │
│ WHERE status=PENDING │
└──────┬───────────────┘
       │ Return list
       ▼
┌──────────────────────┐
│ Frontend:            │
│ Display request list │
└──────┬───────────────┘
       │ Manager clicks "Approve"
       ▼
┌──────────────────────┐
│ Opens approval form  │
│ Selects laptop       │
│ Sets deadline        │
└──────┬───────────────┘
       │ Clicks "Confirm"
       ▼
┌──────────────────────┐
│ manager.service.ts   │
│ .approveLaptopReq()  │
└──────┬───────────────┘
       │ POST /api/manager/laptop-requests/{id}/approve
       ▼
┌──────────────────────┐
│ Backend:             │
│ ManagerController    │
│ .approveRequest()    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend:             │
│ LaptopIssueService   │
│ .approveLaptopReq()  │
└──────┬───────────────┘
       │ Begin transaction
       ▼
┌──────────────────────┐
│ 1. Get laptop request│
│ 2. Validate status   │
│ 3. Get laptop        │
│ 4. Check available   │
└──────┬───────────────┘
       │ All validations pass ✓
       ▼
┌──────────────────────┐
│ 5. Update request:   │
│    status = APPROVED │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 6. Create            │
│    LaptopIssue       │
│    record            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 7. Update laptop:    │
│    status = ISSUED   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 8. Create            │
│    notification      │
│    for student       │
└──────┬───────────────┘
       │ Commit transaction
       ▼
┌──────────────────────┐
│ Database:            │
│ All changes saved    │
└──────┬───────────────┘
       │ Return success
       ▼
┌──────────────────────┐
│ Frontend:            │
│ Show success message │
│ Refresh request list │
│ Remove from pending  │
└───────────────────────┘
```

---

## 6. KEY ARCHITECTURAL PRINCIPLES

### 1. **Separation of Concerns** 🎯

Each layer has a specific, well-defined responsibility:

| Layer | Responsibility | Does NOT Handle |
|-------|---------------|-----------------|
| Controller | HTTP routing, request/response | Business logic, database access |
| Service | Business logic, validation | HTTP handling, SQL queries |
| Repository | Database access, queries | Business rules, HTTP responses |
| Entity | Data structure, mapping | Business logic, validation |

**Example**:
```java
// ❌ BAD - Controller doing business logic
@PostMapping("/laptop-requests")
public ResponseEntity<?> create(@RequestBody LaptopRequestDTO dto) {
    // Controller should NOT have this logic
    if (studentHasActiveLaptop()) {
        throw new BadRequestException("...");
    }
    // ...SQL queries here...
}

// ✅ GOOD - Controller delegates to service
@PostMapping("/laptop-requests")
public ResponseEntity<?> create(@RequestBody LaptopRequestDTO dto, Authentication auth) {
    LaptopRequest request = laptopRequestService.createRequest(dto, auth.getName());
    return ResponseEntity.ok(new ApiResponse(true, "Created", request));
}
```

---

### 2. **DRY (Don't Repeat Yourself)** ♻️

Reuse code to avoid duplication:

- **Reusable UI Components**: Button, Input, Modal used across pages
- **Custom Repository Methods**: Shared query logic
- **DTOs**: Standardized data transfer
- **API Client**: Centralized HTTP configuration

**Example**:
```typescript
// ✅ Reusable component
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Instead of:
// ❌ Duplicating button styles everywhere
<button className="bg-blue-600 text-white px-4 py-2...">Submit</button>
<button className="bg-red-600 text-white px-4 py-2...">Delete</button>
```

---

### 3. **Single Responsibility Principle** 📌

Each class/component has one reason to change:

- `LaptopRequestService` - Only handles laptop request logic
- `AuthService` - Only handles authentication
- `StudentController` - Only handles student HTTP endpoints
- `UserRepository` - Only handles user data access

**Example**:
```java
// ✅ GOOD - Each service has single responsibility
@Service
public class LaptopRequestService {
    // Only laptop request business logic
    public LaptopRequest createRequest(...) { }
    public List<LaptopRequest> getRequests(...) { }
}

@Service
public class NotificationService {
    // Only notification logic
    public void notifyStudent(...) { }
    public void notifyManagers(...) { }
}

// ❌ BAD - God class doing everything
@Service
public class LaptopService {
    public LaptopRequest createRequest() { }
    public void sendNotification() { }
    public User authenticate() { }
    // Too many responsibilities!
}
```

---

### 4. **Security First** 🔐

Security is enforced at multiple layers:

1. **JWT Authentication**: Every request validated
2. **Role-Based Authorization**: Students can't access manager endpoints
3. **Password Encryption**: BCrypt with salt
4. **Input Validation**: @Valid annotations, business rule checks
5. **SQL Injection Prevention**: JPA/Hibernate parameterized queries

**Security Layers**:
```
Request
  ↓
1. JWT Filter (validates token)
  ↓
2. Security Config (checks role/permissions)
  ↓
3. Controller (@PreAuthorize annotations)
  ↓
4. Service (business rule validation)
  ↓
5. Repository (parameterized queries)
```

---

### 5. **Error Handling** ⚠️

Centralized, consistent error handling:

- **Global Exception Handler**: Catches all exceptions
- **Meaningful Messages**: Clear error descriptions
- **Proper HTTP Status Codes**: 400, 401, 403, 404, 500
- **Validation Errors**: Field-level error messages
- **Security**: Don't expose internal details

**Example**:
```java
// Service throws specific exceptions
if (student.hasActiveLaptop()) {
    throw new BadRequestException("Student already has active laptop");
}

// Global handler catches and formats
@ExceptionHandler(BadRequestException.class)
public ResponseEntity<ApiResponse> handleBadRequest(BadRequestException ex) {
    return ResponseEntity.status(400)
        .body(new ApiResponse(false, ex.getMessage(), null));
}

// Client receives clean JSON response
{
  "success": false,
  "message": "Student already has active laptop",
  "data": null
}
```

---

### 6. **Testability** 🧪

Architecture supports easy testing:

- **Dependency Injection**: Easy to mock dependencies
- **Layered Design**: Test each layer independently
- **Repository Pattern**: Mock database access
- **Service Layer**: Unit test business logic
- **DTOs**: Test data validation

**Example**:
```java
@SpringBootTest
public class LaptopRequestServiceTest {
    
    @MockBean
    private LaptopRequestRepository laptopRequestRepository;
    
    @MockBean
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private LaptopRequestService laptopRequestService;
    
    @Test
    public void testCreateRequest_Success() {
        // Mock dependencies
        when(studentProfileRepository.findByUserEmail("test@example.com"))
            .thenReturn(Optional.of(mockStudent));
        when(laptopRequestRepository.save(any()))
            .thenReturn(mockRequest);
        
        // Test service method
        LaptopRequest result = laptopRequestService.createRequest(dto, "test@example.com");
        
        // Verify
        assertNotNull(result);
        assertEquals(RequestStatus.PENDING, result.getStatus());
    }
}
```

---

### 7. **Scalability** 📈

Architecture supports growth:

- **Stateless Backend**: JWT tokens, no server-side sessions
- **Database Connection Pooling**: Handle concurrent requests
- **Async Operations**: Background tasks for notifications
- **Caching**: Can add Redis for frequently accessed data
- **Microservices Ready**: Can split into services later

---

### 8. **Maintainability** 🛠️

Code is easy to maintain:

- **Clear Structure**: Know where to find code
- **Documentation**: Comments, README files
- **Naming Conventions**: Descriptive class/method names
- **Code Standards**: Consistent formatting
- **Version Control**: Git for tracking changes

---

## Summary

This architecture provides:

✅ **Clean separation of concerns** - Each layer has specific responsibility  
✅ **Security** - JWT authentication, role-based access, encryption  
✅ **Scalability** - Stateless design, can handle growth  
✅ **Maintainability** - Easy to understand and modify  
✅ **Testability** - Each layer can be tested independently  
✅ **Reusability** - Shared components and services  
✅ **Error Handling** - Centralized, consistent error responses  
✅ **Best Practices** - Follows industry standards  

The **layered architecture** ensures that changes in one layer don't affect others, making the system robust, flexible, and production-ready!

---

**Document Version**: 1.0.0  
**Last Updated**: January 19, 2026  
**Status**: Production Ready
