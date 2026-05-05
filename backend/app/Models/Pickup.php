<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pickup extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'picked_by_user_id',
        'verified_by_user_id',
        'qr_code_id',
        'pickup_time',
        'notes',
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function pickedByUser()
    {
        return $this->belongsTo(UserProfile::class, 'picked_by_user_id');
    }

    public function verifiedByUser()
    {
        return $this->belongsTo(UserProfile::class, 'verified_by_user_id');
    }

    public function qrCode()
    {
        return $this->belongsTo(QrCode::class, 'qr_code_id');
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('pickup_time', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('pickup_time', [
            now()->startOfWeek(),
            now()->endOfWeek(),
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('pickup_time', [
            now()->startOfMonth(),
            now()->endOfMonth(),
        ]);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByPicker($query, $userId)
    {
        return $query->where('picked_by_user_id', $userId);
    }

    // Methods
    public function getTodayPickups()
    {
        return self::today()->get();
    }

    public static function getPickupStats($startDate = null, $endDate = null)
    {
        $query = self::query();

        if ($startDate) {
            $query->whereDate('pickup_time', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('pickup_time', '<=', $endDate);
        }

        return [
            'total_pickups' => $query->count(),
            'unique_students' => $query->distinct('student_id')->count(),
            'pickups_by_user' => $query->selectRaw('picked_by_user_id, COUNT(*) as count')
                ->groupBy('picked_by_user_id')
                ->get(),
        ];
    }
}
