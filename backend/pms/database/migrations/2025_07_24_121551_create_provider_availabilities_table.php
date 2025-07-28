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
        Schema::create('provider_availabilities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('provider_id');
            $table->foreign('provider_id')->references('id')->on('providers')->onDelete('cascade');

            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('timezone');

            $table->boolean('is_recurring')->default(false);
            $table->enum('recurrence_pattern', ['daily', 'weekly', 'monthly'])->nullable();
            $table->date('recurrence_end_date')->nullable();

            $table->integer('slot_duration')->default(30); // in minutes
            $table->integer('break_duration')->default(0); // in minutes

            $table->enum('status', ['available', 'booked', 'cancelled', 'blocked', 'maintenance'])->default('available');
            $table->integer('max_appointments_per_slot')->default(1);
            $table->integer('current_appointments')->default(0);

            $table->enum('appointment_type', ['consultation', 'follow_up', 'emergency', 'telemedicine'])->default('consultation');

            $table->json('location'); // address, coordinates, etc.
            $table->json('pricing')->nullable();
            $table->text('notes')->nullable();
            $table->json('special_requirements')->nullable();

            $table->timestamps();

            // // Foreign key constraint for UUID
            // $table->foreign('provider_id')
            //     ->references('id')->on('providers')
            //     ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_availabilities');
    }
};
