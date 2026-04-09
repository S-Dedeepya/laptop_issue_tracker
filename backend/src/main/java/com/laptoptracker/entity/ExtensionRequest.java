package com.laptoptracker.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.laptoptracker.enums.ExtensionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Extension Request Entity
 * Represents a student's request to extend laptop return deadline
 */
@Entity
@Table(name = "extension_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ExtensionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonManagedReference
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laptop_issue_id", nullable = false)
    private LaptopIssue laptopIssue;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false)
    private Integer extensionDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExtensionStatus status = ExtensionStatus.PENDING;

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
}
