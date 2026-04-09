package com.laptoptracker.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.laptoptracker.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Laptop Request Entity
 * Represents a student's request for a laptop
 */
@Entity
@Table(name = "laptop_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LaptopRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false)
    private LocalDate requestDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "selected_laptop_id")
    private Laptop selectedLaptop;

    @Column(name = "selected_laptop_spec", length = 500)
    private String selectedLaptopSpecification;

    @Column(name = "requested_return_date")
    private LocalDate requestedReturnDate;

    @Column(name = "manager_approved_return_date")
    private LocalDate managerApprovedReturnDate;

    @Column(name = "manager_return_date_reason", length = 500)
    private String managerReturnDateReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(length = 500)
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private Long reviewedBy; // Manager user ID

    private LocalDateTime reviewedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // One-to-One relationship with LaptopIssue (when approved)
    @JsonIgnore
    @OneToOne(mappedBy = "laptopRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LaptopIssue laptopIssue;
}
