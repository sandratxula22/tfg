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
}
