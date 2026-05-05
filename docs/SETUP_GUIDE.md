# Student Pickup System (SPS) - Complete Setup Guide

## 📁 Project Structure

```
Desktop/sps/
├── frontend/          (React + TypeScript + Vite)
├── backend/           (Laravel API)
│   ├── app/
│   │   ├── Models/           (6 Models with relationships)
│   │   └── Http/Controllers/Api/  (6 API Controllers)
│   ├── routes/
│   │   └── api.php          (All API endpoints)
│   └── database/
│       └── migrations/      (Database schema)
└── docs/              (Documentation)
```

---

## 🚀 Backend Setup (Laravel)

### Prerequisites
- PHP 8.1+
- Composer
- MySQL 8.0+

### Step 1: Create Laravel Project

```bash
cd Desktop/sps/backend
composer create-project laravel/laravel .

# Or if you already have Laravel installed
composer install
```

### Step 2: Copy Files to Laravel

Copy the provided files to these locations:

**Models:**
```
app/Models/
  ├── UserProfile.php
  ├── Student.php
  ├── Guardian.php
  ├── QrCode.php
  ├── Pickup.php
  └── Notification.php
```

**Controllers:**
```
app/Http/Controllers/Api/
  ├── AuthController.php
  ├── UserController.php
  ├── StudentController.php
  ├── QrCodeController.php
  ├── PickupController.php
  └── NotificationController.php
```

**Routes:**
```
routes/api.php  (Replace with provided file)
```

### Step 3: Setup Environment

Create `.env` file in backend root:

```env
APP_NAME="Student Pickup System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_pickup
DB_USERNAME=root
DB_PASSWORD=

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Step 4: Install Sanctum (for API auth)

```bash
php artisan install:api
```

### Step 5: Create Database

```bash
# Create MySQL database
mysql -u root -p
> CREATE DATABASE student_pickup;
> EXIT;

# Run migrations
php artisan migrate

# Seed admin user (optional)
php artisan tinker
> App\Models\UserProfile::create([
    'email' => 'admin@sps.com',
    'password' => bcrypt('password123'),
    'full_name' => 'System Admin',
    'role' => 'admin',
    'is_active' => true
  ]);
```

### Step 6: Enable CORS

Edit `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### Step 7: Start Server

```bash
php artisan serve
```

Server will run on: **http://localhost:8000**

---

## ⚛️ Frontend Setup (React)

### Prerequisites
- Node.js 16+
- npm or yarn

### Step 1: Move Existing React App

Your current React app in `v3` should be moved to `frontend`:

```bash
# Copy all files from Desktop/v3 to Desktop/sps/frontend
cp -r Desktop/v3/* Desktop/sps/frontend/
```

### Step 2: Install Dependencies

```bash
cd Desktop/sps/frontend
npm install
```

### Step 3: Setup Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

### Step 4: Start Dev Server

```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 📡 API Endpoints Reference

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login with email/password
POST   /api/auth/logout        - Logout (requires token)
GET    /api/auth/me            - Get current user
POST   /api/auth/refresh-token - Refresh auth token
```

### User Management
```
GET    /api/users              - List all users
POST   /api/users              - Create user (admin only)
GET    /api/users/{id}         - Get user details
PUT    /api/users/{id}         - Update user
DELETE /api/users/{id}         - Delete user (admin only)
POST   /api/users/{id}/toggle-active - Toggle user status
```

### Students
```
GET    /api/students           - List all students
POST   /api/students           - Create student
GET    /api/students/{id}      - Get student + guardians + pickups
PUT    /api/students/{id}      - Update student
DELETE /api/students/{id}      - Delete student (admin only)
GET    /api/students/by-guardian - Get current user's children
GET    /api/students/today/status - Get today's pickup status
```

### QR Codes
```
GET    /api/qr-codes           - List QR codes
POST   /api/qr-codes           - Generate single QR code
GET    /api/qr-codes/{id}      - Get QR code details
PUT    /api/qr-codes/{id}      - Update QR code
DELETE /api/qr-codes/{id}      - Delete QR code (admin only)
POST   /api/qr-codes/generate-bulk - Generate multiple codes (admin)
POST   /api/qr-codes/{id}/deactivate - Deactivate QR code
POST   /api/qr-codes/{id}/activate - Activate QR code
GET    /api/qr-codes/by-code/{code} - Validate QR code
```

