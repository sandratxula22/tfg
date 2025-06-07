<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Libro extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'autor',
        'descripcion',
        'precio',
        'imagen_portada',
        'disponible',
        'genero',
    ];

    public function imagenesAdicionales(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    public function estaReservado()
    {
        return $this->carritoDetalles()->where('reservado_hasta', '>', now())->exists();
    }

    public function carritoDetalles()
    {
        return $this->hasMany(Carrito_detalle::class, 'id_libro');
    }

    public function pedidoDetalles()
    {
        return $this->hasMany(Pedido_detalle::class, 'id_libro');
    }
}
