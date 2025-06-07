<?php

namespace Tests\Feature;

use App\Models\Carrito;
use App\Models\Carrito_detalle;
use App\Models\Libro;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Carbon\Carbon;

class CarritoTest extends TestCase
{
    use RefreshDatabase; 

    protected function authenticateUser($role = 'usuario')
    {
        $user = Usuario::factory()->create([
            'contrasena' => Hash::make('password'),
            'rol' => $role,
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function test_user_can_add_book_to_cart_and_it_is_reserved()
    {
        $auth = $this->authenticateUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $libro = Libro::factory()->create([
            'disponible' => true,
            'precio' => 15.50
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/carrito/add', [
                             'id_libro' => $libro->id,
                             'precio' => $libro->precio,
                         ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'message' => 'Libro añadido y reservado',
                 ]);

        $this->assertDatabaseHas('carritos', [
            'id_usuario' => $user->id,
            'estado' => 'activo',
        ]);

        $carrito = Carrito::where('id_usuario', $user->id)->first();
        $this->assertNotNull($carrito);

        $this->assertDatabaseHas('carrito_detalles', [
            'id_carrito' => $carrito->id,
            'id_libro' => $libro->id,
            'precio' => $libro->precio,
        ]);

        $detalle = Carrito_detalle::where('id_carrito', $carrito->id)
                                    ->where('id_libro', $libro->id)
                                    ->first();
        $this->assertNotNull($detalle->reservado_hasta);
        $this->assertTrue(Carbon::parse($detalle->reservado_hasta)->isFuture());
    }

    public function test_user_cannot_add_unavailable_book_to_cart()
    {
        $auth = $this->authenticateUser();
        $token = $auth['token'];

        $libro = Libro::factory()->create([
            'disponible' => false,
            'precio' => 10.00
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/carrito/add', [
                             'id_libro' => $libro->id,
                             'precio' => $libro->precio,
                         ]);

        $response->assertStatus(409)
                 ->assertJson([
                     'message' => 'Este libro no está disponible para la compra en este momento.',
                 ]);

        $this->assertDatabaseMissing('carrito_detalles', [
            'id_libro' => $libro->id,
        ]);
    }

    public function test_user_can_view_their_cart()
    {
        $auth = $this->authenticateUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $libro1 = Libro::factory()->create(['disponible' => true, 'precio' => 10.00]);
        $libro2 = Libro::factory()->create(['disponible' => true, 'precio' => 20.00]);

        $carrito = Carrito::create(['id_usuario' => $user->id, 'estado' => 'activo', 'total' => 30.00]);
        Carrito_detalle::create(['id_carrito' => $carrito->id, 'id_libro' => $libro1->id, 'precio' => $libro1->precio, 'reservado_hasta' => now()->addMinutes(15)]);
        Carrito_detalle::create(['id_carrito' => $carrito->id, 'id_libro' => $libro2->id, 'precio' => $libro2->precio, 'reservado_hasta' => now()->addMinutes(15)]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/carrito');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'detalles')
                 ->assertJsonStructure([
                     'detalles' => [
                         '*' => [
                             'id',
                             'precio',
                             'id_carrito',
                             'id_libro',
                             'reservado_hasta',
                             'libro' => ['id', 'titulo', 'autor', 'precio', 'disponible'],
                             'can_be_purchased',
                             'status_message',
                         ]
                     ]
                 ]);
    }

    public function test_user_can_remove_item_from_cart()
    {
        $auth = $this->authenticateUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $libro = Libro::factory()->create(['disponible' => true, 'precio' => 10.00]);
        $carrito = Carrito::create(['id_usuario' => $user->id, 'estado' => 'activo', 'total' => $libro->precio]);
        $detalle = Carrito_detalle::create(['id_carrito' => $carrito->id, 'id_libro' => $libro->id, 'precio' => $libro->precio, 'reservado_hasta' => now()->addMinutes(15)]);

        $this->assertDatabaseHas('carrito_detalles', ['id' => $detalle->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->deleteJson('/api/carrito/remove/' . $detalle->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Libro eliminado del carrito',
                 ]);

        $this->assertDatabaseMissing('carrito_detalles', ['id' => $detalle->id]);

        $carrito->refresh();
        $this->assertEquals(0, $carrito->total);
    }

    public function test_user_can_renew_reservation()
    {
        $auth = $this->authenticateUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $libro = Libro::factory()->create(['disponible' => true, 'precio' => 10.00]);
        $carrito = Carrito::create(['id_usuario' => $user->id, 'estado' => 'activo', 'total' => $libro->precio]);
        $detalle = Carrito_detalle::create(['id_carrito' => $carrito->id, 'id_libro' => $libro->id, 'precio' => $libro->precio, 'reservado_hasta' => now()->subMinutes(30)]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/carrito/renew/' . $detalle->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Reserva renovada con éxito.',
                 ]);

        $detalle->refresh();
        $this->assertTrue(Carbon::parse($detalle->reservado_hasta)->isFuture());
        $this->assertTrue(Carbon::parse($detalle->reservado_hasta)->diffInMinutes(now()) <= 15);
    }
}