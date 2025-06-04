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
        'nombre_envio',
        'apellidos_envio',
        'direccion_envio',
        'ciudad_envio',
        'codigo_postal_envio',
        'pais_envio',
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
