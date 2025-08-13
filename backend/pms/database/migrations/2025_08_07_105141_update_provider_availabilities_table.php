<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('provider_availabilities', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn([
                'date', 'timezone', 'is_recurring', 'recurrence_pattern', 
                'recurrence_end_date', 'slot_duration', 'break_duration', 
                'status', 'max_appointments_per_slot', 'current_appointments', 
                'appointment_type', 'location', 'pricing', 'notes', 
                'special_requirements'
            ]);
            
            // Add new columns
            $table->string('day_of_week')->after('provider_id');
            $table->boolean('is_available')->default(true)->after('end_time');
            $table->string('time_zone', 50)->nullable()->after('is_available');
            $table->date('block_date')->nullable()->after('time_zone');
            $table->time('block_from_time')->nullable()->after('block_date');
            $table->time('block_to_time')->nullable()->after('block_from_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('provider_availabilities', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn([
                'day_of_week', 'is_available', 'time_zone', 
                'block_date', 'block_from_time', 'block_to_time'
            ]);
            
            // Add back old columns
            $table->date('date')->after('provider_id');
            $table->string('timezone')->nullable()->after('end_time');
            $table->boolean('is_recurring')->default(false)->after('timezone');
            $table->string('recurrence_pattern')->nullable()->after('is_recurring');
            $table->date('recurrence_end_date')->nullable()->after('recurrence_pattern');
            $table->integer('slot_duration')->default(30)->after('recurrence_end_date');
            $table->integer('break_duration')->default(0)->after('slot_duration');
            $table->string('status')->default('active')->after('break_duration');
            $table->integer('max_appointments_per_slot')->default(1)->after('status');
            $table->integer('current_appointments')->default(0)->after('max_appointments_per_slot');
            $table->string('appointment_type')->nullable()->after('current_appointments');
            $table->json('location')->nullable()->after('appointment_type');
            $table->json('pricing')->nullable()->after('location');
            $table->text('notes')->nullable()->after('pricing');
            $table->json('special_requirements')->nullable()->after('notes');
        });
    }
};
