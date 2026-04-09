package com.laptoptracker.repository;

import com.laptoptracker.entity.User;
import com.laptoptracker.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
    
    Optional<User> findByEmailAndRole(String email, Role role);
}
