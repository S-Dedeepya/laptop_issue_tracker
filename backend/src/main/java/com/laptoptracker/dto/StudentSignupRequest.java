package com.laptoptracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Student Signup Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSignupRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Registration number is required")
    @Size(min = 5, max = 50, message = "Registration number must be between 5 and 50 characters")
    private String registrationNumber;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, message = "Phone number must be at least 10 characters")
    private String phoneNumber;

    private String address;
}
