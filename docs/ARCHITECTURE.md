# System Architecture - User Registration Module

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Login.tsx (Form)                         │  │
│  │  - Email input                                              │  │
│  │  - Password input                                           │  │
│  │  - Full Name input                                          │  │
│  │  - Role dropdown (admin/parent/teacher/security)           │  │
│  │  - Phone number input                                       │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
│                            │ calls signUp()                       │
│  ┌────────────────────────▼──────────────────────────────────┐   │
│  │              AuthContext.tsx (State)                     │   │
│  │  - Manages user authentication state                     │   │
│  │  - Calls api.register()                                  │   │
│  │  - Stores user profile in React state                   │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           │ calls register()                      │
│  ┌────────────────────────▼──────────────────────────────────┐   │
│  │               api.ts (API Client)                        │   │
│  │  - POST /api/auth/register                               │   │
│  │  - Stores token in localStorage                          │   │
│  │  - Manages Authorization headers                         │   │
│  └────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────
                            │ HTTP POST
                            │ with credentials
                            │
                            ▼
┌────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Laravel)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           routes/api.php (Routes)                           │  │
│  │  - Route::post('/auth/register', [AuthController::class, │  │
│  │                                    'register'])            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                    │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │     AuthController.php (Request Handler)                 │  │
│  │  - register() method                                     │  │
│  │  - Validates input                                       │  │
│  │  - Creates UserProfile                                  │  │
│  │  - Generates Sanctum token                              │  │
│  │  - Returns response                                      │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                    │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │     UserProfile.php (Model)                              │  │
│  │  - Extends Authenticatable                              │  │
│  │  - Has fillable properties                              │  │
│  │  - Casts data types                                     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │ INSERT                              │
│                           │                                    │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │     personal_access_tokens (Token Storage)               │  │
│  │  - Stores authentication token                           │  │
│  │  - Links to user via tokenable_id                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │ INSERT                              │
│                           │                                    │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │     user_profiles (User Data Table)                      │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ id (UUID)                                           │ │  │
│  │  │ email (UNIQUE)                                      │ │  │
│  │  │ password (HASHED)                                   │ │  │
│  │  │ full_name                                           │ │  │
│  │  │ role (admin/parent/teacher/security)               │ │  │
│  │  │ phone_number (nullable)                             │ │  │
│  │  │ is_active (boolean)                                 │ │  │
│  │  │ created_at / updated_at                             │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                    │
│                           └─ Response with token               │
└────────────────────────────────────────────────────────────────────
                            │ HTTP Response (201)
                            │ with token
                            │
                            ▼
┌────────────────────────────────────────────────────────────────────┐
│                          DATABASE (MySQL)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  user_profiles table                                         │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │ ✓ New user row created                              │    │  │
│  │  │ ✓ Password hashed with bcrypt                       │    │  │
│  │  │ ✓ Email marked unique                               │    │  │
│  │  │ ✓ Role assigned                                     │    │  │
│  │  │ ✓ Timestamps recorded                               │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                     FRONTEND COMPONENTS                              │
└──────────────────────────────────────────────────────────────────────┘
         │
         ├─ Login.tsx (UI Form)
         │  └─ Collects user input
         │
         ├─ AuthContext.tsx (State Management)
         │  ├─ signUp() method
         │  ├─ Manages user state
         │  └─ Manages profile state
         │
         └─ api.ts (HTTP Client)
            ├─ register() method
            ├─ setToken() for localStorage
            └─ getHeaders() for auth


┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND COMPONENTS                              │
└──────────────────────────────────────────────────────────────────────┘
         │
         ├─ routes/api.php
         │  └─ Defines /auth/register endpoint
         │
         ├─ AuthController.php
         │  ├─ register() handler
         │  └─ Validates & creates user
         │
         ├─ UserProfile.php (Model)
         │  ├─ Maps to user_profiles table
         │  └─ Manages user data
         │
         ├─ RegistrationService.php (Optional)
         │  └─ Business logic service
         │
         ├─ personal_access_tokens table
         │  └─ Stores Sanctum tokens
         │
         └─ user_profiles table
            └─ Stores user data
```

## Data Flow Sequence

```
1. User Input
   └─> Form submission with email, password, name, role

2. Frontend Validation
   └─> Input validation in Login.tsx

3. API Call
   └─> POST /api/auth/register from api.ts

4. Backend Processing
   └─> AuthController validation
   └─> UserProfile::create()

