package com.laptoptracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Request Review (Approve/Reject)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestReviewDTO {

    @NotNull(message = "Approval status is required")
    private Boolean approved;

    private String rejectionReason;
}
