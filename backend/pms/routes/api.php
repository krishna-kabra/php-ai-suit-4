<?php

use App\Http\Controllers\Api\V1\Auth\PatientAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProviderController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\Auth\ProviderAuthController;
use App\Http\Controllers\BookAppoinmentController;
use App\Http\Controllers\ProviderAvailabilityController;
use App\Http\Controllers\SpecializationController;


Route::prefix('v1')->group(function () {
    Route::prefix('provider')->group(function () {
        // Public routes
        Route::post('/register', [ProviderController::class, 'register']);
            
        Route::get('/verify-email/{token}', [ProviderController::class, 'verifyEmail'])
            ->name('provider.verify');
        
        Route::post('/login', [ProviderAuthController::class, 'login']);
        Route::get('/specializations', [SpecializationController::class, 'index']);

        Route::post('/refresh', [ProviderAuthController::class, 'refresh']);
        
        // Protected routes
        Route::middleware('auth:api')->group(function () {
            Route::post('/logout', [ProviderAuthController::class, 'logout']);
            Route::post('/logout-all', [ProviderAuthController::class, 'logoutAll']);
            
            // Provider Profile & Availability
            Route::get('/profile', [ProviderController::class, 'profile']);
            Route::put('/profile', [ProviderController::class, 'updateProfile']);
            
            // Availability Management
            Route::get('/availability', [ProviderController::class, 'getAvailabilities']);
            Route::post('/availability', [ProviderController::class, 'createAvailability']);
            Route::put('/availability/{id}', [ProviderController::class, 'updateAvailability']);
            Route::delete('/availability/{id}', [ProviderController::class, 'deleteAvailability']);
            
            // Appointments
            Route::get('/appointments', [ProviderController::class, 'appointments']);
            Route::post('/appointments', [ProviderController::class, 'createAppointment']);
            Route::get('/appointments/{id}', [ProviderController::class, 'showAppointment']);
            Route::put('/appointments/{id}/status', [ProviderController::class, 'updateAppointmentStatus']);
            Route::post('/appointments/{id}/complete', [ProviderController::class, 'completeAppointment']);
            
            // Available Slots for Booking
            Route::get('/available-slots', [ProviderController::class, 'getAvailableSlots']);
        });
    });

    // Patient Routes
    Route::prefix('/patient')->group(function () {
        Route::post('/register', [PatientController::class, 'register']);
        Route::get('/verify-email/{token}', [PatientController::class, 'verifyEmail'])->name('patient.verify');
        Route::post('/login', [PatientAuthController::class, 'login']);
        Route::post('/refresh', [PatientAuthController::class, 'refresh']);

        Route::middleware('auth:patient')->group(function () {
            Route::post('/logout', [PatientAuthController::class, 'logout']);
            Route::post('/logout-all', [PatientAuthController::class, 'logoutAll']);
            
            // Patient Profile & Appointments
            Route::get('/profile', [PatientController::class, 'profile']);
            Route::get('/appointments', [PatientController::class, 'getAppointments']);
            Route::post('/book-appointment', [PatientController::class, 'bookAppointment']);
            Route::get('/providers', [PatientController::class, 'getProviders']);
            Route::get('/providers/{providerId}/available-slots', [PatientController::class, 'getProviderAvailableSlots']);
        });

        Route::post('/verify-phone', [PatientController::class, 'verifyPhone']);
    });
    
    // Route::get('/appointment/slots', [AppointmentController::class, 'getAvailableSlots']);
    
    Route::get('/appointment-slots', [BookAppoinmentController::class, 'getAvailableSlots']);
    Route::post('/book-appointment', [BookAppoinmentController::class, 'bookAppointment']);


});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
