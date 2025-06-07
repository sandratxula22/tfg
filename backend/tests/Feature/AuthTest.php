<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    public function test_user_can_register()
    {
        $userData = [
            'nombre' => $this->faker->name,
            'apellido' => $this->faker->lastName,
            'direccion' => $this->faker->address,
            'correo' => $this->faker->unique()->safeEmail,
            'contrasena' => 'password123',
            'rol' => 'usuario',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'access_token',
                'token_type',
            ]);

        $this->assertDatabaseHas('usuarios', [
            'correo' => $userData['correo'],
            'rol' => 'usuario',
        ]);
    }

    public function test_user_can_login()
    {
        
        $user = Usuario::factory()->create([
            'correo' => 'test@example.com',
            'contrasena' => Hash::make('password'),
            'rol' => 'usuario',
        ]);

        $response = $this->postJson('/api/login', [
            'correo' => 'test@example.com',
            'contrasena' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'rol'
            ]);
    }
}
