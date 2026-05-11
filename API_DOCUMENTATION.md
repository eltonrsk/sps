# Student Pickup Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Authentication Endpoints

### POST /auth/login
Login user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "parent",
    "phone_number": "+1234567890",
    "is_active": true
  },
  "token": "jwt_token_here"
}
```

### POST /auth/register
Register new user (admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "parent",
  "phone_number": "+1234567890",
  "password": "password123"
}
```

### POST /auth/change-password
Change user password.

**Request Body:**
```json
{
  "userId": "uuid",
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### GET /auth/verify
Verify if token is still valid.

**Headers:** `Authorization: Bearer <token>`

## User Management Endpoints

### GET /users
Get all users (admin only).

**Query Parameters:**
- `role` (optional): Filter by role ('admin', 'parent', 'teacher', 'security')

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "parent",
    "phone_number": "+1234567890",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /users/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

### GET /users/:id
Get user by ID (admin only).

**Headers:** `Authorization: Bearer <token>`

### POST /users
Create new user (admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "parent",
  "phone_number": "+1234567890",
  "password": "password123"
}
```

### PUT /users/:id
Update user (admin only or own profile).

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "role": "parent",
  "phone_number": "+1234567890",
  "is_active": true
}
```

### DELETE /users/:id
Delete user (admin only - soft delete).

**Headers:** `Authorization: Bearer <token>`

## Student Management Endpoints

### GET /students
Get all students.

**Query Parameters:**
- `grade` (optional): Filter by grade
- `class_name` (optional): Filter by class

**Response:**
```json
[
  {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "grade": "1st Grade",
    "class_name": "A",
    "photo_url": "http://example.com/photo.jpg",
    "is_active": true,
    "created_by": "uuid",
    "created_by_name": "Admin User",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /students/:id
Get student by ID.

**Headers:** `Authorization: Bearer <token>`

### POST /students
Create new student (admin/teacher only).

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "grade": "1st Grade",
  "class_name": "A",
  "photo_url": "http://example.com/photo.jpg"
}
```

### PUT /students/:id
Update student (admin/teacher only).

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "grade": "1st Grade",
  "class_name": "A",
  "photo_url": "http://example.com/photo.jpg",
  "is_active": true
}
```

### DELETE /students/:id
Delete student (admin only - soft delete).

**Headers:** `Authorization: Bearer <token>`

### GET /students/guardian/:guardianId
Get students by guardian.

**Headers:** `Authorization: Bearer <token>`

### GET /students/:id/guardians
Get guardians for a student.

**Headers:** `Authorization: Bearer <token>`

### POST /students/:id/guardians
Add guardian to student (admin only).

**Request Body:**
```json
{
  "user_id": "uuid",
  "relationship": "Father",
  "is_authorized": true
}
```

### DELETE /students/:id/guardians/:userId
Remove guardian from student (admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /students/:id/pickups
Get student pickup history.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)

**Headers:** `Authorization: Bearer <token>`

## QR Code Endpoints

### POST /qrcodes
Generate new QR code.

**Request Body:**
```json
{
  "user_id": "uuid",
  "student_id": "uuid",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "message": "QR code generated successfully",
  "qrCode": {
    "id": "uuid",
    "code": "ABC123DEF456"
  }
}
```

### GET /qrcodes/validate/:code
Validate QR code.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "QR code is valid",
  "qrCode": {
    "id": "uuid",
    "user_id": "uuid",
    "student_id": "uuid",
    "code": "ABC123DEF456",
    "is_active": true,
    "expires_at": null,
    "created_at": "2024-01-01T00:00:00Z",
    "last_used_at": null,
    "user_name": "John Doe",
    "user_role": "parent",
    "student_name": "Jane Doe",
    "grade": "1st Grade",
    "class_name": "A"
  }
}
```

### GET /qrcodes/user/:userId
Get QR codes for user.

**Query Parameters:**
- `include_expired` (optional): Include expired codes (true/false)

**Headers:** `Authorization: Bearer <token>`

### GET /qrcodes/student/:studentId
Get QR codes for student.

**Query Parameters:**
- `include_expired` (optional): Include expired codes (true/false)

**Headers:** `Authorization: Bearer <token>`

### GET /qrcodes/:id
Get QR code by ID.

**Headers:** `Authorization: Bearer <token>`

### GET /qrcodes
Get all QR codes (admin only).

**Query Parameters:**
- `include_expired` (optional): Include expired codes (true/false)

**Headers:** `Authorization: Bearer <token>`

### PATCH /qrcodes/:id/deactivate
Deactivate QR code.

**Headers:** `Authorization: Bearer <token>`

### PATCH /qrcodes/:id/expiry
Update QR code expiry.

**Request Body:**
```json
{
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Headers:** `Authorization: Bearer <token>`

### PATCH /qrcodes/:id/used
Mark QR code as used.

**Headers:** `Authorization: Bearer <token>`

## Pickup Endpoints

### POST /pickups
Create new pickup record.

**Request Body:**
```json
{
  "student_id": "uuid",
  "picked_by_user_id": "uuid",
  "verified_by_user_id": "uuid",
  "qr_code_id": "uuid",
  "notes": "Normal pickup"
}
```

### POST /pickups/qr
Process pickup with QR code.

**Request Body:**
```json
{
  "qr_code": "ABC123DEF456",
  "student_id": "uuid",
  "notes": "QR code pickup"
}
```

### GET /pickups
Get all pickups with filters.

**Query Parameters:**
- `student_id` (optional): Filter by student
- `picked_by_user_id` (optional): Filter by picker
- `verified_by_user_id` (optional): Filter by verifier
- `date_from` (optional): Filter by date from
- `date_to` (optional): Filter by date to
- `limit` (optional): Number of records to return (default: 100)

**Headers:** `Authorization: Bearer <token>`

### GET /pickups/:id
Get pickup by ID.

**Headers:** `Authorization: Bearer <token>`

### GET /pickups/today/list
Get today's pickups.

**Headers:** `Authorization: Bearer <token>`

### GET /pickups/statistics/data
Get pickup statistics (admin only).

**Query Parameters:**
- `date_from` (optional): Filter by date from
- `date_to` (optional): Filter by date to

**Headers:** `Authorization: Bearer <token>`

### GET /pickups/guardian/:guardianId
Get pickups by guardian.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)

