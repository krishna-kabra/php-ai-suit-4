<?php

namespace App\Http\Controllers;

use App\Models\Specialization;
use Illuminate\Http\Request;

class SpecializationController extends Controller
{
    
    public function index()
    {
        // Fetch all specializations from the database
        $specializations = Specialization::all();

        return response()->json([
            'success' => true,
            'data' => $specializations
        ]);
    }
}
