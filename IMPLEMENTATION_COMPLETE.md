# Registration Module - Complete Implementation Guide

## ✅ What Has Been Implemented

### 1. **Backend - Database Migrations** (6 files)
All database tables are now managed by Laravel migrations:

| Migration | Table | Purpose |
|-----------|-------|---------|
| `2024_01_01_000000_...` | `personal_access_tokens` | Sanctum authentication tokens |
| `2024_01_01_000001_...` | `user_profiles` | **Users registration data** |
| `2024_01_01_000002_...` | `students` | Student information |
| `2024_01_01_000003_...` | `guardians` | Guardian-Student relationships |
| `2024_01_01_000004_...` | `qr_codes` | QR code management |
| `2024_01_01_000005_...` | `pickups` | Pickup records |
| `2024_01_01_000006_...` | `notifications` | User notifications |

**Location:** `backend/database/migrations/`

### 2. **Backend - Registration Service**
- **File:** `backend/app/Services/RegistrationService.php`
- **Purpose:** Encapsulates registration business logic
- **Methods:**
  - `register(array $data): UserProfile` - Create new user
  - `getUserData(UserProfile $user): array` - Format user data

### 3. **Frontend - API Client**
- **File:** `frontend/src/lib/api.ts`
- **Purpose:** Handles all backend communication
- **Key Features:**
  - Authentication token management
  - Token persistence in localStorage
  - Request/response handling
  - Error management
- **Methods:**
  - `register()` - Register new user
  - `login()` - Login user
  - `logout()` - Logout user
  - `getMe()` - Get current user data

### 4. **Frontend - AuthContext Update**
- **File:** `frontend/src/contexts/AuthContext.tsx`
- **Changes:**
  - Removed mock implementations
  - Connected to real API client
  - Added auto-authentication check on app load
  - Proper token management
  - Error handling

### 5. **Documentation**
- **`docs/REGISTRATION_MODULE.md`** - Complete API and system documentation
- **`docs/REGISTRATION_FLOW.md`** - Visual flow diagrams
- **`REGISTRATION_SETUP.md`** - Implementation summary and setup
- **`backend/.env.example`** - Environment configuration template

---

## 🚀 Quick Start Guide

### Step 1: Set Up Backend Environment
```bash
cd backend

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Run migrations (creates all tables)
php artisan migrate
```

### Step 2: Start Backend Server
```bash
# Terminal 1
cd backend
php artisan serve
```
Backend will run on `http://localhost:8000`

### Step 3: Start Frontend Server
```bash
# Terminal 2
cd frontend
npm install  # if needed
npm run dev
```
Frontend will run on `http://localhost:5173` (or shown in terminal)

### Step 4: Test Registration
1. Open `http://localhost:5173` in browser
2. Click "Sign Up"
3. Fill in registration form:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
   - Role: Select any role
4. Click Sign Up
5. Should be automatically logged in

---

## 📋 User Flow

```
User Registration → Email Validation → Password Hashing → 
Database Storage → Token Generation → Auto Login → Dashboard
```

---

## 🗄️ Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
    id CHAR(36) PRIMARY KEY,          -- UUID
    role ENUM(...),                   -- admin, parent, teacher, security
    full_name VARCHAR(255),           -- User's full name
    phone_number VARCHAR(20),         -- Optional phone
    email VARCHAR(255) UNIQUE,        -- Unique email
    password VARCHAR(255),            -- Hashed password
    is_active BOOLEAN DEFAULT TRUE,   -- Account status
    email_verified_at TIMESTAMP,      -- Email verification
    created_at TIMESTAMP,             -- Registration time
    updated_at TIMESTAMP              -- Last update
);
```

---

## 🔒 Security Features

✅ **Password Hashing** - Uses bcrypt hashing
✅ **Email Validation** - Format validation & uniqueness check
✅ **Token-Based Auth** - Laravel Sanctum API tokens
✅ **Token Persistence** - Secure localStorage storage
✅ **CORS Ready** - Configured for cross-origin requests
✅ **SQL Injection Protection** - Parameterized queries

---

## 📝 API Endpoint

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "password_confirmation": "securePassword123",
  "full_name": "John Doe",
  "role": "parent",
  "phone_number": "+1234567890"
}
```

**Success Response (201):**
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
    "token": "4|sj9dk3Ks8d9k3..."
  }
}
```

---

## 🔍 Verification

### Check if User Was Created in Database

**Option 1: Using Laravel Tinker**
```bash
cd backend
php artisan tinker

>>> App\Models\UserProfile::all();
>>> App\Models\UserProfile::where('email', 'test@example.com')->first();
```

**Option 2: Direct SQL Query**
```sql
SELECT * FROM user_profiles WHERE email = 'test@example.com';
```

**Option 3: Using Browser DevTools**
- Open Developer Tools (F12)
- Go to Application → Local Storage
- Look for `auth_token` key
- Check if token is saved

---

## ⚙️ Configuration

### Frontend API Base URL
**File:** `frontend/src/lib/api.ts`
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Backend Database
**File:** `backend/.env`
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=student_pickup_system
DB_USERNAME=root
DB_PASSWORD=
```

### CORS Settings
**File:** `backend/.env`
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🐛 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Table user_profiles doesn't exist" | Migrations not run | Run `php artisan migrate` |
| "API Error: 404" | Backend not running | Start: `php artisan serve` |
| "CORS error" | Origin not allowed | Update `CORS_ALLOWED_ORIGINS` in .env |
| "Email already exists" | Duplicate email | Use different email or clear table |
| "Token not saving" | localStorage disabled | Enable in browser settings |
| "Password too short" | Password < 6 chars | Use password with 6+ characters |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `docs/REGISTRATION_MODULE.md` | Complete system documentation |
| `docs/REGISTRATION_FLOW.md` | Flow diagrams and timelines |
| `REGISTRATION_SETUP.md` | Setup instructions and summary |
| `docs/SETUP_GUIDE.md` | Initial project setup |
| `docs/QUICK_REFERENCE.md` | Quick reference guide |

---

## ✨ Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ Complete | Full implementation |
| Database Storage | ✅ Complete | user_profiles table |
| Password Hashing | ✅ Complete | bcrypt encryption |
| Email Validation | ✅ Complete | Format & uniqueness |
| API Token | ✅ Complete | Sanctum authentication |
| Auto Login | ✅ Complete | After registration |
| Token Persistence | ✅ Complete | localStorage storage |
| Error Handling | ✅ Complete | Proper validation errors |
| CORS Support | ✅ Complete | Cross-origin ready |

---

## 🎯 Next Steps

After successful registration:
1. ✅ User can access protected pages
2. ✅ User profile data is available in React state
3. ✅ API token is used for authenticated requests
4. ✅ User can navigate to dashboard

---

## 📞 Support

For detailed information:
- See `docs/REGISTRATION_MODULE.md` for API details
- See `docs/REGISTRATION_FLOW.md` for flow diagrams
- See `REGISTRATION_SETUP.md` for complete setup
- Check browser console for error messages

---

## 🎉 You're All Set!

The user registration module is now fully implemented. Users can register through the frontend form and their data will be saved to the `user_profiles` table in the database.

**Ready to test?** Follow the "Quick Start Guide" above!
