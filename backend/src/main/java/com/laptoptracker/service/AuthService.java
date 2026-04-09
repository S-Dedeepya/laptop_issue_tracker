package com.laptoptracker.service;

import com.laptoptracker.dto.AuthResponse;
import com.laptoptracker.dto.LoginRequest;
import com.laptoptracker.dto.StudentSignupRequest;
import com.laptoptracker.dto.UpdateProfileRequest;
import com.laptoptracker.dto.ChangePasswordRequest;
import com.laptoptracker.dto.UserProfileDTO;
import com.laptoptracker.dto.VerifyStudentEmailRequest;
import com.laptoptracker.dto.ResetPasswordRequest;
import com.laptoptracker.entity.StudentProfile;
import com.laptoptracker.entity.User;
import com.laptoptracker.enums.Role;
import com.laptoptracker.exception.BadRequestException;
import com.laptoptracker.repository.StudentProfileRepository;
import com.laptoptracker.repository.UserRepository;
import com.laptoptracker.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for Authentication operations
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Register a new student
     */
    @Transactional
    public AuthResponse registerStudent(StudentSignupRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Check if registration number already exists
        if (studentProfileRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Registration number already registered");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setActive(true);
        
        User savedUser = userRepository.save(user);

        // Create student profile
        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(savedUser);
        studentProfile.setFullName(request.getFullName());
        studentProfile.setRegistrationNumber(request.getRegistrationNumber());
        studentProfile.setPhoneNumber(request.getPhoneNumber());
        studentProfile.setAddress(request.getAddress());
        
        studentProfileRepository.save(studentProfile);

        // Generate JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(savedUser.getEmail())
                .password(savedUser.getPassword())
                .roles(savedUser.getRole().name())
                .build();

        String token = jwtTokenProvider.generateToken(userDetails);

        // Create response
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().name());
        response.setFullName(request.getFullName());
        response.setRegistrationNumber(request.getRegistrationNumber());

        return response;
    }

    /**
     * Login for students and managers
     */
    public AuthResponse login(LoginRequest request, Role expectedRole) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        // Check role
        if (user.getRole() != expectedRole) {
            throw new BadRequestException("Invalid credentials for this role");
        }

        // Generate JWT token
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);

        // Create response
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        // Add student-specific info
        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BadRequestException("Student profile not found"));
            response.setFullName(profile.getFullName());
            response.setRegistrationNumber(profile.getRegistrationNumber());
            response.setPhoneNumber(profile.getPhoneNumber());
        }

        return response;
    }

    /**
     * Get current authenticated user
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    /**
     * Get current authenticated student profile
     */
    public StudentProfile getCurrentStudentProfile() {
        User user = getCurrentUser();
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User is not a student");
        }
        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Student profile not found"));
    }

    /**
     * Get current user profile as DTO
     */
    public UserProfileDTO getCurrentUserProfile() {
        User user = getCurrentUser();
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BadRequestException("Student profile not found"));
            dto.setFullName(profile.getFullName());
            dto.setRegistrationNumber(profile.getRegistrationNumber());
            dto.setPhoneNumber(profile.getPhoneNumber());
            dto.setAddress(profile.getAddress());
        }

        return dto;
    }

    /**
     * Update student profile information
     */
    @Transactional
    public UserProfileDTO updateStudentProfile(UpdateProfileRequest request) {
        StudentProfile profile = getCurrentStudentProfile();
        
        profile.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        
        studentProfileRepository.save(profile);
        
        return getCurrentUserProfile();
    }

    /**
     * Change password for current user
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }

        // Validate new password is different from current
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        User user = getCurrentUser();

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Verify student email exists for password reset
     */
    public void verifyStudentEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only students can reset password using this method");
        }
    }

    /**
     * Reset student password with phone number verification
     * Phone number must match the registered phone number
     */
    @Transactional
    public void resetStudentPassword(ResetPasswordRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only students can reset password");
        }

        // Find student profile
        StudentProfile studentProfile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Student profile not found"));

        // Verify phone number matches registered phone number
        if (studentProfile.getPhoneNumber() == null || 
            !studentProfile.getPhoneNumber().equals(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number does not match registered phone number");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
