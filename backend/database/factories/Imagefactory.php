<?php

namespace Database\Factories;

use App\Models\Image;
use App\Models\Libro;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImageFactory extends Factory
{
    protected $model = Image::class;

    public function definition()
    {
        return [
            'id_libro' => Libro::factory(),
            'url' => 'adicionales/' . $this->faker->uuid() . '.jpg',
        ];
    }
}