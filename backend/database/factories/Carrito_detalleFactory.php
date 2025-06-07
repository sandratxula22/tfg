<?php

namespace Database\Factories;

use App\Models\Carrito_detalle;
use App\Models\Libro;
use App\Models\Carrito;
use Illuminate\Database\Eloquent\Factories\Factory;

class Carrito_detalleFactory extends Factory
{
    protected $model = Carrito_detalle::class;

    public function definition()
    {
        return [
            'id_carrito' => Carrito::factory(),
            'id_libro' => Libro::factory(),
            'precio' => $this->faker->randomFloat(2, 5, 50),
            'reservado_hasta' => $this->faker->dateTimeBetween('now', '+1 hour'),
        ];
    }
}