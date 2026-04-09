package com.laptoptracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for Manager Approval of Laptop Request
 * Allows manager to approve with student's requested return date or override it with an earlier date
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestApprovalDTO {

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Approval decision is required")
    private Boolean approveRequestedDate;

    @NotNull(message = "Return deadline is required")
    private LocalDate returnDeadline;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String returnDateReason;

    // Validation helper method
    public void validate(LocalDate studentRequestedReturnDate) throws IllegalArgumentException {
        // If manager does not approve student's requested date, the manager date must be earlier
        if (!approveRequestedDate && studentRequestedReturnDate != null) {
            if (!returnDeadline.isBefore(studentRequestedReturnDate)) {
                throw new IllegalArgumentException(
                    "Manager-defined return deadline must be earlier than the student's requested return date of " +
                    studentRequestedReturnDate
                );
            }
        }
    }
}
