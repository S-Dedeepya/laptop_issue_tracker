package com.laptoptracker.dto;

import com.laptoptracker.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user profile information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    private Long id;
    private String email;
    private Role role;
    private String fullName;
    private String registrationNumber; // For students
    private String phoneNumber;
    private String address;
}