**Headers:** `Authorization: Bearer <token>`

### PATCH /pickups/:id/notes
Update pickup notes.

**Request Body:**
```json
{
  "notes": "Updated notes"
}
```

**Headers:** `Authorization: Bearer <token>`

### DELETE /pickups/:id
Delete pickup (admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /pickups/recent/list
Get recent pickups for dashboard.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)

**Headers:** `Authorization: Bearer <token>`

## Notification Endpoints

### GET /notifications
Get notifications for current user.

**Query Parameters:**
- `include_read` (optional): Include read notifications (true/false)
- `limit` (optional): Number of records to return (default: 50)

**Headers:** `Authorization: Bearer <token>`

### GET /notifications/:id
Get notification by ID.

**Headers:** `Authorization: Bearer <token>`

### GET /notifications/unread/count
Get unread count for current user.

**Headers:** `Authorization: Bearer <token>`

### PATCH /notifications/:id/read
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

### PATCH /notifications/all/read
Mark all notifications as read for current user.

**Headers:** `Authorization: Bearer <token>`

### DELETE /notifications/:id
Delete notification.

**Headers:** `Authorization: Bearer <token>`

### POST /notifications
Create custom notification (admin only).

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Notification Title",
  "message": "Notification message",
  "type": "pickup"
}
```

### GET /notifications/admin/all
Get all notifications (admin only).

**Query Parameters:**
- `user_id` (optional): Filter by user
- `type` (optional): Filter by type
- `is_read` (optional): Filter by read status
- `date_from` (optional): Filter by date from
- `date_to` (optional): Filter by date to
- `limit` (optional): Number of records to return (default: 100)

**Headers:** `Authorization: Bearer <token>`

### GET /notifications/admin/statistics
Get notification statistics (admin only).

**Query Parameters:**
- `date_from` (optional): Filter by date from
- `date_to` (optional): Filter by date to

**Headers:** `Authorization: Bearer <token>`

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (if applicable)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

## CORS

The API supports CORS with the following configuration:
- Origin: `http://localhost:5173` (configurable via FRONTEND_URL env var)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: Content-Type, Authorization
