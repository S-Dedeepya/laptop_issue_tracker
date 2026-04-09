package com.laptoptracker.repository;

import com.laptoptracker.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    List<Notification> findByStudentIdAndIsReadFalseOrderByCreatedAtDesc(Long studentId);
    
    Long countByStudentIdAndIsReadFalse(Long studentId);
}
