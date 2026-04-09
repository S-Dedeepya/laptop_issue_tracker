package com.laptoptracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Authentication Response (JWT Token)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String role;
    private String fullName; // For students
    private String registrationNumber; // For students
    private String phoneNumber; // For students

    public AuthResponse(String token, Long id, String email, String role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
    }
}
