<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentSlot extends Model
{
    use HasFactory;
    // use HasUuids;

    protected $fillable = [
        'availability_id', 'provider_id', 'slot_start_time', 'slot_end_time',
        'status', 'patient_id', 'appointment_type', 'booking_reference'
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function availability()
    {
        return $this->belongsTo(ProviderAvailability::class);
    }
}
