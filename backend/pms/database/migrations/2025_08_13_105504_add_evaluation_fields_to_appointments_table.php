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
        Schema::table('appointments', function (Blueprint $table) {
            $table->text('evaluation_notes')->nullable()->after('notes');
            $table->string('diagnosis', 500)->nullable()->after('evaluation_notes');
            $table->text('treatment_plan')->nullable()->after('diagnosis');
            $table->json('prescriptions')->nullable()->after('treatment_plan');
            $table->date('follow_up_date')->nullable()->after('prescriptions');
            $table->json('vital_signs')->nullable()->after('follow_up_date');
            $table->date('next_appointment_date')->nullable()->after('vital_signs');
            $table->timestamp('completed_at')->nullable()->after('next_appointment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'evaluation_notes',
                'diagnosis',
                'treatment_plan',
                'prescriptions',
                'follow_up_date',
                'vital_signs',
                'next_appointment_date',
                'completed_at'
            ]);
        });
    }
};
