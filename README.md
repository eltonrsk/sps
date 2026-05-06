# SPS - Student Pickup System
A comprehensive student pickup management system built with React (frontend) and Laravel (backend).

## 🚀 Features
- **QR Code Generation**: Generate unique QR codes for student pickup
- **Real-time Tracking**: Track student pickup status in real-time
- **User Management**: Manage students, guardians, and administrative staff
- **Notification System**: Automated notifications for pickup events
- **Secure Authentication**: JWT-based authentication system

## 🏗️ Project Structure
```
sps/
├── frontend/          # React.js frontend application
├── backend/           # Laravel API backend
└── docs/             # Documentation files
```

## 🛠️ Tech Stack
### Frontend
- React.js
- Vite
- Tailwind CSS

### Backend
- Laravel 11
- MySQL
- RESTful API

## 📋 Prerequisites
- Node.js (v18 or higher)
- PHP (v8.2 or higher)
- Composer
- MySQL
- Git

## 🚀 Quick Start
### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- [Setup Guide](docs/SETUP_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Quick Reference](docs/QUICK_REFERENCE.md)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors
- **Elton Ricardo** - *Initial work* - [eltonrsk](https://github.com/eltonrsk)

## 📞 Support
For support, please email wrecklonnie@gmail.com or create an issue in the repository.
