<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengiriman extends Model
{
    protected $table = 'pengiriman';

    protected $primaryKey = 'id_pengiriman';


    protected $fillable = [
        'id_pesanan',
        'kurir',
        'no_resi',
        'status_pengiriman',
        'tanggal_kirim',
        'tanggal_terima'
    ];


    public function pesanan()
    {
        return $this->belongsTo(
            Pesanan::class,
            'id_pesanan'
        );
    }
}