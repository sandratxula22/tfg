<?php

namespace Database\Factories;

use App\Models\Pedido;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class PedidoFactory extends Factory
{
    protected $model = Pedido::class;

    public function definition()
    {
        return [
            'id_usuario' => Usuario::factory(),
            'estado' => $this->faker->randomElement(['pagado', 'pendiente_paypal', 'cancelado']),
            'total' => $this->faker->randomFloat(2, 10, 500),
            'nombre_envio' => $this->faker->firstName,
            'apellidos_envio' => $this->faker->lastName,
            'direccion_envio' => $this->faker->address,
            'ciudad_envio' => $this->faker->city,
            'codigo_postal_envio' => $this->faker->postcode,
            'pais_envio' => $this->faker->countryCode,
            'payment_id' => $this->faker->uuid,
        ];
    }

    public function pagado()
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'pagado',
        ]);
    }

    public function pendientePaypal()
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'pendiente_paypal',
        ]);
    }

    public function cancelado()
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'cancelado',
        ]);
    }
}