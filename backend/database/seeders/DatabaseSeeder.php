<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'nama'     => 'Pemilik',
            'username' => 'pemilik',
            'password' => 'password',   
            'role'     => 'pemilik',
        ]);

        Kategori::create([
            'nama_kategori' => 'Lobster Hidup',
            'deskripsi'     => 'Lobster hidup dijual per kg',
        ]);
        Kategori::create([
            'nama_kategori' => 'Paket Kemitraan',
            'deskripsi'     => 'Paket Pemula dan Paket Farmer',
        ]);
    }
}
