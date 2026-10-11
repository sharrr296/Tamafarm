<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $primaryKey = 'id_pembayaran';


    protected $fillable = [
        'id_pesanan',
        'jenis',
        'metode',
        'mata_uang',
        'jumlah',
        'kurs',
        'status_bayar',
        'id_transaksi',
        'waktu_bayar'
    ];


    public function pesanan()
    {
        return $this->belongsTo(
            Pesanan::class,
            'id_pesanan'
        );
    }
}