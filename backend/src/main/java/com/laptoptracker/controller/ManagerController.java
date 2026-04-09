package com.laptoptracker.controller;

import com.laptoptracker.dto.ApiResponse;
import com.laptoptracker.dto.LaptopDTO;
import com.laptoptracker.dto.LaptopIssueApprovalDTO;
import com.laptoptracker.dto.RequestApprovalDTO;
import com.laptoptracker.dto.RequestReviewDTO;
import com.laptoptracker.entity.*;
import com.laptoptracker.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Manager Controller
 * Handles manager-specific endpoints
 */
@RestController
@RequestMapping("/manager")
@PreAuthorize("hasRole('MANAGER')")
@CrossOrigin(origins = "*")
public class ManagerController {

    @Autowired
    private LaptopService laptopService;

    @Autowired
    private LaptopRequestService laptopRequestService;

    @Autowired
    private LaptopIssueService laptopIssueService;

    @Autowired
    private ExtensionRequestService extensionRequestService;

    // ==================== LAPTOP MANAGEMENT ====================

    /**
     * Add a new laptop
     * POST /manager/laptops
     */
    @PostMapping("/laptops")
    public ResponseEntity<ApiResponse> addLaptop(@Valid @RequestBody LaptopDTO laptopDTO) {
        Laptop laptop = laptopService.addLaptop(laptopDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Laptop added successfully", laptop));
    }

    /**
     * Get all laptops
     * GET /manager/laptops
     */
    @GetMapping("/laptops")
    public ResponseEntity<ApiResponse> getAllLaptops() {
        List<Laptop> laptops = laptopService.getAllLaptops();
        return ResponseEntity.ok(new ApiResponse(true, "Laptops retrieved successfully", laptops));
    }

    /**
     * Get available laptops
     * GET /manager/laptops/available
     */
    @GetMapping("/laptops/available")
    public ResponseEntity<ApiResponse> getAvailableLaptops() {
        List<Laptop> laptops = laptopService.getAvailableLaptops();
        return ResponseEntity.ok(new ApiResponse(true, "Available laptops retrieved successfully", laptops));
    }

    /**
     * Get laptop by ID
     * GET /manager/laptops/{id}
     */
    @GetMapping("/laptops/{id}")
    public ResponseEntity<ApiResponse> getLaptopById(@PathVariable Long id) {
        Laptop laptop = laptopService.getLaptopById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop retrieved successfully", laptop));
    }

    /**
     * Update laptop
     * PUT /manager/laptops/{id}
     */
    @PutMapping("/laptops/{id}")
    public ResponseEntity<ApiResponse> updateLaptop(@PathVariable Long id, @Valid @RequestBody LaptopDTO laptopDTO) {
        Laptop laptop = laptopService.updateLaptop(id, laptopDTO);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop updated successfully", laptop));
    }

    /**
     * Delete laptop
     * DELETE /manager/laptops/{id}
     */
    @DeleteMapping("/laptops/{id}")
    public ResponseEntity<ApiResponse> deleteLaptop(@PathVariable Long id) {
        laptopService.deleteLaptop(id);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop deleted successfully"));
    }

    // ==================== LAPTOP REQUESTS ====================

    /**
     * Get all laptop requests
     * GET /manager/laptop-requests
     */
    @GetMapping("/laptop-requests")
    public ResponseEntity<ApiResponse> getAllLaptopRequests() {
        List<LaptopRequest> requests = laptopRequestService.getAllLaptopRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Laptop requests retrieved successfully", requests));
    }

    /**
     * Get pending laptop requests
     * GET /manager/laptop-requests/pending
     */
    @GetMapping("/laptop-requests/pending")
    public ResponseEntity<ApiResponse> getPendingLaptopRequests() {
        List<LaptopRequest> requests = laptopRequestService.getAllPendingRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Pending laptop requests retrieved successfully", requests));
    }

    /**
     * Get laptop request by ID
     * GET /manager/laptop-requests/{id}
     */
    @GetMapping("/laptop-requests/{id}")
    public ResponseEntity<ApiResponse> getLaptopRequestById(@PathVariable Long id) {
        LaptopRequest request = laptopRequestService.getLaptopRequestById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop request retrieved successfully", request));
    }

    /**
     * Approve laptop request and issue laptop
     * POST /manager/laptop-requests/{id}/approve
     */
    @PostMapping("/laptop-requests/{id}/approve")
    public ResponseEntity<ApiResponse> approveLaptopRequest(
            @PathVariable Long id,
            @Valid @RequestBody RequestApprovalDTO approvalDTO) {
        LaptopIssue laptopIssue = laptopIssueService.approveLaptopRequest(id, approvalDTO);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop request approved and laptop issued successfully", laptopIssue));
    }

    /**
     * Reject laptop request
     * POST /manager/laptop-requests/{id}/reject
     */
    @PostMapping("/laptop-requests/{id}/reject")
    public ResponseEntity<ApiResponse> rejectLaptopRequest(
            @PathVariable Long id,
            @RequestBody RequestReviewDTO reviewDTO) {
        laptopIssueService.rejectLaptopRequest(id, reviewDTO.getRejectionReason());
        return ResponseEntity.ok(new ApiResponse(true, "Laptop request rejected successfully"));
    }

    // ==================== LAPTOP ISSUES ====================

    /**
     * Get all laptop issues
     * GET /manager/laptop-issues
     */
    @GetMapping("/laptop-issues")
    public ResponseEntity<ApiResponse> getAllLaptopIssues() {
        List<LaptopIssue> issues = laptopIssueService.getAllLaptopIssues();
        return ResponseEntity.ok(new ApiResponse(true, "Laptop issues retrieved successfully", issues));
    }

    /**
     * Get active laptop issues
     * GET /manager/laptop-issues/active
     */
    @GetMapping("/laptop-issues/active")
    public ResponseEntity<ApiResponse> getActiveLaptopIssues() {
        List<LaptopIssue> issues = laptopIssueService.getAllActiveLaptopIssues();
        return ResponseEntity.ok(new ApiResponse(true, "Active laptop issues retrieved successfully", issues));
    }

    /**
     * Get overdue laptops
     * GET /manager/laptop-issues/overdue
     */
    @GetMapping("/laptop-issues/overdue")
    public ResponseEntity<ApiResponse> getOverdueLaptops() {
        List<LaptopIssue> issues = laptopIssueService.getOverdueLaptops();
        return ResponseEntity.ok(new ApiResponse(true, "Overdue laptops retrieved successfully", issues));
    }

    /**
     * Get laptops nearing deadline
     * GET /manager/laptop-issues/nearing-deadline
     */
    @GetMapping("/laptop-issues/nearing-deadline")
    public ResponseEntity<ApiResponse> getLaptopsNearingDeadline(@RequestParam(defaultValue = "7") int days) {
        List<LaptopIssue> issues = laptopIssueService.getLaptopsNearingDeadline(days);
        return ResponseEntity.ok(new ApiResponse(true, "Laptops nearing deadline retrieved successfully", issues));
    }

    /**
     * Get laptop issue by ID
     * GET /manager/laptop-issues/{id}
     */
    @GetMapping("/laptop-issues/{id}")
    public ResponseEntity<ApiResponse> getLaptopIssueById(@PathVariable Long id) {
        LaptopIssue issue = laptopIssueService.getLaptopIssueById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop issue retrieved successfully", issue));
    }

    /**
     * Mark laptop as returned
     * PUT /manager/laptop-issues/{id}/return
     */
    @PutMapping("/laptop-issues/{id}/return")
    public ResponseEntity<ApiResponse> markLaptopAsReturned(@PathVariable Long id) {
        laptopIssueService.markLaptopAsReturned(id);
        return ResponseEntity.ok(new ApiResponse(true, "Laptop marked as returned successfully"));
    }

    // ==================== EXTENSION REQUESTS ====================

    /**
     * Get all extension requests
     * GET /manager/extension-requests
     */
    @GetMapping("/extension-requests")
    public ResponseEntity<ApiResponse> getAllExtensionRequests() {
        List<ExtensionRequest> requests = extensionRequestService.getAllExtensionRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Extension requests retrieved successfully", requests));
    }

    /**
     * Get pending extension requests
     * GET /manager/extension-requests/pending
     */
    @GetMapping("/extension-requests/pending")
    public ResponseEntity<ApiResponse> getPendingExtensionRequests() {
        List<ExtensionRequest> requests = extensionRequestService.getAllPendingExtensionRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Pending extension requests retrieved successfully", requests));
    }

    /**
     * Get extension request by ID
     * GET /manager/extension-requests/{id}
     */
    @GetMapping("/extension-requests/{id}")
    public ResponseEntity<ApiResponse> getExtensionRequestById(@PathVariable Long id) {
        ExtensionRequest request = extensionRequestService.getExtensionRequestById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Extension request retrieved successfully", request));
    }

    /**
     * Approve extension request
     * POST /manager/extension-requests/{id}/approve
     */
    @PostMapping("/extension-requests/{id}/approve")
    public ResponseEntity<ApiResponse> approveExtensionRequest(@PathVariable Long id) {
        extensionRequestService.approveExtensionRequest(id);
        return ResponseEntity.ok(new ApiResponse(true, "Extension request approved successfully"));
    }

    /**
     * Reject extension request
     * POST /manager/extension-requests/{id}/reject
     */
    @PostMapping("/extension-requests/{id}/reject")
    public ResponseEntity<ApiResponse> rejectExtensionRequest(
            @PathVariable Long id,
            @RequestBody RequestReviewDTO reviewDTO) {
        extensionRequestService.rejectExtensionRequest(id, reviewDTO.getRejectionReason());
        return ResponseEntity.ok(new ApiResponse(true, "Extension request rejected successfully"));
    }
}
