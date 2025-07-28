<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProviderRegistrationRequest;
use App\Models\Provider;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProviderController extends Controller
{
    /**
     * Register a new provider.
     *
     * @param \App\Http\Requests\Api\V1\ProviderRegistrationRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyEmail(string $token)
    {
        $provider = Provider::where('email_verification_token', $token)->first();
        
        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token'
            ], 400);
        }
        
        if ($provider->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 400);
        }
        // dd("test");
        $provider->email_verified_at = now();
        $provider->email_verification_token = null;
        $provider->verification_status = 'verified';
        $provider->is_active = true; // Ensure the provider is active after verification
        $provider->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully',
            'data' => [
                'email_verified_at' => $provider->email_verified_at,
                'verification_status' => $provider->verification_status
            ]
        ]);
    }

    public function register(ProviderRegistrationRequest $request)
    {
        try {
            $validated = $request->validated();
            
            // Hash the password
            $validated['password'] = Hash::make($validated['password']);
            // Generate email verification token
            $validated['email_verification_token'] = Str::random(64);
            $validated['verification_status'] = 'pending';
            // Create the provider
            $provider = Provider::create($validated);
            // dd("test");
            // dd($provider);
            
            // Send verification email
            $provider->notify(new EmailVerificationNotification($provider->email_verification_token));
            
            // Remove sensitive data
            unset($provider->password);
            
            // Send verification email
            // TODO: Implement email verification
            
            // Create audit log
            // TODO: Implement audit logging
            
            return response()->json([
                'message' => 'Provider registered successfully',
                'data' => $provider
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Provider registration failed', [
                'error' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
                'input' => $request->all(),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip()
            ]);
            
            return response()->json([
                'message' => 'Provider registration failed',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }
}
