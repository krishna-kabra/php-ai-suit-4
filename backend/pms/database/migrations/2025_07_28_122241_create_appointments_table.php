<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->uuid('uuid')->unique(); // Public identifier

            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('providers')->onDelete('cascade');
            $table->foreignId('appointment_slot_id')->nullable()->constrained('appointment_slots')->onDelete('set null');

            $table->date('episode_date');
            $table->string('episode_type')->nullable();
            $table->text('episode_details')->nullable();
            $table->json('vitals')->nullable();

            $table->string('status')->default('scheduled');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};

