package com.laptoptracker.service;

import com.laptoptracker.dto.ExtensionRequestDTO;
import com.laptoptracker.entity.ExtensionRequest;
import com.laptoptracker.entity.LaptopIssue;
import com.laptoptracker.entity.StudentProfile;
import com.laptoptracker.entity.User;
import com.laptoptracker.enums.ExtensionStatus;
import com.laptoptracker.exception.BadRequestException;
import com.laptoptracker.repository.ExtensionRequestRepository;
import com.laptoptracker.repository.LaptopIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for Extension Request operations
 */
@Service
public class ExtensionRequestService {

    @Autowired
    private ExtensionRequestRepository extensionRequestRepository;

    @Autowired
    private LaptopIssueRepository laptopIssueRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    private static final int MAX_EXTENSIONS = 3;

    /**
     * Create extension request
     */
    @Transactional
    public ExtensionRequest createExtensionRequest(ExtensionRequestDTO requestDTO) {
        StudentProfile student = authService.getCurrentStudentProfile();

        // Get laptop issue
        LaptopIssue laptopIssue = laptopIssueRepository.findById(requestDTO.getLaptopIssueId())
                .orElseThrow(() -> new BadRequestException("Laptop issue not found"));

        // Verify ownership
        if (!laptopIssue.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("This laptop issue does not belong to you");
        }

        // Check if laptop is already returned
        if (laptopIssue.getIsReturned()) {
            throw new BadRequestException("Cannot request extension for returned laptop");
        }

        // Check extension limit
        if (laptopIssue.getExtensionCount() >= MAX_EXTENSIONS) {
            throw new BadRequestException("Maximum extension limit (" + MAX_EXTENSIONS + ") reached");
        }

        // Check if there's already a pending extension request
        List<ExtensionRequest> pendingExtensions = extensionRequestRepository.findByLaptopIssueIdOrderByCreatedAtDesc(laptopIssue.getId())
                .stream()
                .filter(ext -> ext.getStatus() == ExtensionStatus.PENDING)
                .toList();

        if (!pendingExtensions.isEmpty()) {
            throw new BadRequestException("You already have a pending extension request for this laptop");
        }

        // Create extension request
        ExtensionRequest extensionRequest = new ExtensionRequest();
        extensionRequest.setLaptopIssue(laptopIssue);
        extensionRequest.setReason(requestDTO.getReason());
        extensionRequest.setExtensionDays(requestDTO.getExtensionDays());
        extensionRequest.setStatus(ExtensionStatus.PENDING);

        return extensionRequestRepository.save(extensionRequest);
    }

    /**
     * Approve extension request
     */
    @Transactional
    public void approveExtensionRequest(Long extensionRequestId) {
        User currentUser = authService.getCurrentUser();

        ExtensionRequest extensionRequest = extensionRequestRepository.findById(extensionRequestId)
                .orElseThrow(() -> new BadRequestException("Extension request not found"));

        // Check if already processed
        if (extensionRequest.getStatus() != ExtensionStatus.PENDING) {
            throw new BadRequestException("This extension request has already been processed");
        }

        LaptopIssue laptopIssue = extensionRequest.getLaptopIssue();

        // Check extension limit again
        if (laptopIssue.getExtensionCount() >= MAX_EXTENSIONS) {
            throw new BadRequestException("Maximum extension limit reached");
        }

        // Update extension request
        extensionRequest.setStatus(ExtensionStatus.APPROVED);
        extensionRequest.setReviewedBy(currentUser.getId());
        extensionRequest.setReviewedAt(java.time.LocalDateTime.now());
        extensionRequestRepository.save(extensionRequest);

        // Update laptop issue deadline and extension count
        LocalDate newDeadline = laptopIssue.getCurrentReturnDeadline().plusDays(extensionRequest.getExtensionDays());
        laptopIssue.setCurrentReturnDeadline(newDeadline);
        laptopIssue.setExtensionCount(laptopIssue.getExtensionCount() + 1);
        laptopIssueRepository.save(laptopIssue);

        // Send notification to student
        notificationService.createNotification(
                laptopIssue.getStudent(),
                "Extension Request Approved",
                "Your extension request has been approved. New deadline: " + newDeadline +
                        ". Extensions used: " + laptopIssue.getExtensionCount() + "/" + MAX_EXTENSIONS
        );
    }

    /**
     * Reject extension request
     */
    @Transactional
    public void rejectExtensionRequest(Long extensionRequestId, String rejectionReason) {
        User currentUser = authService.getCurrentUser();

        ExtensionRequest extensionRequest = extensionRequestRepository.findById(extensionRequestId)
                .orElseThrow(() -> new BadRequestException("Extension request not found"));

        // Check if already processed
        if (extensionRequest.getStatus() != ExtensionStatus.PENDING) {
            throw new BadRequestException("This extension request has already been processed");
        }

        // Update extension request
        extensionRequest.setStatus(ExtensionStatus.REJECTED);
        extensionRequest.setRejectionReason(rejectionReason);
        extensionRequest.setReviewedBy(currentUser.getId());
        extensionRequest.setReviewedAt(java.time.LocalDateTime.now());
        extensionRequestRepository.save(extensionRequest);

        // Send notification to student
        notificationService.createNotification(
                extensionRequest.getLaptopIssue().getStudent(),
                "Extension Request Rejected",
                "Your extension request has been rejected. Reason: " + rejectionReason
        );
    }

    /**
     * Get extension requests for current student
     */
    public List<ExtensionRequest> getMyExtensionRequests() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return extensionRequestRepository.findByLaptopIssueStudentIdOrderByCreatedAtDesc(student.getId());
    }

    /**
     * Get all pending extension requests (for manager)
     */
    public List<ExtensionRequest> getAllPendingExtensionRequests() {
        return extensionRequestRepository.findByStatus(ExtensionStatus.PENDING);
    }

    /**
     * Get all extension requests (for manager)
     */
    public List<ExtensionRequest> getAllExtensionRequests() {
        return extensionRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get extension request by ID
     */
    public ExtensionRequest getExtensionRequestById(Long id) {
        return extensionRequestRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Extension request not found"));
    }
}
