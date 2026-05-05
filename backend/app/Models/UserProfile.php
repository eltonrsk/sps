<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class UserProfile extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'user_profiles';

    protected $fillable = [
        'email',
        'password',
        'full_name',
        'role',
        'phone_number',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    // Relationships
    public function students()
    {
        return $this->hasMany(Student::class, 'created_by');
    }

    public function guardianRelationships()
    {
        return $this->hasMany(Guardian::class, 'user_id');
    }

    public function qrCodes()
    {
        return $this->hasMany(QrCode::class, 'user_id');
    }

    public function pickupsAsPicker()
    {
        return $this->hasMany(Pickup::class, 'picked_by_user_id');
    }

    public function pickupsAsVerifier()
    {
        return $this->hasMany(Pickup::class, 'verified_by_user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSecurity()
    {
        return $this->role === 'security';
    }

    public function isParent()
    {
        return $this->role === 'parent';
    }

    public function isTeacher()
    {
        return $this->role === 'teacher';
    }
}
