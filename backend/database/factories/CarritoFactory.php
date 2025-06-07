<?php

namespace Database\Factories;

use App\Models\Carrito;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarritoFactory extends Factory
{
    protected $model = Carrito::class;

    public function definition()
    {
        return [
            'id_usuario' => Usuario::factory(),
            'estado' => $this->faker->randomElement(['activo', 'completado']),
            'total' => $this->faker->randomFloat(2, 0, 1000),
        ];
    }

    public function activo()
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'activo',
        ]);
    }

    public function completado()
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'completado',
        ]);
    }
}