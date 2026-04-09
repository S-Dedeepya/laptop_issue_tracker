package com.laptoptracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Application Class for Laptop Issue Tracker Backend
 * 
 * @author Senior Backend Engineer
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class LaptopIssueTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(LaptopIssueTrackerApplication.class, args);
        System.out.println("====================================");
        System.out.println("Laptop Issue Tracker API is running!");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("====================================");
    }
}
