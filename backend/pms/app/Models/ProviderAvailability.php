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
        'provider_id',
        'day_of_week',
        'specific_date',
        'availability_type',
        'start_time',
        'end_time',
        'is_available',
        'time_zone',
        'block_date',
        'block_from_time',
        'block_to_time'
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'specific_date' => 'date',
        'block_date' => 'date',
        'start_time' => 'datetime:H:i:s',
        'end_time' => 'datetime:H:i:s',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function slots()
    {
        return $this->hasMany(AppointmentSlot::class, 'availability_id');
    }
}
