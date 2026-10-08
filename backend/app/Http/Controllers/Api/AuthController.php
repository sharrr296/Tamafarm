<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate(['username'=>'required|string','password'=>'required']);
        $user = User::where('username', $data['username'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['success'=>false,'message'=>'Username atau password salah'], 401);
        }
        return response()->json(['success'=>true,'message'=>'Login berhasil','data'=>[
            'token' => $user->createToken('auth')->plainTextToken,
            'user'  => $user,
        ]]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success'=>true,'message'=>'Logout berhasil']);
    }

    public function me(Request $request)
    {
        return response()->json(['success'=>true,'data'=>$request->user()]);
    }
    public function ubahPassword(Request $request)
    {
        $data = $request->validate([
            'password_lama' => 'required|string',
            'password_baru' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($data['password_lama'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password lama salah',
                'errors'  => ['password_lama' => ['Password lama salah']],
            ], 422);
        }

        $user->update(['password' => $data['password_baru']]); // otomatis di-hash

        // Perangkat lain dikeluarkan, perangkat yang sedang dipakai tetap login
        $user->tokens()
            ->where('id', '!=', $user->currentAccessToken()->id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Password diperbarui']);
    }
}
