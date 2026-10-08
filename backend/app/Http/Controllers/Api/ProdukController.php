<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProdukLobster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProdukController extends Controller
{
    private function rules(): array
    {
        return [
            'id_kategori'     => 'required|exists:kategori,id_kategori',
            'nama_produk'     => 'required|string|max:100',
            'satuan'          => 'required|in:kg,paket',
            'deskripsi'       => 'nullable|string',
            'ukuran'          => 'nullable|string|max:50',
            'harga'           => 'required|integer|min:0',
            'harga_usd'       => 'nullable|numeric|min:0',
            'stok'            => 'required|numeric|min:0',
            'moq_restoran'    => 'required_if:satuan,kg|nullable|numeric|min:1',
            'moq_luar_negeri' => 'required_if:satuan,kg|nullable|numeric|min:1',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',        ];
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => ProdukLobster::with('kategori')->latest()->get(),
        ]);
    }

    public function show(ProdukLobster $produk)
    {
        return response()->json([
            'success' => true,
            'data' => $produk->load('kategori'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        if ($data['satuan'] === 'paket') {
            $data['moq_restoran'] = null;
            $data['moq_luar_negeri'] = null;
            $data['harga_usd'] = null;
        }
        if ($request->hasFile('gambar')) {
            $data['gambar'] = $request->file('gambar')->store('produk', 'public');
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk ditambahkan',
            'data'    => ProdukLobster::create($data),
        ], 201);
    }

    public function update(Request $request, ProdukLobster $produk)
    {
        $data = $request->validate($this->rules());
        if ($data['satuan'] === 'paket') {
            $data['moq_restoran'] = null;
            $data['moq_luar_negeri'] = null;
            $data['harga_usd'] = null;
        }
        if ($request->hasFile('gambar')) {
            if ($produk->gambar) {
                Storage::disk('public')->delete($produk->gambar);
            }
            $data['gambar'] = $request->file('gambar')->store('produk', 'public');
        } else {
            unset($data['gambar']); // tanpa file baru, gambar lama tetap
        }

        $produk->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Produk diperbarui',
            'data'    => $produk,
        ]);
    }

    public function destroy(ProdukLobster $produk)
    {
        if ($produk->gambar) {
            Storage::disk('public')->delete($produk->gambar);
        }

        $produk->delete();

        return response()->json(['success' => true, 'message' => 'Produk dihapus']);
    }
}