5. Database Storage
   └─> INSERT INTO user_profiles
   └─> INSERT INTO personal_access_tokens

6. Response
   └─> Return 201 with user data and token

7. Frontend State Update
   └─> Store token in localStorage
   └─> Update React state with user profile

8. Auto Login
   └─> User redirected to dashboard
   └─> Protected routes now accessible
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           FRONTEND STACK               │
├─────────────────────────────────────────┤
│ React                                   │
│ TypeScript                              │
│ Vite (Build tool)                       │
│ localStorage (Token storage)            │
│ Fetch API (HTTP requests)               │
│ TailwindCSS (UI styling)                │
└─────────────────────────────────────────┘
         │
         ▼ HTTP (REST API)
         
┌─────────────────────────────────────────┐
│           BACKEND STACK                │
├─────────────────────────────────────────┤
│ Laravel 11                              │
│ PHP 8.x                                 │
│ Laravel Sanctum (API Auth)              │
│ bcrypt (Password hashing)               │
│ UUID (User IDs)                         │
│ MySQL/MariaDB                           │
└─────────────────────────────────────────┘
         │
         ▼ SQL
         
┌─────────────────────────────────────────┐
│        DATABASE STACK                  │
├─────────────────────────────────────────┤
│ MySQL / MariaDB                         │
│ user_profiles table                     │
│ personal_access_tokens table            │
│ Related tables (students, guardians...) │
└─────────────────────────────────────────┘
```

## File Structure

```
Project Root
│
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  │  └─ Login.tsx ........................ Registration form
│  │  │
│  │  ├─ contexts/
│  │  │  └─ AuthContext.tsx ................. Auth state & logic
│  │  │
│  │  └─ lib/
│  │     └─ api.ts ......................... API client
│  │
│  ├─ package.json
│  └─ vite.config.ts
│
├─ backend/
│  ├─ app/
│  │  ├─ Http/
│  │  │  └─ Controllers/Api/
│  │  │     └─ AuthController.php ......... Auth endpoint
│  │  │
│  │  ├─ Models/
│  │  │  └─ UserProfile.php .............. User model
│  │  │
│  │  └─ Services/
│  │     └─ RegistrationService.php ...... Registration logic
│  │
│  ├─ database/
│  │  └─ migrations/
│  │     ├─ ..._create_personal_access_tokens_table.php
│  │     ├─ ..._create_user_profiles_table.php ........ ✓ MAIN
│  │     ├─ ..._create_students_table.php
│  │     ├─ ..._create_guardians_table.php
│  │     ├─ ..._create_qr_codes_table.php
│  │     ├─ ..._create_pickups_table.php
│  │     └─ ..._create_notifications_table.php
│  │
│  ├─ routes/
│  │  └─ api.php .......................... API routes
│  │
│  ├─ .env.example ........................ Configuration template
│  └─ .env (not in repo)
│
├─ docs/
│  ├─ REGISTRATION_MODULE.md ............. Complete documentation
│  ├─ REGISTRATION_FLOW.md ............... Flow diagrams
│  ├─ SETUP_GUIDE.md
│  └─ QUICK_REFERENCE.md
│
├─ IMPLEMENTATION_COMPLETE.md ........... This implementation summary
└─ REGISTRATION_SETUP.md ............... Setup instructions
```

## Security Architecture

```
┌──────────────────────────────────────────────────┐
│           SECURITY LAYERS                        │
├──────────────────────────────────────────────────┤
│                                                  │
│ 1. Frontend                                      │
│    ├─ Input validation                           │
│    ├─ Form sanitization                          │
│    └─ HTTPS (in production)                      │
│                                                  │
│ 2. API Communication                             │
│    ├─ CORS validation                            │
│    ├─ HTTPS (in production)                      │
│    └─ Content-Type validation                    │
│                                                  │
│ 3. Backend                                       │
│    ├─ Input validation                           │
│    ├─ SQL injection protection                   │
│    ├─ Parameterized queries                      │
│    └─ Email uniqueness check                     │
│                                                  │
│ 4. Authentication                                │
│    ├─ bcrypt password hashing                    │
│    ├─ Sanctum API tokens                         │
│    ├─ Token expiration (configurable)            │
│    └─ Token revocation support                   │
│                                                  │
│ 5. Database                                      │
│    ├─ Unique email constraint                    │
│    ├─ NOT NULL constraints                       │
│    ├─ Indexed for performance                    │
│    └─ User permissions (MySQL)                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

This architecture provides a complete, secure, and scalable user registration system!
