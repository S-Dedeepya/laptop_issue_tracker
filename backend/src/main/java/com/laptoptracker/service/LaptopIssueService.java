package com.laptoptracker.service;

import com.laptoptracker.dto.LaptopIssueApprovalDTO;
import com.laptoptracker.dto.RequestApprovalDTO;
import com.laptoptracker.entity.*;
import com.laptoptracker.enums.LaptopStatus;
import com.laptoptracker.enums.RequestStatus;
import com.laptoptracker.exception.BadRequestException;
import com.laptoptracker.repository.LaptopIssueRepository;
import com.laptoptracker.repository.LaptopRepository;
import com.laptoptracker.repository.LaptopRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for Laptop Issue operations
 */
@Service
public class LaptopIssueService {

    @Autowired
    private LaptopIssueRepository laptopIssueRepository;

    @Autowired
    private LaptopRequestRepository laptopRequestRepository;

    @Autowired
    private LaptopRepository laptopRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    /**
     * Approve laptop request and issue laptop with new approval logic supporting return date override
     */
    @Transactional
    public LaptopIssue approveLaptopRequest(Long requestId, RequestApprovalDTO approvalDTO) {
        User currentUser = authService.getCurrentUser();

        // Get laptop request
        LaptopRequest laptopRequest = laptopRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Laptop request not found"));

        // Check if already processed
        if (laptopRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This request has already been processed");
        }

        // Validate return date override
        try {
            approvalDTO.validate(laptopRequest.getRequestedReturnDate());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(e.getMessage());
        }

        // Get laptop (use the one from the request since student selected it)
        Laptop laptop = laptopRequest.getSelectedLaptop();
        if (laptop == null) {
            throw new BadRequestException("Laptop not found or not selected by student");
        }

        // Check laptop availability
        if (laptop.getStatus() != LaptopStatus.AVAILABLE) {
            throw new BadRequestException("Laptop is not available");
        }

        // Update laptop request with approval details
        laptopRequest.setStatus(RequestStatus.APPROVED);
        laptopRequest.setReviewedBy(currentUser.getId());
        laptopRequest.setReviewedAt(java.time.LocalDateTime.now());
        
        // Store manager's decision about return date
        if (!approvalDTO.getApproveRequestedDate()) {
            laptopRequest.setManagerApprovedReturnDate(approvalDTO.getReturnDeadline());
            laptopRequest.setManagerReturnDateReason(approvalDTO.getReturnDateReason());
        }
        
        laptopRequestRepository.save(laptopRequest);

        // Create laptop issue with appropriate return deadline
        LaptopIssue laptopIssue = new LaptopIssue();
        laptopIssue.setStudent(laptopRequest.getStudent());
        laptopIssue.setLaptop(laptop);
        laptopIssue.setLaptopRequest(laptopRequest);
        laptopIssue.setIssueDate(approvalDTO.getIssueDate());
        
        // Use manager's approved return deadline
        LocalDate returnDeadline = approvalDTO.getReturnDeadline();
        laptopIssue.setOriginalReturnDeadline(returnDeadline);
        laptopIssue.setCurrentReturnDeadline(returnDeadline);
        laptopIssue.setIsReturned(false);
        laptopIssue.setExtensionCount(0);
        laptopIssue.setIssuedBy(currentUser.getId());

        LaptopIssue savedIssue = laptopIssueRepository.save(laptopIssue);

        // Update laptop status
        laptop.setStatus(LaptopStatus.ISSUED);
        laptopRepository.save(laptop);

        // Send notification to student with appropriate message
        String notificationMessage;
        if (approvalDTO.getApproveRequestedDate()) {
            notificationMessage = "Your laptop request has been approved. Laptop " + laptop.getBrand() + " " + laptop.getModel() +
                    " has been issued to you. Return deadline: " + returnDeadline;
        } else {
            notificationMessage = "Your laptop request has been approved with a modified return deadline. Laptop " + laptop.getBrand() + " " + laptop.getModel() +
                    " has been issued to you. You requested: " + laptopRequest.getRequestedReturnDate() + 
                    ", but the return deadline has been set to: " + returnDeadline + ". Reason: " + approvalDTO.getReturnDateReason();
        }
        
        notificationService.createNotification(
                laptopRequest.getStudent(),
                "Laptop Request Approved",
                notificationMessage
        );

        return savedIssue;
    }

