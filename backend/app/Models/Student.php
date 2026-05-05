<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'grade',
        'class_name',
        'photo_url',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(UserProfile::class, 'created_by');
    }

    public function guardians()
    {
        return $this->hasMany(Guardian::class, 'student_id');
    }

    public function parentGuardians()
    {
        return $this->guardians()
            ->whereHas('user', function ($query) {
                $query->where('role', 'parent');
            });
    }

    public function qrCodes()
    {
        return $this->hasMany(QrCode::class, 'student_id');
    }

    public function pickups()
    {
        return $this->hasMany(Pickup::class, 'student_id');
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getTodayPickupsAttribute()
    {
        return $this->pickups()
            ->whereDate('pickup_time', today())
            ->get();
    }

    public function isPickedUpToday()
    {
        return $this->pickups()
            ->whereDate('pickup_time', today())
            ->exists();
    }
}
