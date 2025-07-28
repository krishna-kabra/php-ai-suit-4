<?php

namespace App\Http\Controllers;

use App\Models\AppointmentSlot;
use App\Models\ProviderAvailability;
use App\Services\SlotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProviderAvailabilityController extends Controller
{
    public function store(Request $request)
    {
        // $user = auth()->id();
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'timezone' => 'required|string',
            'slot_duration' => 'required|integer|min:5',
            'break_duration' => 'nullable|integer',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|in:daily,weekly,monthly',
            'recurrence_end_date' => 'nullable|date|after:date',
            'appointment_type' => 'required|string',
            'location' => 'required|array',
            'pricing' => 'nullable|array',
            'special_requirements' => 'nullable|array',
            'notes' => 'nullable|string|max:500',
        ]);
        $availability = ProviderAvailability::create($validated);

        // Generate slots
        $slots = SlotService::generateSlots($availability);

        return response()->json([
            'success' => true,
            'message' => 'Availability slots created successfully',
            'data' => [
                'availability_id' => $availability->id,
                'slots_created' => count($slots),
            ]
        ], 201);
    }

    public function index($id)
    {
        $appointments = AppointmentSlot::where('provider_id', $id)->with('provider')->get();

        return response()->json([
            'success' => true,
            'appointments' => $appointments,
        ]);
    }
}
