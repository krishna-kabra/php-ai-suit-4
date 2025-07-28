<?php

namespace App\Services;

use App\Models\ProviderAvailability;
use App\Models\AppointmentSlot;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class SlotService
{
    public static function generateSlots(ProviderAvailability $availability)
    {
        $slots = [];

        $start = Carbon::parse($availability->start_time, $availability->timezone);
        $end = Carbon::parse($availability->end_time, $availability->timezone);
        $date = Carbon::parse($availability->date);

        // Recurrence dates
        $dates = $availability->is_recurring
            ? self::getRecurrenceDates($date, $availability->recurrence_end_date, $availability->recurrence_pattern)
            : [$date];

        foreach ($dates as $slotDate) {
            $time = $start->copy();
            while ($time->lt($end)) {
                $slotEnd = $time->copy()->addMinutes($availability->slot_duration);
                if ($slotEnd->gt($end)) break;

                $slots[] = AppointmentSlot::create([
                    'availability_id' => $availability->id,
                    'provider_id' => $availability->provider_id,
                    'slot_start_time' => $slotDate->copy()->setTimeFrom($time)->setTimezone('UTC'),
                    'slot_end_time' => $slotDate->copy()->setTimeFrom($slotEnd)->setTimezone('UTC'),
                    'appointment_type' => $availability->appointment_type,
                ]);

                $time = $slotEnd->addMinutes($availability->break_duration);
            }
        }

        return $slots;
    }

    private static function getRecurrenceDates($start, $end, $pattern)
    {
        $interval = match ($pattern) {
            'daily' => '1 day',
            'weekly' => '1 week',
            'monthly' => '1 month',
        };

        return CarbonPeriod::create($start, $interval, $end)->toArray();
    }
}
