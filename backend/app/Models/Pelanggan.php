<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pelanggan extends Model
{
    protected $table = 'pelanggan';

    protected $primaryKey = 'id_pelanggan';

    protected $fillable = [
        'nama',
        'no_hp',
        'alamat',
        'negara',
        'tipe_pembeli'
    ];


    public function pesanan()
    {
        return $this->hasMany(
            Pesanan::class,
            'id_pelanggan'
        );
    }


    public function konsultasi()
    {
        return $this->hasMany(
            Konsultasi::class,
            'id_pelanggan'
        );
    }
}