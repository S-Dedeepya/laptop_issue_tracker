package com.laptoptracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Student Email Verification Request (Forgot Password)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyStudentEmailRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
}
