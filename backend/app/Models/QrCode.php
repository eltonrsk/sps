<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class QrCode extends Model
{
    use HasFactory;

    protected $table = 'qr_codes';

    protected $fillable = [
        'user_id',
        'student_id',
        'code',
        'is_active',
        'expires_at',
        'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(UserProfile::class, 'user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function pickups()
    {
        return $this->hasMany(Pickup::class, 'qr_code_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeNotExpired($query)
    {
        return $query->where('expires_at', '>', now())
            ->orWhereNull('expires_at');
    }

    // Methods
    public function isExpired()
    {
        if ($this->expires_at) {
            return $this->expires_at->isPast();
        }
        return false;
    }

    public function isValid()
    {
        return $this->is_active && !$this->isExpired();
    }

    public function markAsUsed()
    {
        $this->update(['last_used_at' => now()]);
    }

    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    public function activate()
    {
        $this->update(['is_active' => true]);
    }

    public static function generateCode()
    {
        $code = strtoupper(bin2hex(random_bytes(8)));
        while (self::where('code', $code)->exists()) {
            $code = strtoupper(bin2hex(random_bytes(8)));
        }
        return $code;
    }
}