### Pickups
```
GET    /api/pickups            - List pickups (with filters)
POST   /api/pickups            - Record pickup
GET    /api/pickups/{id}       - Get pickup details
PUT    /api/pickups/{id}       - Update pickup
DELETE /api/pickups/{id}       - Delete pickup
GET    /api/pickups/stats      - Pickup statistics (date range)
GET    /api/pickups/today/stats - Today's pickup stats
POST   /api/pickups/quick-pickup - Scan QR code for instant pickup
```

### Notifications
```
GET    /api/notifications      - List user notifications
POST   /api/notifications      - Create notification (admin/security only)
GET    /api/notifications/{id} - Get notification
DELETE /api/notifications/{id} - Delete notification
POST   /api/notifications/{id}/mark-as-read - Mark as read
POST   /api/notifications/{id}/mark-as-unread - Mark as unread
POST   /api/notifications/mark-all-as-read - Bulk mark as read
GET    /api/notifications/unread/count - Count unread
GET    /api/notifications/unread - List unread only
```

---

## 🔐 Authentication

All endpoints (except `/auth/register` and `/auth/login`) require:

**Header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Token obtained from:**
```bash
POST /api/auth/login
{
  "email": "admin@sps.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOi..."
  }
}
```

---

## 🗄️ Database Schema

### Tables

**user_profiles**
- id, email, password, full_name, role, phone_number, is_active, created_at, updated_at

**students**
- id, first_name, last_name, grade, class_name, photo_url, is_active, created_by, created_at, updated_at

**guardians**
- id, user_id, student_id, relationship, is_authorized, created_at, updated_at

**qr_codes**
- id, user_id, student_id, code, is_active, expires_at, last_used_at, created_at, updated_at

**pickups**
- id, student_id, picked_by_user_id, verified_by_user_id, qr_code_id, pickup_time, notes, created_at, updated_at

**notifications**
- id, user_id, title, message, type, is_read, created_at, updated_at

---

## 📝 User Roles

- **admin** - Full system access, manage users, students, QR codes
- **security** - Record pickups, scan QR codes, view reports
- **parent/teacher** - View own children, access QR codes, receive notifications

---

## 🧪 Testing API with Postman

1. Register a new user:
   ```
   POST http://localhost:8000/api/auth/register
   Body:
   {
     "email": "parent@sps.com",
     "password": "password123",
     "password_confirmation": "password123",
     "full_name": "John Parent",
     "role": "parent"
   }
   ```

2. Login:
   ```
   POST http://localhost:8000/api/auth/login
   Body:
   {
     "email": "parent@sps.com",
     "password": "password123"
   }
   ```

3. Copy the token and add to all subsequent requests:
   ```
   Header: Authorization: Bearer {token}
   ```

---

## 🔧 Common Commands

### Laravel
```bash
# Run migrations
php artisan migrate

# Reset database
php artisan migrate:fresh

# Run seeders
php artisan db:seed

# Create seeder
php artisan make:seeder StudentSeeder

# Tinker (PHP shell)
php artisan tinker
```

### React
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

---

## 🐛 Troubleshooting

### CORS Error
- Check `.env` `CORS_ALLOWED_ORIGINS` matches frontend URL
- Ensure `php artisan install:api` was run

### Database Connection Error
- Verify MySQL is running
- Check `.env` database credentials
- Run `php artisan migrate`

### Token Invalid/Expired
- Request new token: `POST /api/auth/refresh-token`
- Login again: `POST /api/auth/login`

### Port Already in Use
```bash
# Change Laravel port
php artisan serve --port=8001

# Change React port (in vite.config.ts)
server: {
  port: 5174
}
```

---

## 📚 Next Steps

1. **Create React API Service** - Connect frontend to backend
2. **Update React Auth Context** - Use Laravel API instead of mock
3. **Build Frontend Components** - Integrate with API endpoints
4. **Setup Database Seeders** - Create sample data
5. **Deploy** - Production setup

---

## 📞 Support

For questions or issues, refer to:
- Laravel Docs: https://laravel.com/docs
- React Docs: https://react.dev
- Sanctum Docs: https://laravel.com/docs/sanctum
