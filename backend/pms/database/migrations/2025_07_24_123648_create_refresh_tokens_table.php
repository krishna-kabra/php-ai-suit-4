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
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id(); // UUID for token
            $table->unsignedBigInteger('provider_id');
            $table->foreign('provider_id')->references('id')->on('providers')->onDelete('cascade');
            $table->string('token_hash');
            $table->timestamp('expires_at');
            $table->timestamps();

            // $table->foreign('provider_id')->references('id')->on('providers')->onDelete('cascade');
        });
        // Add index for faster lookups
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->index('provider_id');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
    }
};
