<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Appointment extends Model
{
    protected $fillable = [
        'uuid',
        'patient_id',
        'provider_id',
        'appointment_slot_id',
        'episode_date',
        'episode_type',
        'episode_details',
        'vitals',
        'status',
        'notes',
    ];

    protected $casts = [
        'vitals' => 'array',
        'episode_date' => 'date',
    ];

    // Automatically generate UUID
    protected static function booted()
    {
        static::creating(function ($appointment) {
            $appointment->uuid = (string) Str::uuid();
        });
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function slot()
    {
        return $this->belongsTo(AppointmentSlot::class, 'appointment_slot_id');
    }
}
