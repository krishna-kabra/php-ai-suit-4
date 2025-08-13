<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProviderRegistrationRequest;
use App\Models\Provider;
use App\Models\ProviderAvailability;
use App\Models\Appointment;
use App\Models\Patient;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

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

    /**
     * Get provider profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        try {
            $provider = auth()->user();
            
            return response()->json([
                'success' => true,
                'message' => 'Profile retrieved successfully',
                'data' => $provider
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get provider profile', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get profile'
            ], 500);
        }
    }

    /**
     * Update provider profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        try {
            $provider = auth()->user();
            
            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:providers,email,' . $provider->id,
                'phone' => 'sometimes|string|max:20',
                'specialization' => 'sometimes|string|max:255',
                'license_number' => 'sometimes|string|max:255',
                'experience_years' => 'sometimes|integer|min:0',
                'bio' => 'sometimes|string|max:1000',
            ]);
            
            $provider->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $provider
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update provider profile', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile'
            ], 500);
        }
    }

    /**
     * Get provider availabilities.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailabilities()
    {
        try {
            $provider = auth()->user();
            $availabilities = ProviderAvailability::where('provider_id', $provider->id)->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Availabilities retrieved successfully',
                'data' => $availabilities
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get provider availabilities', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get availabilities'
            ], 500);
        }
    }

    /**
     * Create provider availability.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createAvailability(Request $request)
    {
        try {
            $provider = auth()->user();
            
            $validated = $request->validate([
                'time_zone' => 'required|string|max:50',
                'day_wise_availability' => 'sometimes|array',
                'day_wise_availability.*.day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'day_wise_availability.*.from_time' => 'required|string',
                'day_wise_availability.*.to_time' => 'required|string',
                'day_wise_availability.*.is_available' => 'required|boolean',
                'specific_date_availability' => 'sometimes|array',
                'specific_date_availability.*.date' => 'required|date|after_or_equal:today',
                'specific_date_availability.*.from_time' => 'required|string',
                'specific_date_availability.*.to_time' => 'required|string',
                'specific_date_availability.*.is_available' => 'required|boolean',
                'block_days' => 'sometimes|array',
                'block_days.*.date' => 'required|date',
                'block_days.*.from_time' => 'required|string',
                'block_days.*.to_time' => 'required|string',
            ]);
            
            // Delete existing availabilities for this provider
            ProviderAvailability::where('provider_id', $provider->id)->delete();
            
            // Create weekly recurring availabilities
            if (isset($validated['day_wise_availability'])) {
                foreach ($validated['day_wise_availability'] as $availability) {
                    ProviderAvailability::create([
                        'provider_id' => $provider->id,
                        'day_of_week' => $availability['day'],
                        'specific_date' => null,
                        'availability_type' => 'weekly',
                        'start_time' => $availability['from_time'],
                        'end_time' => $availability['to_time'],
                        'is_available' => $availability['is_available'],
                        'time_zone' => $validated['time_zone'],
                    ]);
                }
            }
            
            // Create specific date availabilities
            if (isset($validated['specific_date_availability'])) {
                foreach ($validated['specific_date_availability'] as $availability) {
                    ProviderAvailability::create([
                        'provider_id' => $provider->id,
                        'day_of_week' => null,
                        'specific_date' => $availability['date'],
                        'availability_type' => 'specific_date',
                        'start_time' => $availability['from_time'],
                        'end_time' => $availability['to_time'],
                        'is_available' => $availability['is_available'],
                        'time_zone' => $validated['time_zone'],
                    ]);
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Availability created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create provider availability', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create availability'
            ], 500);
        }
    }

    /**
     * Update provider availability.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAvailability(Request $request, $id)
    {
        try {
            $provider = auth()->user();
            $availability = ProviderAvailability::where('id', $id)
                ->where('provider_id', $provider->id)
                ->first();
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability not found'
                ], 404);
            }
            
            $validated = $request->validate([
                'day_of_week' => 'sometimes|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'sometimes|string',
                'end_time' => 'sometimes|string',
                'is_available' => 'sometimes|boolean',
                'time_zone' => 'sometimes|string|max:50',
            ]);
            
            $availability->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Availability updated successfully',
                'data' => $availability
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update provider availability', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id(),
                'availability_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability'
            ], 500);
        }
    }

    /**
     * Delete provider availability.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAvailability($id)
    {
        try {
            $provider = auth()->user();
            $availability = ProviderAvailability::where('id', $id)
                ->where('provider_id', $provider->id)
                ->first();
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability not found'
                ], 404);
            }
            
            $availability->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Availability deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete provider availability', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id(),
                'availability_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete availability'
            ], 500);
        }
    }

    /**
     * Get provider appointments.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function appointments()
    {
        try {
            $provider = auth()->user();
            $appointments = Appointment::where('provider_id', $provider->id)
                ->with('patient')
                ->orderBy('episode_date', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Appointments retrieved successfully',
                'data' => $appointments
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get provider appointments', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get appointments'
            ], 500);
        }
    }

    /**
     * Get specific appointment.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showAppointment($id)
    {
        try {
            $provider = auth()->user();
            $appointment = Appointment::where('provider_id', $provider->id)
                ->with('patient')
                ->find($id);
            
            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment retrieved successfully',
                'data' => $appointment
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get provider appointment', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id(),
                'appointment_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get appointment'
            ], 500);
        }
    }

    /**
     * Create appointment.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createAppointment(Request $request)
    {
        try {
            $provider = auth()->user();
            
            $validated = $request->validate([
                'patient_name' => 'required|string|max:255',
                'patient_email' => 'required|email|max:255',
                'patient_phone' => 'required|string|max:20',
                'appointment_date' => 'required|date|after:today',
                'appointment_time' => 'required|string',
                'appointment_type' => 'required|string|in:consultation,follow_up,check_up,emergency',
                'notes' => 'nullable|string|max:1000'
            ]);
            
            // Check if patient exists or create new one
            $patient = Patient::where('email', $validated['patient_email'])->first();
            
            if (!$patient) {
                // Create a basic patient record with all required fields
                $patient = Patient::create([
                    'first_name' => explode(' ', $validated['patient_name'])[0],
                    'last_name' => explode(' ', $validated['patient_name'], 2)[1] ?? '',
                    'email' => $validated['patient_email'],
                    'phone_number' => $validated['patient_phone'],
                    'password' => Hash::make('temp123'), // Temporary password
                    'date_of_birth' => '1990-01-01', // Default date of birth
                    'gender' => 'prefer_not_to_say', // Default gender
                    'address' => [], // Empty JSON object for address
                    'emergency_contact' => [], // Empty JSON object
                    'medical_history' => [], // Empty JSON object
                    'insurance_info' => [], // Empty JSON object
                    'email_verified_at' => now(), // Auto-verify for provider-created patients
                    'is_active' => true
                ]);
            }
            
            // Create appointment using correct column names
            $appointment = Appointment::create([
                'provider_id' => $provider->id,
                'patient_id' => $patient->id,
                'appointment_slot_id' => null, // No slot required for provider-created appointments
                'episode_date' => $validated['appointment_date'], // Use correct column name
                'episode_type' => $validated['appointment_type'], // Use correct column name
                'episode_details' => $validated['appointment_time'], // Store time in details
                'status' => 'scheduled',
                'notes' => $validated['notes'] ?? null
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment created successfully',
                'data' => $appointment->load('patient')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create appointment', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment'
            ], 500);
        }
    }

    /**
     * Update appointment status.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAppointmentStatus(Request $request, $id)
    {
        try {
            $provider = auth()->user();
            $appointment = Appointment::where('provider_id', $provider->id)->find($id);
            
            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment not found'
                ], 404);
            }
            
            $validated = $request->validate([
                'status' => 'required|string|in:scheduled,confirmed,cancelled,completed,no_show'
            ]);
            
            $appointment->update(['status' => $validated['status']]);
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully',
                'data' => $appointment
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update appointment status', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id(),
                'appointment_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment status'
            ], 500);
        }
    }

    /**
     * Complete an appointment with evaluation details
     */
    public function completeAppointment(Request $request, $id): JsonResponse
    {
        try {
            $provider = auth()->user();
            
            $validated = $request->validate([
                'evaluation_notes' => 'required|string|max:2000',
                'diagnosis' => 'required|string|max:500',
                'treatment_plan' => 'required|string|max:1000',
                'prescriptions' => 'nullable|array',
                'prescriptions.*.medication' => 'required_with:prescriptions|string|max:200',
                'prescriptions.*.dosage' => 'required_with:prescriptions|string|max:100',
                'prescriptions.*.instructions' => 'required_with:prescriptions|string|max:300',
                'follow_up_date' => 'nullable|date|after:today',
                'vital_signs' => 'nullable|array',
                'vital_signs.blood_pressure' => 'nullable|string|max:50',
                'vital_signs.heart_rate' => 'nullable|string|max:50',
                'vital_signs.temperature' => 'nullable|string|max:50',
                'vital_signs.weight' => 'nullable|string|max:50',
                'vital_signs.height' => 'nullable|string|max:50',
                'next_appointment_date' => 'nullable|date|after:today',
            ]);
            
            // Find the appointment
            $appointment = Appointment::where('id', $id)
                ->where('provider_id', $provider->id)
                ->first();
            
            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment not found'
                ], 404);
            }
            
            if ($appointment->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment is already completed'
                ], 400);
            }
            
            // Update appointment with evaluation details
            $appointment->update([
                'status' => 'completed',
                'evaluation_notes' => $validated['evaluation_notes'],
                'diagnosis' => $validated['diagnosis'],
                'treatment_plan' => $validated['treatment_plan'],
                'prescriptions' => $validated['prescriptions'] ?? [],
                'follow_up_date' => $validated['follow_up_date'],
                'vital_signs' => $validated['vital_signs'] ?? [],
                'next_appointment_date' => $validated['next_appointment_date'],
                'completed_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment completed successfully',
                'data' => $appointment
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to complete appointment', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id(),
                'appointment_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete appointment'
            ], 500);
        }
    }

    /**
     * Get available time slots for a specific date.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableSlots(Request $request)
    {
        try {
            $provider = auth()->user();
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
            $availabilities = ProviderAvailability::where('provider_id', $provider->id)
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
            $existingAppointments = Appointment::where('provider_id', $provider->id)
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
            Log::error('Failed to get available slots', [
                'error' => $e->getMessage(),
                'provider_id' => auth()->id(),
                'date' => $request->input('date')
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get available slots'
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
