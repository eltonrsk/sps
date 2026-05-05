<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(UserProfile::class, 'user_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Methods
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    public function markAsUnread()
    {
        $this->update(['is_read' => false]);
    }

    public static function markAllAsRead($userId)
    {
        self::where('user_id', $userId)->update(['is_read' => true]);
    }

    public static function createPickupNotification($studentId, $message)
    {
        $student = Student::find($studentId);
        $guardians = $student->guardians()->get();

        foreach ($guardians as $guardian) {
            self::create([
                'user_id' => $guardian->user_id,
                'title' => 'Student Pickup',
                'message' => $message,
                'type' => 'pickup',
                'is_read' => false,
            ]);
        }
    }

    public static function createSystemNotification($userId, $title, $message)
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => 'system',
            'is_read' => false,
        ]);
    }
}
