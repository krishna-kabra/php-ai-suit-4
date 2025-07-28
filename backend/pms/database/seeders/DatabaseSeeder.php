<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\SpecializationSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SpecializationSeeder::class,
        ]);
    }
}
