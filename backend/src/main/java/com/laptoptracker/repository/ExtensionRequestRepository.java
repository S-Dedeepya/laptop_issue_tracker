package com.laptoptracker.repository;

import com.laptoptracker.entity.ExtensionRequest;
import com.laptoptracker.enums.ExtensionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ExtensionRequest entity
 */
@Repository
public interface ExtensionRequestRepository extends JpaRepository<ExtensionRequest, Long> {
    
    List<ExtensionRequest> findByStatus(ExtensionStatus status);
    
    List<ExtensionRequest> findByLaptopIssueIdOrderByCreatedAtDesc(Long laptopIssueId);
    
    List<ExtensionRequest> findByLaptopIssueStudentIdOrderByCreatedAtDesc(Long studentId);
    
    List<ExtensionRequest> findAllByOrderByCreatedAtDesc();
}
