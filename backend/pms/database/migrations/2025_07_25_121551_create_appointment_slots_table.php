<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_slots', function (Blueprint $table) {
            $table->id(); // Primary Key

            // Foreign Keys
            $table->unsignedBigInteger('availability_id');
            $table->foreign('availability_id')
                  ->references('id')
                  ->on('provider_availabilities')
                  ->onDelete('cascade');

            $table->unsignedBigInteger('provider_id');
            $table->foreign('provider_id')
                  ->references('id')
                  ->on('providers')
                  ->onDelete('cascade');

            $table->unsignedBigInteger('patient_id')->nullable();
            $table->foreign('patient_id')
                  ->references('id')
                  ->on('patients')
                  ->onDelete('set null');

            // Slot Timing
            $table->timestampTz('slot_start_time');
            $table->timestampTz('slot_end_time');

            // Appointment Info
            $table->enum('status', ['available', 'booked', 'cancelled', 'blocked'])->default('available');
            $table->string('appointment_type');
            $table->string('booking_reference')->unique()->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_slots');
    }
};
