package com.laptoptracker.controller;

import com.laptoptracker.dto.ApiResponse;
import com.laptoptracker.dto.AuthResponse;
import com.laptoptracker.dto.LoginRequest;
import com.laptoptracker.dto.StudentSignupRequest;
import com.laptoptracker.dto.VerifyStudentEmailRequest;
import com.laptoptracker.dto.ResetPasswordRequest;
import com.laptoptracker.enums.Role;
import com.laptoptracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles authentication endpoints for students and managers
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Student Signup
     * POST /auth/student/signup
     */
    @PostMapping("/student/signup")
    public ResponseEntity<ApiResponse> studentSignup(@Valid @RequestBody StudentSignupRequest request) {
        AuthResponse authResponse = authService.registerStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Student registered successfully", authResponse));
    }

    /**
     * Student Login
     * POST /auth/student/login
     */
    @PostMapping("/student/login")
    public ResponseEntity<ApiResponse> studentLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request, Role.STUDENT);
        return ResponseEntity.ok(new ApiResponse(true, "Login successful", authResponse));
    }

    /**
     * Manager Login
     * POST /auth/manager/login
     */
    @PostMapping("/manager/login")
    public ResponseEntity<ApiResponse> managerLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request, Role.MANAGER);
        return ResponseEntity.ok(new ApiResponse(true, "Login successful", authResponse));
    }

    /**
     * Verify Student Email for Password Reset
     * POST /auth/student/verify-email
     */
    @PostMapping("/student/verify-email")
    public ResponseEntity<ApiResponse> verifyStudentEmail(@Valid @RequestBody VerifyStudentEmailRequest request) {
        authService.verifyStudentEmail(request.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "Email verified successfully", null));
    }

    /**
     * Reset Student Password
     * POST /auth/student/reset-password
     */
    @PostMapping("/student/reset-password")
    public ResponseEntity<ApiResponse> resetStudentPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetStudentPassword(request);
        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully", null));
    }
}
