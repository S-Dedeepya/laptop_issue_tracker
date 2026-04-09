package com.laptoptracker.repository;

import com.laptoptracker.entity.LaptopRequest;
import com.laptoptracker.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for LaptopRequest entity
 */
@Repository
public interface LaptopRequestRepository extends JpaRepository<LaptopRequest, Long> {
    
    List<LaptopRequest> findByStatus(RequestStatus status);
    
    List<LaptopRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    List<LaptopRequest> findByStudentIdAndStatus(Long studentId, RequestStatus status);
    
    List<LaptopRequest> findAllByOrderByCreatedAtDesc();
}
