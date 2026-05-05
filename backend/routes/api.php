<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\PickupController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh-token', [AuthController::class, 'refreshToken']);

    // Users Management
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);

    // Students Management
    Route::get('/students', [StudentController::class, 'index']);
    Route::post('/students', [StudentController::class, 'store']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::put('/students/{id}', [StudentController::class, 'update']);
    Route::delete('/students/{id}', [StudentController::class, 'destroy']);
    Route::get('/students/by-guardian', [StudentController::class, 'getByGuardian']);
    Route::get('/students/today/status', [StudentController::class, 'getTodayStatus']);

    // QR Codes Management
    Route::get('/qr-codes', [QrCodeController::class, 'index']);
    Route::post('/qr-codes', [QrCodeController::class, 'store']);
    Route::get('/qr-codes/{id}', [QrCodeController::class, 'show']);
    Route::put('/qr-codes/{id}', [QrCodeController::class, 'update']);
    Route::delete('/qr-codes/{id}', [QrCodeController::class, 'destroy']);
    Route::post('/qr-codes/generate-bulk', [QrCodeController::class, 'generateBulk']);
    Route::post('/qr-codes/{id}/deactivate', [QrCodeController::class, 'deactivate']);
    Route::post('/qr-codes/{id}/activate', [QrCodeController::class, 'activate']);
    Route::get('/qr-codes/by-code/{code}', [QrCodeController::class, 'getByCode']);

    // Pickups Management
    Route::get('/pickups', [PickupController::class, 'index']);
    Route::post('/pickups', [PickupController::class, 'store']);
    Route::get('/pickups/{id}', [PickupController::class, 'show']);
    Route::put('/pickups/{id}', [PickupController::class, 'update']);
    Route::delete('/pickups/{id}', [PickupController::class, 'destroy']);
    Route::get('/pickups/stats', [PickupController::class, 'getStats']);
    Route::get('/pickups/today/stats', [PickupController::class, 'getTodayStats']);
    Route::post('/pickups/quick-pickup', [PickupController::class, 'quickPickup']);

    // Notifications Management
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/mark-as-unread', [NotificationController::class, 'markAsUnread']);
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread/count', [NotificationController::class, 'getUnreadCount']);
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread']);
});
