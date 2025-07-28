<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class PatientAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string', // email or phone
            'password' => 'required|string',
            'remember_me' => 'sometimes|boolean'
        ]);

        $patient = Patient::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if (!$patient || !Hash::check($request->password, $patient->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'error_code' => 'INVALID_CREDENTIALS'
            ], 401);
        }

        // Check if email is verified
        if (!$patient->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email address',
                'error_code' => 'EMAIL_NOT_VERIFIED'
            ], 403);
        }

        // Generate token using 'patient' guard
        $token = auth('patient')->claims([
            'patient_id' => $patient->id,
            'email' => $patient->email,
            'role' => 'patient'
        ])->login($patient);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'access_token' => $token,
                'expires_in' => auth('patient')->factory()->getTTL() * 60,
                'token_type' => 'Bearer',
                'patient' => [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'email' => $patient->email,
                ]
            ]
        ]);
    }

    public function refresh(Request $request)
    {
        return response()->json([
            'success' => true,
            'token' => auth('patient')->refresh(),
        ]);
    }

    public function logout()
    {
        auth('patient')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out'
        ]);
    }

    public function logoutAll()
    {
        auth('patient')->logout(true);

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices'
        ]);
    }
}
