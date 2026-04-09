package com.laptoptracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * DTO for Laptop Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaptopRequestDTO {

    @NotBlank(message = "Reason is required")
    @Size(min = 5, max = 500, message = "Reason must be between 5 and 500 characters")
    private String reason;

    @NotNull(message = "Booking date is required")
    private LocalDate requestDate;

    @NotNull(message = "Requested return date is required")
    private LocalDate requestedReturnDate;

    @NotNull(message = "Laptop selection is required")
    private Long laptopId;
}
