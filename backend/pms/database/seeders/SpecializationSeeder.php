<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialization;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = [
            'Cardiology',
            'Dermatology',
            'Pediatrics',
            'Neurology',
            'Orthopedics',
        ];

        foreach ($specializations as $name) {
            Specialization::create(['name' => $name]);
        }
    }
}
