-- ====================================================
-- LAPTOP ISSUE TRACKER - DATABASE SCHEMA
-- ====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS laptop_tracker_db;
USE laptop_tracker_db;

-- ====================================================
-- TABLE: users
-- Stores authentication information for all users
-- ====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLE: student_profiles
-- Stores additional information for student users
-- ====================================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    address VARCHAR(200),
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_registration_number (registration_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLE: laptops
-- Stores laptop inventory information
-- ====================================================
CREATE TABLE IF NOT EXISTS laptops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    specifications VARCHAR(500),
    gpu_specification VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_serial_number (serial_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLE: laptop_requests
-- Stores student laptop requests
-- ====================================================
CREATE TABLE IF NOT EXISTS laptop_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    request_date DATE NOT NULL,
    requested_return_date DATE,
    selected_laptop_id BIGINT,
    selected_laptop_spec VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    manager_approved_return_date DATE,
    manager_return_date_reason VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_laptop_id) REFERENCES laptops(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_selected_laptop_id (selected_laptop_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLE: laptop_issues
-- Stores approved and issued laptop records
-- ====================================================
CREATE TABLE IF NOT EXISTS laptop_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    laptop_id BIGINT NOT NULL,
    laptop_request_id BIGINT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    original_return_deadline DATE NOT NULL,
    current_return_deadline DATE NOT NULL,
    actual_return_date DATE,
    is_returned BOOLEAN NOT NULL DEFAULT FALSE,
    extension_count INT NOT NULL DEFAULT 0,
    issued_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (laptop_id) REFERENCES laptops(id) ON DELETE RESTRICT,
    FOREIGN KEY (laptop_request_id) REFERENCES laptop_requests(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_laptop_id (laptop_id),
    INDEX idx_is_returned (is_returned),
    INDEX idx_current_return_deadline (current_return_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLE: extension_requests
-- Stores extension requests for laptop issues
-- ====================================================
CREATE TABLE IF NOT EXISTS extension_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    laptop_issue_id BIGINT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    extension_days INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (laptop_issue_id) REFERENCES laptop_issues(id) ON DELETE CASCADE,
    INDEX idx_laptop_issue_id (laptop_issue_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLE: notifications
-- Stores notifications for students
-- ====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- INSERT DEFAULT MANAGER ACCOUNT
-- ====================================================
-- Password: manager123(BCrypt encrypted)
INSERT INTO users (email, password, role, active, created_at, updated_at) 
VALUES (
    'manager@laptoptracker.com',
    '$2a$10$xZ8YQVyLqY6hGVXJKFvG3eKrYrLqM8fVXNqMQx7YvXPxGKYqPZY6K',
    'MANAGER',
    TRUE,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE email=email;

-- ====================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ====================================================

-- Sample Laptops
INSERT INTO laptops (serial_number, brand, model, specifications, gpu_specification, status, created_at, updated_at)
VALUES 
    ('LAP001', 'Dell', 'Latitude 5420', 'Intel i5-1145G7, 16GB RAM, 512GB SSD', 'Iris Xe', 'AVAILABLE', NOW(), NOW()),
    ('LAP002', 'HP', 'EliteBook 840 G8', 'Intel i7-1165G7, 16GB RAM, 1TB SSD', 'Iris Xe', 'AVAILABLE', NOW(), NOW()),
    ('LAP003', 'Lenovo', 'ThinkPad X1 Carbon', 'Intel i7-1185G7, 32GB RAM, 512GB SSD', 'Iris Xe', 'AVAILABLE', NOW(), NOW()),
    ('LAP004', 'Apple', 'MacBook Pro 14', 'M1 Pro, 16GB RAM, 512GB SSD', 'Integrated 14-core', 'AVAILABLE', NOW(), NOW()),
    ('LAP005', 'ASUS', 'ZenBook 14', 'Intel i5-1135G7, 8GB RAM, 512GB SSD', 'Iris Xe', 'AVAILABLE', NOW(), NOW()),
    ('LAP006', 'Acer', 'Swift X 14', 'AMD Ryzen 7 7840U, 16GB RAM, 1TB SSD', 'NVIDIA RTX 4050 6GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP007', 'MSI', 'Prestige 14 Evo', 'Intel i7-13700H, 16GB RAM, 1TB SSD', 'Intel Iris Xe', 'AVAILABLE', NOW(), NOW()),
    ('LAP008', 'Dell', 'XPS 15', 'Intel i7-13700H, 32GB RAM, 1TB SSD', 'NVIDIA RTX 4060 8GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP009', 'HP', 'Omen 16', 'AMD Ryzen 9 7940HS, 32GB RAM, 1TB SSD', 'NVIDIA RTX 4070 8GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP010', 'Lenovo', 'Legion 7', 'Intel i9-13900HX, 32GB RAM, 1TB SSD', 'NVIDIA RTX 4080 12GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP011', 'Apple', 'MacBook Air 15', 'M2, 16GB RAM, 512GB SSD', 'Integrated 10-core', 'AVAILABLE', NOW(), NOW()),
    ('LAP012', 'ASUS', 'ROG Zephyrus G14', 'AMD Ryzen 9 6900HS, 16GB RAM, 1TB SSD', 'AMD Radeon RX 6800S 8GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP013', 'Acer', 'Predator Triton 300', 'Intel i7-12700H, 16GB RAM, 1TB SSD', 'NVIDIA RTX 3070 Ti 8GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP014', 'MSI', 'Stealth 16 Studio', 'Intel i9-13900H, 32GB RAM, 1TB SSD', 'NVIDIA RTX 4070 8GB', 'AVAILABLE', NOW(), NOW()),
    ('LAP015', 'Dell', 'Latitude 7440', 'Intel i7-1365U, 16GB RAM, 512GB SSD', 'Iris Xe', 'AVAILABLE', NOW(), NOW())
ON DUPLICATE KEY UPDATE serial_number=serial_number;

-- ====================================================
-- USEFUL QUERIES
-- ====================================================

-- Get all pending laptop requests with student details
-- SELECT lr.*, sp.full_name, sp.registration_number, u.email
-- FROM laptop_requests lr
-- JOIN student_profiles sp ON lr.student_id = sp.id
-- JOIN users u ON sp.user_id = u.id
-- WHERE lr.status = 'PENDING'
-- ORDER BY lr.created_at DESC;

-- Get all active laptop issues with student and laptop details
-- SELECT li.*, sp.full_name, sp.registration_number, l.brand, l.model, l.serial_number
-- FROM laptop_issues li
-- JOIN student_profiles sp ON li.student_id = sp.id
-- JOIN laptops l ON li.laptop_id = l.id
-- WHERE li.is_returned = FALSE
-- ORDER BY li.current_return_deadline ASC;

-- Get overdue laptops
-- SELECT li.*, sp.full_name, sp.registration_number, l.brand, l.model
-- FROM laptop_issues li
-- JOIN student_profiles sp ON li.student_id = sp.id
-- JOIN laptops l ON li.laptop_id = l.id
-- WHERE li.is_returned = FALSE AND li.current_return_deadline < CURDATE()
-- ORDER BY li.current_return_deadline ASC;

-- Get laptops nearing deadline (within 7 days)
-- SELECT li.*, sp.full_name, sp.registration_number, l.brand, l.model,
--        DATEDIFF(li.current_return_deadline, CURDATE()) AS days_remaining
-- FROM laptop_issues li
-- JOIN student_profiles sp ON li.student_id = sp.id
-- JOIN laptops l ON li.laptop_id = l.id
-- WHERE li.is_returned = FALSE 
--   AND li.current_return_deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
-- ORDER BY li.current_return_deadline ASC;

-- Get pending extension requests
-- SELECT er.*, li.id AS issue_id, sp.full_name, sp.registration_number, l.brand, l.model
-- FROM extension_requests er
-- JOIN laptop_issues li ON er.laptop_issue_id = li.id
-- JOIN student_profiles sp ON li.student_id = sp.id
-- JOIN laptops l ON li.laptop_id = l.id
-- WHERE er.status = 'PENDING'
-- ORDER BY er.created_at DESC;
