<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderAvailability extends Model
{
    use HasFactory;
    // use HasUuids;


    protected $fillable = [
        'provider_id', 'date', 'start_time', 'end_time', 'timezone',
        'is_recurring', 'recurrence_pattern', 'recurrence_end_date',
        'slot_duration', 'break_duration', 'status', 'max_appointments_per_slot',
        'current_appointments', 'appointment_type', 'location', 'pricing',
        'notes', 'special_requirements'
    ];

    protected $casts = [
        'location' => 'array',
        'pricing' => 'array',
        'special_requirements' => 'array',
        'is_recurring' => 'boolean',
    ];

    public function slots()
    {
        return $this->hasMany(AppointmentSlot::class, 'availability_id');
    }
}
