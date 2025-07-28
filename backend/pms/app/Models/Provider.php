<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Provider extends Authenticatable implements MustVerifyEmail, JWTSubject
{
    use HasFactory, Notifiable;

    // REMOVE UUID handling
    // public $incrementing = false;
    // protected $keyType = 'string';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'specialization',
        'license_number',
        'years_of_experience',
        'clinic_address',
        'verification_status',
        'license_document_url',
        'is_active',
        'email_verification_token',
        'email_verified_at'
    ];

    protected $casts = [
        'clinic_address' => 'array',
        'is_active' => 'boolean',
        'years_of_experience' => 'integer',
        'email_verified_at' => 'datetime'
    ];

    /**
     * Determine if the provider is active and email verified
     */
    public function isFullyVerified(): bool
    {
        return $this->is_active && $this->email_verified_at !== null;
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'verification_status' => $this->verification_status
        ];
    }

    protected $hidden = [
        'password'
    ];

    // REMOVE the UUID generation boot method
    // protected static function boot()
    // {
    //     parent::boot();
    //     static::creating(function ($model) {
    //         $model->id = (string) Str::uuid();
    //     });
    // }
}
