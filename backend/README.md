# Student Pickup Management System - Backend

A comprehensive Node.js backend API for managing student pickups with QR code verification and authorization.

## Features

- **User Management**: Admin, Parent, Teacher, and Security roles
- **Student Management**: Complete CRUD operations for students
- **QR Code System**: Generate and validate QR codes for secure pickups
- **Pickup Tracking**: Real-time pickup recording and history
- **Notifications**: Automated alerts for guardians and staff
- **Authentication**: JWT-based secure authentication
- **Database**: MySQL with optimized queries and transactions

## Tech Stack

- **Node.js** with ES Modules
- **Express.js** framework
- **MySQL** database with mysql2 driver
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security
- **Rate limiting** for API protection
- **Express validator** for input validation

## Database Schema

The system uses the following tables:
- `user_profiles` - User accounts and roles
- `students` - Student information
- `guardians` - Guardian-student relationships
- `qr_codes` - QR code management
- `pickups` - Pickup records
- `notifications` - System notifications

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sps/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=student_pickup_system
   DB_PORT=3306

   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h

   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up MySQL database**
   - Create database: `student_pickup_system`
   - Import the schema from `../frontend/schema.sql`
   - Add password_hash column to user_profiles table:
     ```sql
     ALTER TABLE user_profiles ADD COLUMN password_hash VARCHAR(255) AFTER email;
     ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (admin/teacher)
- `PUT /api/students/:id` - Update student (admin/teacher)
- `DELETE /api/students/:id` - Delete student (admin only)
- `GET /api/students/:id/guardians` - Get student guardians
- `POST /api/students/:id/guardians` - Add guardian (admin only)
- `GET /api/students/:id/pickups` - Get student pickup history

### QR Codes
- `POST /api/qrcodes` - Generate QR code
- `GET /api/qrcodes/validate/:code` - Validate QR code
- `GET /api/qrcodes/user/:userId` - Get user QR codes
- `GET /api/qrcodes/student/:studentId` - Get student QR codes
- `GET /api/qrcodes/:id` - Get QR code by ID
- `PATCH /api/qrcodes/:id/deactivate` - Deactivate QR code
- `PATCH /api/qrcodes/:id/expiry` - Update expiry
- `PATCH /api/qrcodes/:id/used` - Mark as used

### Pickups
- `POST /api/pickups` - Record pickup
- `POST /api/pickups/qr` - Process pickup with QR code
- `GET /api/pickups` - Get pickups with filters
- `GET /api/pickups/:id` - Get pickup by ID
- `GET /api/pickups/today/list` - Get today's pickups
- `GET /api/pickups/recent/list` - Get recent pickups
- `PATCH /api/pickups/:id/notes` - Update pickup notes

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get notification by ID
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/all/read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## User Roles

- **Admin**: Full system access
- **Teacher**: Can manage students and view pickups
- **Parent**: Can view own students and pickup history
- **Security**: Can verify pickups and validate QR codes

## Security Features

- JWT authentication with expiration
- Password hashing with bcryptjs
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation and sanitization
- SQL injection prevention with prepared statements
- Role-based access control

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional error details (if applicable)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

You can test the API using tools like:
- Postman
- Insomnia
- curl commands

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

## Development Notes

- The server uses ES modules (`"type": "module"` in package.json)
- Database connection pooling is configured for optimal performance
- All database queries use prepared statements to prevent SQL injection
- The API follows RESTful conventions
- Comprehensive error logging for debugging

## License

MIT License
