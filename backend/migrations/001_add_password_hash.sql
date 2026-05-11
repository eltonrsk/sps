-- Migration 001: Add password_hash column to user_profiles table
-- This column is needed for user authentication

ALTER TABLE user_profiles 
ADD COLUMN password_hash VARCHAR(255) AFTER email;

-- Add index for better performance on login queries
CREATE INDEX idx_user_profiles_email_password ON user_profiles(email, password_hash);
