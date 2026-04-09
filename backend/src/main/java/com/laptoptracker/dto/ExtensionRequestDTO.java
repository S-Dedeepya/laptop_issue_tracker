package com.laptoptracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Extension Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtensionRequestDTO {

    @NotNull(message = "Laptop issue ID is required")
    private Long laptopIssueId;

    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String reason;

    @NotNull(message = "Extension days is required")
    @Min(value = 1, message = "Extension days must be at least 1")
    private Integer extensionDays;
}
