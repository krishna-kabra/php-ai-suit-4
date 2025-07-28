<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ProviderLoginRequest;
use App\Models\Provider;
use App\Models\RefreshToken;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ProviderAuthController extends Controller
{
    /**
     * Login provider and return JWT token
     */
    public function login(ProviderLoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Find provider by email or phone number
        $provider = Provider::where('email', $validated['identifier'])
            ->orWhere('phone_number', $validated['identifier'])
            ->first();
        Log::info('Login attempt', ['identifier' => $validated['identifier'], 'provider' => $provider]);
        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'error_code' => 'INVALID_CREDENTIALS'
            ], 401);
        }
        
        // Check if account is locked
        if ($provider->locked_until && $provider->locked_until > now()) {
            return response()->json([
                'success' => false,
                'message' => 'Account is locked. Please try again later.',
                'error_code' => 'ACCOUNT_LOCKED'
            ], 423);
        }
        
        // Check if email is verified
        if (!$provider->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email address before logging in',
                'error_code' => 'EMAIL_NOT_VERIFIED'
            ], 403);
        }
        
        // Check if account is verified and active
        if ($provider->verification_status !== 'verified' || !$provider->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is not verified or inactive',
                'error_code' => 'ACCOUNT_INACTIVE'
            ], 403);
        }
        // Verify password
        if (!Hash::check($validated['password'], $provider->password)) {
            // Increment failed login attempts
            $provider->failed_login_attempts++;
            
            // Lock account if too many failed attempts
            if ($provider->failed_login_attempts >= 5) {
                $provider->locked_until = now()->addMinutes(30);
            }
            
            $provider->save();
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'error_code' => 'INVALID_CREDENTIALS'
            ], 401);
        }
        
        // Reset failed login attempts
        $provider->failed_login_attempts = 0;
        $provider->last_login = now();
        $provider->login_count++;
        $provider->save();
        
        // Generate tokens
        $tokenExpiry = $validated['remember_me'] ?? false ? now()->addDay() : now()->addHour();
        $refreshExpiry = $validated['remember_me'] ?? false ? now()->addDays(30) : now()->addDays(7);
        
        $token = JWTAuth::claims([
            'provider_id' => $provider->id,
            'email' => $provider->email,
            'role' => 'provider',
            'specialization' => $provider->specialization,
            'verification_status' => $provider->verification_status
        ])->fromUser($provider);
        
        // Create refresh token
        $refreshToken = RefreshToken::create([
            'provider_id' => $provider->id,
            'token_hash' => Hash::make(Str::random(40)),
            'expires_at' => $refreshExpiry,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'access_token' => $token,
                'refresh_token' => $refreshToken->token_hash,
                'expires_in' => $tokenExpiry->diffInSeconds(now()),
                'token_type' => 'Bearer',
                'provider' => [
                    'id' => $provider->id,
                    'first_name' => $provider->first_name,
                    'last_name' => $provider->last_name,
                    'email' => $provider->email,
                    'specialization' => $provider->specialization,
                    'verification_status' => $provider->verification_status,
                    'is_active' => $provider->is_active
                ]
            ]
        ], 200);
    }
    
    /**
     * Refresh access token using refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = RefreshToken::where('token_hash', $request->refresh_token)
            ->where('expires_at', '>', now())
            ->where('is_revoked', false)
            ->first();
            
        if (!$refreshToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid refresh token',
                'error_code' => 'INVALID_REFRESH_TOKEN'
            ], 401);
        }
        
        $provider = $refreshToken->provider;
        
        // Generate new access token
        $token = JWTAuth::claims([
            'provider_id' => $provider->id,
            'email' => $provider->email,
            'role' => 'provider',
            'specialization' => $provider->specialization,
            'verification_status' => $provider->verification_status
        ])->fromUser($provider);
        
        // Update refresh token
        $refreshToken->last_used_at = now();
        $refreshToken->save();
        
        return response()->json([
            'success' => true,
            'data' => [
                'access_token' => $token,
                'expires_in' => config('jwt.ttl') * 60,
                'token_type' => 'Bearer'
            ]
        ]);
    }
    
    /**
     * Logout provider and invalidate refresh token
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->refresh_token) {
            RefreshToken::where('token_hash', $request->refresh_token)
                ->update(['is_revoked' => true]);
        }
        
        JWTAuth::invalidate(JWTAuth::getToken());
        
        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out'
        ]);
    }
    
    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $provider = JWTAuth::parseToken()->authenticate();
        
        RefreshToken::where('provider_id', $provider->id)
            ->update(['is_revoked' => true]);
            
        JWTAuth::invalidate(JWTAuth::getToken());
        
        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out from all devices'
        ]);
    }
}
