<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\ProdukController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Publik
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::get('/produk', [ProdukController::class, 'index']);
Route::get('/produk/{produk}', [ProdukController::class, 'show']);

// Wajib login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/password', [AuthController::class, 'ubahPassword']);
    Route::get('/kategori', [KategoriController::class, 'index']);

    // Admin: kelola kategori & produk
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('kategori', KategoriController::class)->except(['index']);
        Route::apiResource('produk', ProdukController::class)->except(['index', 'show']);
    });

    // Pemilik: kelola akun admin
    Route::middleware('role:pemilik')->group(function () {
        Route::apiResource('admin', UserController::class)
            ->except(['show'])
            ->parameters(['admin' => 'user']);
    });
});