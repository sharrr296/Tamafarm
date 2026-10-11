<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Konsultasi extends Model
{
    protected $table = 'konsultasi';

    protected $primaryKey = 'id_konsultasi';


    protected $fillable = [
        'id_pelanggan',
        'id_user',
        'pengirim',
        'isi_pesan',
        'waktu_kirim'
    ];


    public function pelanggan()
    {
        return $this->belongsTo(
            Pelanggan::class,
            'id_pelanggan'
        );
    }


    public function user()
    {
        return $this->belongsTo(
            User::class,
            'id_user'
        );
    }
}