package com.laptoptracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.laptoptracker.enums.LaptopStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Laptop Entity
 * Represents laptops in the inventory
 */
@Entity
@Table(name = "laptops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Laptop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String serialNumber;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(length = 500)
    private String specifications;

    @Column(name = "gpu_specification", length = 200)
    private String gpuSpecification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LaptopStatus status = LaptopStatus.AVAILABLE;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // One-to-Many relationship with LaptopIssue
    @JsonIgnore
    @OneToMany(mappedBy = "laptop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LaptopIssue> laptopIssues = new ArrayList<>();
}