    /**
     * Legacy approval method for backward compatibility (accepts LaptopIssueApprovalDTO)
     */
    @Transactional
    public LaptopIssue approveLaptopRequestLegacy(Long requestId, LaptopIssueApprovalDTO approvalDTO) {
        RequestApprovalDTO newDTO = new RequestApprovalDTO();
        newDTO.setIssueDate(approvalDTO.getIssueDate());
        newDTO.setReturnDeadline(approvalDTO.getReturnDeadline());
        newDTO.setApproveRequestedDate(true); // Legacy method always approves as-is
        return approveLaptopRequest(requestId, newDTO);
    }

    /**
     * Reject laptop request
     */
    @Transactional
    public void rejectLaptopRequest(Long requestId, String rejectionReason) {
        User currentUser = authService.getCurrentUser();

        // Get laptop request
        LaptopRequest laptopRequest = laptopRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Laptop request not found"));

        // Check if already processed
        if (laptopRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This request has already been processed");
        }

        // Update laptop request
        laptopRequest.setStatus(RequestStatus.REJECTED);
        laptopRequest.setRejectionReason(rejectionReason);
        laptopRequest.setReviewedBy(currentUser.getId());
        laptopRequest.setReviewedAt(java.time.LocalDateTime.now());
        laptopRequestRepository.save(laptopRequest);

        // Send notification to student
        notificationService.createNotification(
                laptopRequest.getStudent(),
                "Laptop Request Rejected",
                "Your laptop request has been rejected. Reason: " + rejectionReason
        );
    }

    /**
     * Mark laptop as returned
     */
    @Transactional
    public void markLaptopAsReturned(Long issueId) {
        LaptopIssue laptopIssue = laptopIssueRepository.findById(issueId)
                .orElseThrow(() -> new BadRequestException("Laptop issue not found"));

        if (laptopIssue.getIsReturned()) {
            throw new BadRequestException("Laptop already marked as returned");
        }

        // Update laptop issue
        laptopIssue.setIsReturned(true);
        laptopIssue.setActualReturnDate(LocalDate.now());
        laptopIssueRepository.save(laptopIssue);

        // Update laptop status
        Laptop laptop = laptopIssue.getLaptop();
        laptop.setStatus(LaptopStatus.AVAILABLE);
        laptopRepository.save(laptop);

        // Send notification to student
        notificationService.createNotification(
                laptopIssue.getStudent(),
                "Laptop Return Confirmed",
                "Your laptop return has been confirmed. Thank you!"
        );
    }

    /**
     * Get laptop issue history for current student
     */
    public List<LaptopIssue> getMyLaptopIssueHistory() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return laptopIssueRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    /**
     * Get active laptop issue for current student
     */
    public LaptopIssue getMyActiveLaptopIssue() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return laptopIssueRepository.findByStudentIdAndIsReturnedFalse(student.getId())
                .orElse(null);
    }

    /**
     * Get all active laptop issues (for manager)
     */
    public List<LaptopIssue> getAllActiveLaptopIssues() {
        return laptopIssueRepository.findByIsReturnedFalse();
    }

    /**
     * Get overdue laptops (for manager)
     */
    public List<LaptopIssue> getOverdueLaptops() {
        return laptopIssueRepository.findOverdueLaptops(LocalDate.now());
    }

    /**
     * Get laptops nearing deadline (for manager)
     */
    public List<LaptopIssue> getLaptopsNearingDeadline(int days) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days);
        return laptopIssueRepository.findLaptopsNearingDeadline(today, futureDate);
    }

    /**
     * Get all laptop issues (for manager)
     */
    public List<LaptopIssue> getAllLaptopIssues() {
        return laptopIssueRepository.findAll();
    }

    /**
     * Get laptop issue by ID
     */
    public LaptopIssue getLaptopIssueById(Long id) {
        return laptopIssueRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Laptop issue not found"));
    }
}
