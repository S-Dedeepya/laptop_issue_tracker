package com.laptoptracker.controller;

import com.laptoptracker.dto.ApiResponse;
import com.laptoptracker.dto.ExtensionRequestDTO;
import com.laptoptracker.dto.LaptopRequestDTO;
import com.laptoptracker.dto.UpdateProfileRequest;
import com.laptoptracker.dto.ChangePasswordRequest;
import com.laptoptracker.dto.UserProfileDTO;
import com.laptoptracker.entity.ExtensionRequest;
import com.laptoptracker.entity.Laptop;
import com.laptoptracker.entity.LaptopIssue;
import com.laptoptracker.entity.LaptopRequest;
import com.laptoptracker.entity.Notification;
import com.laptoptracker.service.ExtensionRequestService;
import com.laptoptracker.service.LaptopIssueService;
import com.laptoptracker.service.LaptopRequestService;
import com.laptoptracker.service.NotificationService;
import com.laptoptracker.service.AuthService;
import com.laptoptracker.service.LaptopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Student Controller
 * Handles student-specific endpoints
 */
@RestController
@RequestMapping("/student")
@PreAuthorize("hasRole('STUDENT')")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private LaptopRequestService laptopRequestService;

    @Autowired
    private ExtensionRequestService extensionRequestService;

    @Autowired
    private LaptopIssueService laptopIssueService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Autowired
    private LaptopService laptopService;

    // ==================== PROFILE ====================

    /**
     * Get current user profile
     * GET /student/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile() {
        UserProfileDTO profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(new ApiResponse(true, "Profile retrieved successfully", profile));
    }

    /**
     * Update student profile
     * PUT /student/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDTO profile = authService.updateStudentProfile(request);
        return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully", profile));
    }

    /**
     * Change password
     * POST /student/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }

    // ==================== LAPTOP REQUESTS ====================

    /**
     * Create a new laptop request
     * POST /student/laptop-requests
     */
    @PostMapping("/laptop-requests")
    public ResponseEntity<ApiResponse> createLaptopRequest(@Valid @RequestBody LaptopRequestDTO requestDTO) {
        LaptopRequest laptopRequest = laptopRequestService.createLaptopRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Laptop request submitted successfully", laptopRequest));
    }

    /**
     * Get my laptop requests
     * GET /student/laptop-requests
     */
    @GetMapping("/laptop-requests")
    public ResponseEntity<ApiResponse> getMyLaptopRequests() {
        List<LaptopRequest> requests = laptopRequestService.getMyLaptopRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Laptop requests retrieved successfully", requests));
    }

    /**
     * Get available laptops (for selection)
     * GET /student/laptops/available
     */
    @GetMapping("/laptops/available")
    public ResponseEntity<ApiResponse> getAvailableLaptopsForStudent() {
        List<Laptop> laptops = laptopService.getAvailableLaptops();
        return ResponseEntity.ok(new ApiResponse(true, "Available laptops retrieved successfully", laptops));
    }

    // ==================== LAPTOP ISSUES ====================

    /**
     * Get my laptop issue history
     * GET /student/laptop-issues
     */
    @GetMapping("/laptop-issues")
    public ResponseEntity<ApiResponse> getMyLaptopIssueHistory() {
        List<LaptopIssue> issues = laptopIssueService.getMyLaptopIssueHistory();
        return ResponseEntity.ok(new ApiResponse(true, "Laptop issue history retrieved successfully", issues));
    }

    /**
     * Get my active laptop issue
     * GET /student/laptop-issues/active
     */
    @GetMapping("/laptop-issues/active")
    public ResponseEntity<ApiResponse> getMyActiveLaptopIssue() {
        LaptopIssue issue = laptopIssueService.getMyActiveLaptopIssue();
        return ResponseEntity.ok(new ApiResponse(true, "Active laptop issue retrieved successfully", issue));
    }

    // ==================== EXTENSION REQUESTS ====================

    /**
     * Create an extension request
     * POST /student/extension-requests
     */
    @PostMapping("/extension-requests")
    public ResponseEntity<ApiResponse> createExtensionRequest(@Valid @RequestBody ExtensionRequestDTO requestDTO) {
        ExtensionRequest extensionRequest = extensionRequestService.createExtensionRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Extension request submitted successfully", extensionRequest));
    }

    /**
     * Get my extension requests
     * GET /student/extension-requests
     */
    @GetMapping("/extension-requests")
    public ResponseEntity<ApiResponse> getMyExtensionRequests() {
        List<ExtensionRequest> requests = extensionRequestService.getMyExtensionRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Extension requests retrieved successfully", requests));
    }

    // ==================== NOTIFICATIONS ====================

    /**
     * Get my notifications
     * GET /student/notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse> getMyNotifications() {
        List<Notification> notifications = notificationService.getMyNotifications();
        return ResponseEntity.ok(new ApiResponse(true, "Notifications retrieved successfully", notifications));
    }

    /**
     * Get my unread notifications
     * GET /student/notifications/unread
     */
    @GetMapping("/notifications/unread")
    public ResponseEntity<ApiResponse> getMyUnreadNotifications() {
        List<Notification> notifications = notificationService.getMyUnreadNotifications();
        return ResponseEntity.ok(new ApiResponse(true, "Unread notifications retrieved successfully", notifications));
    }

    /**
     * Get unread notification count
     * GET /student/notifications/unread/count
     */
    @GetMapping("/notifications/unread/count")
    public ResponseEntity<ApiResponse> getUnreadNotificationCount() {
        Long count = notificationService.getUnreadNotificationCount();
        return ResponseEntity.ok(new ApiResponse(true, "Unread notification count retrieved successfully", count));
    }

    /**
     * Mark notification as read
     * PUT /student/notifications/{id}/read
     */
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse(true, "Notification marked as read"));
    }

    /**
     * Mark all notifications as read
     * PUT /student/notifications/read-all
     */
    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse> markAllNotificationsAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }
}
