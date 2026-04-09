package com.laptoptracker.repository;

import com.laptoptracker.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for StudentProfile entity
 */
@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    
    Optional<StudentProfile> findByRegistrationNumber(String registrationNumber);
    
    Boolean existsByRegistrationNumber(String registrationNumber);
    
    Optional<StudentProfile> findByUserId(Long userId);
}
