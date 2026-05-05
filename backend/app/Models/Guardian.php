<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'relationship',
        'is_authorized',
    ];

    protected $casts = [
        'is_authorized' => 'boolean',
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

    public function authorize()
    {
        $this->update(['is_authorized' => true]);
    }

    public function revoke()
    {
        $this->update(['is_authorized' => false]);
    }
}
