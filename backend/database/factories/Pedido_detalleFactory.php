<?php

namespace Database\Factories;

use App\Models\Pedido_detalle;
use App\Models\Pedido;
use App\Models\Libro;
use Illuminate\Database\Eloquent\Factories\Factory;

class Pedido_detalleFactory extends Factory
{
    protected $model = Pedido_detalle::class;

    public function definition()
    {
        return [
            'id_pedido' => Pedido::factory(),
            'id_libro' => Libro::factory(),
            'precio' => $this->faker->randomFloat(2, 5, 50),
        ];
    }
}