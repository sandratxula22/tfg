<?php

namespace Database\Factories;

use App\Models\Libro;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class LibroFactory extends Factory
{
    protected $model = Libro::class;

    public function definition()
    {
        return [
            'titulo' => $this->faker->sentence(3),
            'autor' => $this->faker->name,
            'descripcion' => $this->faker->paragraph(2),
            'precio' => $this->faker->randomFloat(2, 5, 50),
            'imagen_portada' => 'portadas/default.jpg',
            'disponible' => $this->faker->boolean(90),
            'genero' => $this->faker->randomElement(['Fantasía', 'Ciencia Ficción', 'Terror', 'Romance', 'Historia']),
        ];
    }
}