package com.laptoptracker.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Laptop Issue Entity
 * Represents an approved laptop issued to a student
 */
@Entity
@Table(name = "laptop_issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LaptopIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laptop_id", nullable = false)
    private Laptop laptop;

    @JsonBackReference
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laptop_request_id", nullable = false, unique = true)
    private LaptopRequest laptopRequest;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate originalReturnDeadline;

    @Column(nullable = false)
    private LocalDate currentReturnDeadline;

    private LocalDate actualReturnDate;

    @Column(nullable = false)
    private Boolean isReturned = false;

    @Column(nullable = false)
    private Integer extensionCount = 0;

    @Column(name = "issued_by", nullable = false)
    private Long issuedBy; // Manager user ID

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // One-to-Many relationship with ExtensionRequest
    @JsonIgnore
    @OneToMany(mappedBy = "laptopIssue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExtensionRequest> extensionRequests = new ArrayList<>();
}
