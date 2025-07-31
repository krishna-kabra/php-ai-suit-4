<?php

namespace App\Http\Controllers;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\AppointmentSlot;
use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;


class BookAppoinmentController extends Controller
{
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date', 
        ]);

        $requestedDate = Carbon::parse($request->date)->toDateString(); // '2025-07-28'

        $slots = AppointmentSlot::whereDate('slot_start_time', $requestedDate)
            ->whereNull('patient_id')
            ->where('status', 'available')
            ->with('provider')
            ->get();

        return response()->json(['success' => true, 'slots' => $slots]);
    }

    // Book a slot
    public function bookAppointment(Request $request)
    {
        JWTAuth::parseToken()->authenticate();

        // Now this will work
        $patientId = auth()->id();

        if (!$patientId) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Now you have the patient and can get their ID
        $patientId = auth()->id();
        dd($patientId);
        $request->validate([
            'slot_id' => 'required|exists:appointment_slots,id',
            'episode_details' => 'nullable|string',
            'vitals' => 'nullable|string',
            'episode_occur_date' => 'required|date',
        ]);

        $slot = AppointmentSlot::where('id', $request->slot_id)
            ->whereNull('patient_id')
            ->first();

        if (!$slot) {
            return response()->json(['success' => false, 'message' => 'Slot unavailable'], 400);
        }

        $appointment = Appointment::create([
            'appointment_slot_id' => $slot->id,
            'patient_id' => 1, // Replace with actual auth patient ID
            'provider_id' => $slot->provider_id,
            'episode_details' => $request->episode_details,
            'vitals' => $request->vitals,
            'episode_date' => $request->episode_occur_date,
        ]);

        // Book the slot
        if(isset($appointment)){
            $slot->patient_id = 1; // Replace with actual auth patient ID
            $slot->status = 'booked';
            $slot->save();
        }
        
        return response()->json(['success' => true, 'message' => 'Appointment booked successfully', 'appointment' => $appointment]);
    }
}

