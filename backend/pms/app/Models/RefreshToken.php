<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RefreshToken extends Model
{
    use HasFactory;

    // public $incrementing = false;
    // protected $keyType = 'string';

    protected $fillable = [
        'id',
        'provider_id',
        'token_hash',
        'expires_at',
        'is_revoked',
        'last_used_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
        'is_revoked' => 'boolean'
    ];

    protected static function boot()
    {
        // parent::boot();
        // static::creating(function ($model) {
        //     if (!$model->id) {
        //         $model->id = (string) Str::uuid();
        //     }
        // });
        // static::creating(function ($model) {
        //     $model->id = (string) Str::uuid();
        // });
        parent::boot();
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
