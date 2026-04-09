package com.laptoptracker.repository;

import com.laptoptracker.entity.Laptop;
import com.laptoptracker.enums.LaptopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Laptop entity
 */
@Repository
public interface LaptopRepository extends JpaRepository<Laptop, Long> {
    
    Optional<Laptop> findBySerialNumber(String serialNumber);
    
    List<Laptop> findByStatus(LaptopStatus status);
    
    Boolean existsBySerialNumber(String serialNumber);
}
