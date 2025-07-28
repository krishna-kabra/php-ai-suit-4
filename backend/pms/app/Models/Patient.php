<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Patient extends Authenticatable implements MustVerifyEmail, JWTSubject
{
    use HasFactory, Notifiable;

    // Removed UUID handling
    // public $incrementing = false;
    // protected $keyType = 'string';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'date_of_birth',
        'gender',
        'address',
        'emergency_contact',
        'medical_history',
        'insurance_info',
        'email_verified_at',
        'email_verification_token',
        'phone_verified',
        'phone_verification_code',
        'phone_verification_code_expires_at',
        'phone_verification_attempts',
        'is_active',
        'marketing_consent',
        'last_terms_accepted_at',
        'data_retention_policy_version'
    ];

    protected $hidden = [
        'password',
        'email_verification_token',
        'phone_verification_code',
        'registration_ip',
        'last_login_ip'
    ];

    protected $casts = [
        'address' => 'array',
        'emergency_contact' => 'array',
        'medical_history' => 'array',
        'insurance_info' => 'array',
        'email_verified_at' => 'datetime',
        'phone_verification_code_expires_at' => 'datetime',
        'last_login_at' => 'datetime',
        'locked_until' => 'datetime',
        'last_terms_accepted_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'phone_verified' => 'boolean',
        'marketing_consent' => 'boolean'
    ];

    // Removed UUID generation
    // protected static function boot()
    // {
    //     parent::boot();
    //     static::creating(function ($model) {
    //         if (!$model->id) {
    //             $model->id = (string) Str::uuid();
    //         }
    //     });
    // }

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
            'patient_id' => $this->id,
            'email' => $this->email,
            'role' => 'patient',
        ];
    }

    /**
     * Calculate patient's age from date of birth
     */
    public function getAgeAttribute(): int
    {
        return $this->date_of_birth->age;
    }

    /**
     * Check if the patient meets COPPA age requirements
     */
    public function isCoppaCompliant(): bool
    {
        return $this->age >= 13;
    }

    /**
     * Check if patient's phone verification code is valid and not expired
     */
    public function isPhoneVerificationCodeValid(): bool
    {
        if (!$this->phone_verification_code || !$this->phone_verification_code_expires_at) {
            return false;
        }

        return !$this->phone_verification_code_expires_at->isPast() &&
               $this->phone_verification_attempts < 3;
    }

    /**
     * Check if the patient has verified both email and phone
     */
    public function isFullyVerified(): bool
    {
        return $this->email_verified_at !== null && $this->phone_verified;
    }
}
