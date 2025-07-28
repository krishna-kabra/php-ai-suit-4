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
        Schema::create('patients', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key

            // Personal Info
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('email')->unique();
            $table->string('phone_number')->unique();
            $table->string('password');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);

            // Additional Info (JSON)
            $table->json('address');
            $table->json('emergency_contact')->nullable();
            $table->json('medical_history')->nullable();
            $table->json('insurance_info')->nullable();

            // Verification and Status
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verification_token')->nullable();
            $table->boolean('phone_verified')->default(false);
            $table->string('phone_verification_code')->nullable();
            $table->timestamp('phone_verification_code_expires_at')->nullable();
            $table->integer('phone_verification_attempts')->default(0);
            $table->boolean('is_active')->default(true);

            // Audit fields
            $table->string('registration_ip')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();

            // Privacy and Marketing
            $table->boolean('marketing_consent')->default(false);
            $table->timestamp('last_terms_accepted_at')->nullable();
            $table->string('data_retention_policy_version')->nullable();

            // Timestamps
            $table->timestamps();

            // Useful Indexes
            $table->index('is_active');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
