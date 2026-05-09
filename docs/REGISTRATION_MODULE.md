# User Registration Module Documentation

## Overview
This document explains how the user registration module works in the Student Pickup System. The module allows new users to register and be added to the `user_profiles` table in the database.

## System Architecture

### Frontend Flow
1. User fills in the registration form (Login.tsx)
2. Form data is sent to AuthContext via `signUp()` function
3. AuthContext calls the API client (`api.ts`) to submit registration request
4. API client sends POST request to backend at `/api/auth/register`
5. On success, auth token is stored and user is logged in automatically

### Backend Flow
1. Registration endpoint receives the request at `POST /api/auth/register`
2. AuthController validates the input data
3. UserProfile is created in the `user_profiles` database table
4. API token is generated using Laravel Sanctum
5. User data and token are returned to frontend

## Database Structure

The `user_profiles` table contains the following fields:
- `id` (UUID) - Unique identifier
- `email` (VARCHAR) - User's email address (unique)
- `password` (VARCHAR) - Hashed password
- `full_name` (VARCHAR) - User's full name
- `role` (ENUM) - User role: admin, security, parent, or teacher
- `phone_number` (VARCHAR, nullable) - User's phone number
- `is_active` (BOOLEAN) - Whether the account is active
- `created_at` (TIMESTAMP) - Registration timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## API Endpoint

### Register User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "password_confirmation": "securePassword123",
  "full_name": "John Doe",
  "role": "parent",
  "phone_number": "+1234567890"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "parent",
      "phone_number": "+1234567890",
      "is_active": true
    },
    "token": "4|sj9dk3Ks..."
  }
}
```

**Response (Error - 422):**
```json
{
  "email": ["The email has already been registered."],
  "password": ["The password must be at least 6 characters."]
}
```

## Validation Rules

- **Email**: Required, must be valid email format, must be unique
- **Password**: Required, minimum 6 characters, must match password_confirmation
- **Full Name**: Required, must be string
- **Role**: Required, must be one of: admin, security, parent, teacher
- **Phone Number**: Optional, must be string

## User Roles

Users are assigned one of the following roles during registration:

- **Admin**: Can manage all system features and users
- **Parent**: Can manage their own children's pickups
- **Teacher**: Can view student information and pickups
- **Security**: Can verify QR codes and process pickups

## Integration Points

### Frontend API Client (`frontend/src/lib/api.ts`)
- Handles all API communication
- Automatically stores authentication token in localStorage
- Provides `register()` method for user registration

### AuthContext (`frontend/src/contexts/AuthContext.tsx`)
- Manages user authentication state
- Provides `signUp()` function for registration
- Provides `signIn()` function for login
- Provides `signOut()` function for logout
- Automatically checks authentication status on app load

### Backend Controller (`backend/app/Http/Controllers/Api/AuthController.php`)
- Handles registration requests
- Validates input data
- Creates user in database
- Generates API token

## Setup Instructions

### 1. Database Setup
Run Laravel migrations to create the tables:
```bash
cd backend
php artisan migrate
```

This will create all necessary tables including `user_profiles`.

### 2. Backend Configuration
Ensure your `.env` file has the correct database configuration:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_pickup_system
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Frontend Configuration
Update the API base URL in `frontend/src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000/api'; // Adjust port if needed
```

### 4. Start Services
**Backend (Laravel):**
```bash
cd backend
php artisan serve
```

**Frontend (React):**
```bash
cd frontend
npm install
npm run dev
```

## Testing Registration

1. Navigate to the registration form
2. Fill in the form with:
   - Email: `testuser@example.com`
   - Password: `password123`
   - Full Name: `Test User`
   - Role: `parent`
   - Phone (optional): `+1234567890`
3. Click "Sign Up"
4. User should be automatically logged in
5. Check database to confirm user was added:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'testuser@example.com';
   ```

## Security Features

- Passwords are hashed using bcrypt
- API uses Laravel Sanctum for token-based authentication
- Tokens are stored securely in localStorage
- Email addresses are unique and validated
- CORS headers can be configured for security

## Troubleshooting

### Error: "The email has already been registered"
- User with this email already exists
- Use a different email or reset the user in the database

### Error: "API Error: 404"
- Backend server is not running
- Check if Laravel server is started: `php artisan serve`
- Verify the API_BASE_URL is correct

### Error: "The password must be at least 6 characters"
- Password is too short
- Use a password with minimum 6 characters

### Token not persisting
- Check browser's localStorage is enabled
- Verify the token is being saved in `api.ts`

## Future Enhancements

- Email verification before account activation
- Two-factor authentication
- Social login (Google, Microsoft)
- Password reset functionality
- User profile photo upload
- Admin user approval for certain roles
