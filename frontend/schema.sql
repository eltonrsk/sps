-- Student Pickup Management System Database Schema
-- This SQL file creates the necessary tables for a school student pickup system
-- using QR codes for verification and authorization.
-- Compatible with MySQL/MariaDB (XAMPP)

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS student_pickup_system;
-- USE student_pickup_system;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role ENUM('admin', 'parent', 'teacher', 'security') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    class_name VARCHAR(50),
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user_profiles(id)
);

-- Create guardians table (junction table for user-student relationships)
CREATE TABLE guardians (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_authorized BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_guardian_student (user_id, student_id)
);

-- Create qr_codes table
CREATE TABLE qr_codes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    student_id CHAR(36),
    code VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create pickups table
CREATE TABLE pickups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id CHAR(36) NOT NULL,
    picked_by_user_id CHAR(36) NOT NULL,
    verified_by_user_id CHAR(36) NOT NULL,
    qr_code_id CHAR(36),
    pickup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (picked_by_user_id) REFERENCES user_profiles(id),
    FOREIGN KEY (verified_by_user_id) REFERENCES user_profiles(id),
    FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
);

-- Create notifications table
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_students_created_by ON students(created_by);
CREATE INDEX idx_guardians_user_id ON guardians(user_id);
CREATE INDEX idx_guardians_student_id ON guardians(student_id);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_student_id ON qr_codes(student_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code);
CREATE INDEX idx_pickups_student_id ON pickups(student_id);
CREATE INDEX idx_pickups_picked_by_user_id ON pickups(picked_by_user_id);
CREATE INDEX idx_pickups_verified_by_user_id ON pickups(verified_by_user_id);
CREATE INDEX idx_pickups_qr_code_id ON pickups(qr_code_id);
CREATE INDEX idx_pickups_pickup_time ON pickups(pickup_time);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);