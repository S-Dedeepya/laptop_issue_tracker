package com.laptoptracker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for Laptop Issue Approval
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaptopIssueApprovalDTO {

    @NotNull(message = "Laptop ID is required")
    private Long laptopId;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Return deadline is required")
    private LocalDate returnDeadline;
}
