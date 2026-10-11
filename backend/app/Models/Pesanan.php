<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    protected $table='pesanan';

    protected $primaryKey='id_pesanan';


    protected $fillable=[
        'kode_pesanan',
        'id_pelanggan',
        'tanggal',
        'status_pesanan',
        'total',
        'catatan'
    ];


    public function pelanggan()
    {
        return $this->belongsTo(
            Pelanggan::class,
            'id_pelanggan'
        );
    }


    public function detail()
    {
        return $this->hasMany(
            DetailPesanan::class,
            'id_pesanan'
        );
    }


    public function pembayaran()
    {
        return $this->hasOne(
            Pembayaran::class,
            'id_pesanan'
        );
    }


    public function pengiriman()
    {
        return $this->hasOne(
            Pengiriman::class,
            'id_pesanan'
        );
    }
}