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
            // Make day_of_week nullable to support specific date availability
            $table->string('day_of_week')->nullable()->change();
            
            // Add check constraint to ensure either day_of_week or specific_date is set
            // Note: MySQL doesn't support check constraints, so we'll handle this in the application logic
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('provider_availabilities', function (Blueprint $table) {
            // Make day_of_week required again
            $table->string('day_of_week')->nullable(false)->change();
        });
    }
};
