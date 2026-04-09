package com.laptoptracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Creating a Laptop
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaptopDTO {

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    private String specifications;

    private String gpuSpecification;
}
