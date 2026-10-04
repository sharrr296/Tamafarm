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
}
