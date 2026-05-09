# Registration Flow Diagram

## Complete Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER REGISTRATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

1. FRONTEND - User Registration Form
   ├─ User enters email
   ├─ User enters password
   ├─ User enters full name
   ├─ User selects role (admin/parent/teacher/security)
   └─ User enters phone number (optional)
        │
        ▼
2. FRONTEND - Form Validation (Login.tsx)
   ├─ Email format check
   ├─ Password length check
   ├─ Full name required
   └─ Role selected
        │
        ▼
3. FRONTEND - Call signUp() (AuthContext.tsx)
   └─ await api.register(email, password, fullName, role, phone)
        │
        ▼
4. FRONTEND - API Client (api.ts)
   ├─ Build request object:
   │  ├─ email
   │  ├─ password
   │  ├─ password_confirmation (required by Laravel)
   │  ├─ full_name
   │  ├─ role
   │  └─ phone_number
   └─ POST /api/auth/register
        │
        ▼
5. BACKEND - API Endpoint (AuthController@register)
   ├─ Receive POST request
   └─ Route: Route::post('/auth/register', [AuthController::class, 'register'])
        │
        ▼
6. BACKEND - Validation
   ├─ email: required, email format, unique
   ├─ password: required, min:6, confirmed
   ├─ full_name: required, string
   ├─ role: required, in:admin,security,parent,teacher
   └─ phone_number: nullable, string
        │
        ├─ ✓ Validation passes ─────────────────┐
        │                                       │
        ├─ ✗ Validation fails                  │
        │  └─ Return 422 with errors           │
        └─────────────────────────────────────┘
        │
        ▼
7. BACKEND - Create User in Database
   ├─ UserProfile::create([
   │  ├─ email
   │  ├─ password: Hash::make(password)  [HASHED]
   │  ├─ full_name
   │  ├─ role
   │  ├─ phone_number
   │  └─ is_active: true
   │ ])
   └─ INSERT INTO user_profiles (...)
        │
        ▼
8. DATABASE - User Saved
   ├─ Table: user_profiles
   ├─ New row created with UUID
   ├─ Password is bcrypt hashed
   ├─ Timestamp recorded
   └─ User is active by default
        │
        ▼
9. BACKEND - Generate API Token
   ├─ $token = $user->createToken('auth_token')->plainTextToken
   └─ Sanctum creates personal_access_tokens entry
        │
        ▼
10. BACKEND - Return Response (201 Created)
    ├─ success: true
    ├─ message: "User registered successfully"
    ├─ data.user:
    │  ├─ id
    │  ├─ email
    │  ├─ full_name
    │  ├─ role
    │  ├─ phone_number
    │  └─ is_active
    └─ data.token: "4|sj9dk3Ks..."
        │
        ▼
11. FRONTEND - Receive Response (api.ts)
    ├─ Parse JSON response
    ├─ Extract token
    ├─ Call setToken(token)
    │  └─ Store in localStorage
    └─ Return authData to caller
        │
        ▼
12. FRONTEND - Update Auth State (AuthContext.tsx)
    ├─ setUser({ id, email })
    └─ setProfile({
        ├─ id
        ├─ email
        ├─ full_name
        ├─ role
        ├─ phone_number
        └─ is_active
       })
        │
        ▼
13. FRONTEND - User Auto-Login
    ├─ User is logged in
    ├─ Token is persisted
    ├─ Protected routes accessible
    └─ Redirect to dashboard
        │
        ▼
14. SUCCESS ✓
    └─ User account created and active!
```

## Data Flow Summary

```
User Input (Frontend)
    │
    ▼
Form Validation
    │
    ▼
API Request (POST /api/auth/register)
    │
    ▼
Backend Validation
    │
    ├─ Fail ─→ Return 422 Error
    │
    ▼
Hash Password
    │
    ▼
Create Database Record (user_profiles)
    │
    ▼
Generate Sanctum Token
    │
    ▼
Return Response with Token (201)
    │
    ▼
Store Token in localStorage
    │
    ▼
Update React State
    │
    ▼
User Logged In ✓
```

## Database Entry Example

### What gets stored in `user_profiles`:

```
id:              550e8400-e29b-41d4-a716-446655440000
email:           john@example.com
password:        $2y$10$F9/kE2q8B2k9D... (bcrypt hashed)
full_name:       John Doe
role:            parent
phone_number:    +1234567890
is_active:       1 (true)
email_verified_at: NULL
created_at:      2024-05-06 10:30:00
updated_at:      2024-05-06 10:30:00
```

## Error Scenarios

```
Scenario 1: Email Already Exists
├─ Backend receives duplicate email
├─ Validation fails
└─ Returns 422: { "email": ["The email has already been registered."] }

Scenario 2: Password Too Short
├─ Password < 6 characters
├─ Validation fails
└─ Returns 422: { "password": ["The password must be at least 6 characters."] }

Scenario 3: Invalid Email Format
├─ Email doesn't match email@domain.com pattern
├─ Validation fails
└─ Returns 422: { "email": ["The email field must be a valid email."] }

Scenario 4: Missing Required Field
├─ One or more required fields missing
├─ Validation fails
└─ Returns 422: Field is required

Scenario 5: Network Error
├─ Frontend can't reach backend
├─ API call fails
└─ User sees: "API Error: [status]"
```

## Token Storage

```
After Successful Registration:

localStorage:
├─ auth_token: "4|sj9dk3Ks8d..." (persists across browser sessions)

headers (on subsequent requests):
└─ Authorization: Bearer 4|sj9dk3Ks8d...
```

## Timeline Example

```
T+0s:    User clicks "Sign Up"
T+1s:    Form validation complete
T+2s:    API request sent to backend
T+3s:    Backend validates input
T+4s:    Database row created
T+5s:    Token generated
T+6s:    Response sent to frontend
T+7s:    Token stored in localStorage
T+8s:    User state updated
T+9s:    User redirected to dashboard ✓
```
