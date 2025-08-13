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
            // Add specific date availability support
            $table->date('specific_date')->nullable()->after('day_of_week');
            $table->enum('availability_type', ['weekly', 'specific_date'])->default('weekly')->after('specific_date');
            
            // Add index for better performance
            $table->index(['provider_id', 'availability_type']);
            $table->index(['specific_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('provider_availabilities', function (Blueprint $table) {
            // Drop specific date availability columns
            $table->dropIndex(['provider_id', 'availability_type']);
            $table->dropIndex(['specific_date']);
            $table->dropColumn(['specific_date', 'availability_type']);
        });
    }
};
