<?php

namespace Database\Factories; 

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->firstName,
            'apellido' => $this->faker->lastName,
            'direccion' => $this->faker->address,
            'correo' => $this->faker->unique()->safeEmail,
            'contrasena' => Hash::make('password'), 
            'rol' => $this->faker->randomElement(['usuario', 'admin']),
        ];
    }


    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'correo_verified_at' => null,
        ]);
    }
}