package com.laptoptracker.repository;

import com.laptoptracker.entity.LaptopIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for LaptopIssue entity
 */
@Repository
public interface LaptopIssueRepository extends JpaRepository<LaptopIssue, Long> {
    
    List<LaptopIssue> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    List<LaptopIssue> findByIsReturnedFalse();
    
    Optional<LaptopIssue> findByStudentIdAndIsReturnedFalse(Long studentId);
    
    @Query("SELECT li FROM LaptopIssue li WHERE li.isReturned = false AND li.currentReturnDeadline < :date")
    List<LaptopIssue> findOverdueLaptops(@Param("date") LocalDate date);
    
    @Query("SELECT li FROM LaptopIssue li WHERE li.isReturned = false AND li.currentReturnDeadline BETWEEN :startDate AND :endDate")
    List<LaptopIssue> findLaptopsNearingDeadline(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<LaptopIssue> findByLaptopIdOrderByCreatedAtDesc(Long laptopId);
}
