package com.laptoptracker.service;

import com.laptoptracker.dto.LaptopRequestDTO;
import com.laptoptracker.entity.Laptop;
import com.laptoptracker.entity.LaptopIssue;
import com.laptoptracker.entity.LaptopRequest;
import com.laptoptracker.entity.StudentProfile;
import com.laptoptracker.enums.LaptopStatus;
import com.laptoptracker.enums.RequestStatus;
import com.laptoptracker.exception.BadRequestException;
import com.laptoptracker.repository.LaptopIssueRepository;
import com.laptoptracker.repository.LaptopRequestRepository;
import com.laptoptracker.repository.LaptopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Laptop Request operations
 */
@Service
public class LaptopRequestService {

    @Autowired
    private LaptopRequestRepository laptopRequestRepository;

    @Autowired
    private LaptopIssueRepository laptopIssueRepository;

    @Autowired
    private AuthService authService;
    
    @Autowired
    private LaptopRepository laptopRepository;

    /**
     * Create a new laptop request
     */
    @Transactional
    public LaptopRequest createLaptopRequest(LaptopRequestDTO requestDTO) {
        StudentProfile student = authService.getCurrentStudentProfile();

        // Check if student already has an active laptop issue
        if (laptopIssueRepository.findByStudentIdAndIsReturnedFalse(student.getId()).isPresent()) {
            throw new BadRequestException("You already have an active laptop. Please return it before requesting a new one.");
        }

        // Check if student has a pending request
        List<LaptopRequest> pendingRequests = laptopRequestRepository.findByStudentIdAndStatus(
                student.getId(), RequestStatus.PENDING);
        if (!pendingRequests.isEmpty()) {
            throw new BadRequestException("You already have a pending laptop request.");
        }

        LaptopRequest laptopRequest = new LaptopRequest();
        laptopRequest.setStudent(student);
        laptopRequest.setReason(requestDTO.getReason());
        laptopRequest.setRequestDate(requestDTO.getRequestDate());
        laptopRequest.setRequestedReturnDate(requestDTO.getRequestedReturnDate());
        laptopRequest.setStatus(RequestStatus.PENDING);

        // Validate that requested return date is after request date
        if (requestDTO.getRequestedReturnDate().isBefore(requestDTO.getRequestDate())) {
            throw new BadRequestException("Requested return date must be after the laptop request date");
        }

        Laptop selectedLaptop = laptopRepository.findById(requestDTO.getLaptopId())
                .orElseThrow(() -> new BadRequestException("Selected laptop not found"));

        if (selectedLaptop.getStatus() != LaptopStatus.AVAILABLE) {
            throw new BadRequestException("Selected laptop is no longer available. Please refresh and try again.");
        }

        laptopRequest.setSelectedLaptop(selectedLaptop);
        laptopRequest.setSelectedLaptopSpecification(buildSpecification(selectedLaptop));

        return laptopRequestRepository.save(laptopRequest);
    }

    /**
     * Get all laptop requests for current student
     */
    public List<LaptopRequest> getMyLaptopRequests() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return laptopRequestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    /**
     * Get all pending laptop requests (for manager)
     */
    public List<LaptopRequest> getAllPendingRequests() {
        return laptopRequestRepository.findByStatus(RequestStatus.PENDING);
    }

    /**
     * Get all laptop requests (for manager)
     */
    public List<LaptopRequest> getAllLaptopRequests() {
        return laptopRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get laptop request by ID
     */
    public LaptopRequest getLaptopRequestById(Long id) {
        return laptopRequestRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Laptop request not found"));
    }

    private String buildSpecification(Laptop laptop) {
        StringBuilder sb = new StringBuilder();
        sb.append(laptop.getBrand()).append(" ").append(laptop.getModel());
        if (laptop.getSpecifications() != null && !laptop.getSpecifications().isBlank()) {
            sb.append(" | ").append(laptop.getSpecifications());
        }
        if (laptop.getGpuSpecification() != null && !laptop.getGpuSpecification().isBlank()) {
            sb.append(" | GPU: ").append(laptop.getGpuSpecification());
        }
        sb.append(" | Serial: ").append(laptop.getSerialNumber());
        return sb.toString();
    }
}
