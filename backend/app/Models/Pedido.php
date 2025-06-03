<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'fecha',
        'estado',
        'total',
        'id_usuario',
    ];

    public function detalles()
    {
        return $this->hasMany(Pedido_detalle::class, 'id_pedido');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
