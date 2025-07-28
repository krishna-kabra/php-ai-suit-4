<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PatientRegistrationRequest;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Mail\VerifyEmail;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class PatientController extends Controller
{
    /**
     * Register a new patient
     */
    public function register(PatientRegistrationRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Get validated data
            $validated = $request->validated();
            
            // Create the patient
            $patient = new Patient();
            $patient->first_name = $validated['first_name'];
            $patient->last_name = $validated['last_name'];
            $patient->email = $validated['email'];
            $patient->phone_number = $validated['phone_number'];
            $patient->password = Hash::make($validated['password']);
            $patient->date_of_birth = $validated['date_of_birth'];
            $patient->gender = $validated['gender'];
            $patient->address = $validated['address'];
            
            if (isset($validated['emergency_contact'])) {
                $patient->emergency_contact = $validated['emergency_contact'];
            }
            
            if (isset($validated['insurance_info'])) {
                $patient->insurance_info = $validated['insurance_info'];
            }
            
            if (isset($validated['medical_history'])) {
                $patient->medical_history = $validated['medical_history'];
            }
            
            $patient->marketing_consent = $validated['marketing_consent'] ?? false;
            $patient->last_terms_accepted_at = now();
            $patient->registration_ip = $request->ip();
            
            // Generate email verification token
            $patient->email_verification_token = Str::uuid();
            
            // Generate phone verification code
            $patient->phone_verification_code = sprintf('%06d', random_int(0, 999999));
            $patient->phone_verification_code_expires_at = now()->addMinutes(5);
            
            $patient->save();

            // Send verification email
            Mail::to($patient->email)->send(new VerifyEmail($patient));

            // TODO: Send SMS verification code
            // Implement SMS service integration here
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient registered successfully. Verification email sent.',
                'data' => [
                    'patient_id' => $patient->id,
                    'email' => $patient->email,
                    'phone_number' => $patient->phone_number,
                    'email_verified' => false,
                    'phone_verified' => false
                ]
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred during registration'
            ], 500);
        }
    }

    /**
     * Verify patient's email
     */
    public function verifyEmail(string $token): JsonResponse
    {
        $patient = Patient::where('email_verification_token', $token)
            ->whereNull('email_verified_at')
            ->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token'
            ], 400);
        }

        $patient->email_verified_at = now();
        $patient->email_verification_token = null;
        $patient->save();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Verify patient's phone number
     */
    public function verifyPhone(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:patients,email',
            'code' => 'required|string|size:6'
        ]);

        $patient = Patient::where('email', $validated['email'])
            ->where('phone_verification_code', $validated['code'])
            ->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code'
            ], 400);
        }

        if (!$patient->isPhoneVerificationCodeValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired or too many attempts'
            ], 400);
        }

        $patient->phone_verified = true;
        $patient->phone_verification_code = null;
        $patient->phone_verification_code_expires_at = null;
        $patient->phone_verification_attempts = 0;
        $patient->save();

        return response()->json([
            'success' => true,
            'message' => 'Phone number verified successfully'
        ]);
    }
}
