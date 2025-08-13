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

    /**
     * Get patient profile
     */
    public function profile(): JsonResponse
    {
        try {
            $patient = auth()->user();
            
            return response()->json([
                'success' => true,
                'message' => 'Profile retrieved successfully',
                'data' => $patient
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile'
            ], 500);
        }
    }

    /**
     * Get all available providers
     */
    public function getProviders(): JsonResponse
    {
        try {
            $providers = \App\Models\Provider::where('is_active', true)
                ->where('verification_status', 'verified')
                ->select('id', 'first_name', 'last_name', 'specialization', 'years_of_experience')
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Providers retrieved successfully',
                'data' => $providers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve providers'
            ], 500);
        }
    }

    /**
     * Get available slots for a specific provider on a specific date
     */
    public function getProviderAvailableSlots($providerId, \Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $date = $request->input('date');
            
            if (!$date) {
                return response()->json([
                    'success' => false,
                    'message' => 'Date is required'
                ], 400);
            }
            
            // Get the day of week for the selected date
            $dayOfWeek = strtolower(date('l', strtotime($date)));
            
            // Get availability for this specific date and day of week
            $availabilities = \App\Models\ProviderAvailability::where('provider_id', $providerId)
                ->where(function($query) use ($date, $dayOfWeek) {
                    $query->where(function($q) use ($dayOfWeek) {
                        $q->where('availability_type', 'weekly')
                          ->where('day_of_week', $dayOfWeek)
                          ->where('is_available', true);
                    })->orWhere(function($q) use ($date) {
                        $q->where('availability_type', 'specific_date')
                          ->where('specific_date', $date)
                          ->where('is_available', true);
                    });
                })
                ->get();
            
            if ($availabilities->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No availability for this date',
                    'data' => []
                ]);
            }
            
            // Get existing appointments for this date to block booked slots
            $existingAppointments = \App\Models\Appointment::where('provider_id', $providerId)
                ->whereDate('episode_date', $date)
                ->get();
            
            $bookedTimes = $existingAppointments->pluck('episode_details')->toArray();
            
            // Generate available time slots (30-minute intervals)
            $availableSlots = [];
            
            foreach ($availabilities as $availability) {
                $startTime = $availability->start_time;
                $endTime = $availability->end_time;
                
                // Handle both time strings and datetime objects
                $startTimeStr = is_string($startTime) ? $startTime : $startTime->format('H:i:s');
                $endTimeStr = is_string($endTime) ? $endTime : $endTime->format('H:i:s');
                
                $startMinutes = $this->timeToMinutes($startTimeStr);
                $endMinutes = $this->timeToMinutes($endTimeStr);
                
                // Generate 30-minute slots
                for ($time = $startMinutes; $time < $endMinutes; $time += 30) {
                    $slotTime = $this->minutesToTime($time);
                    $slotTimeFormatted = $this->formatTimeForDisplay($slotTime);
                    
                    // Check if this slot is already booked
                    $isBooked = in_array($slotTimeFormatted, $bookedTimes);
                    
                    if (!$isBooked) {
                        $availableSlots[] = [
                            'time' => $slotTime,
                            'display_time' => $slotTimeFormatted,
                            'available' => true
                        ];
                    } else {
                        $availableSlots[] = [
                            'time' => $slotTime,
                            'display_time' => $slotTimeFormatted,
                            'available' => false
                        ];
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Available slots retrieved successfully',
                'data' => $availableSlots
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get available slots'
            ], 500);
        }
    }

    /**
     * Book an appointment
     */
    public function bookAppointment(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $patient = auth()->user();
            
            $validated = $request->validate([
                'provider_id' => 'required|exists:providers,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
                'episode_details' => 'required|string|max:1000',
                'vitals' => 'nullable|string|max:500',
                'episode_occur_date' => 'required|date|before_or_equal:today',
            ]);
            
            // Check if the slot is still available
            $dayOfWeek = strtolower(date('l', strtotime($validated['appointment_date'])));
            
            $availability = \App\Models\ProviderAvailability::where('provider_id', $validated['provider_id'])
                ->where(function($query) use ($validated, $dayOfWeek) {
                    $query->where(function($q) use ($dayOfWeek) {
                        $q->where('availability_type', 'weekly')
                          ->where('day_of_week', $dayOfWeek)
                          ->where('is_available', true);
                    })->orWhere(function($q) use ($validated) {
                        $q->where('availability_type', 'specific_date')
                          ->where('specific_date', $validated['appointment_date'])
                          ->where('is_available', true);
                    });
                })
                ->first();
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected time slot is not available'
                ], 400);
            }
            
            // Check if slot is already booked
            $existingAppointment = \App\Models\Appointment::where('provider_id', $validated['provider_id'])
                ->whereDate('episode_date', $validated['appointment_date'])
                ->where('episode_details', $validated['appointment_time'])
                ->first();
            
            if ($existingAppointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected time slot is already booked'
                ], 400);
            }
            
            // Create the appointment
            $appointment = \App\Models\Appointment::create([
                'provider_id' => $validated['provider_id'],
                'patient_id' => $patient->id,
                'episode_date' => $validated['appointment_date'],
                'episode_details' => $validated['appointment_time'],
                'episode_type' => 'consultation',
                'status' => 'scheduled',
                'notes' => $validated['episode_details'],
                'uuid' => \Illuminate\Support\Str::uuid(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'data' => $appointment
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to book appointment'
            ], 500);
        }
    }

    /**
     * Get patient appointments
     */
    public function getAppointments(): JsonResponse
    {
        try {
            $patient = auth()->user();
            
            $appointments = \App\Models\Appointment::where('patient_id', $patient->id)
                ->with('provider:id,first_name,last_name,specialization')
                ->orderBy('episode_date', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Appointments retrieved successfully',
                'data' => $appointments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve appointments'
            ], 500);
        }
    }

    /**
     * Convert time string to minutes.
     */
    private function timeToMinutes($time)
    {
        $parts = explode(':', $time);
        return intval($parts[0]) * 60 + intval($parts[1]);
    }
    
    /**
     * Convert minutes to time string.
     */
    private function minutesToTime($minutes)
    {
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        return sprintf('%02d:%02d:00', $hours, $mins);
    }
    
    /**
     * Format time for display (12-hour format).
     */
    private function formatTimeForDisplay($time)
    {
        $dateTime = new \DateTime($time);
        return $dateTime->format('g:i A');
    }
}
