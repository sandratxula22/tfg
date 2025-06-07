<?php

namespace Tests\Feature;

use App\Models\Libro;
use App\Models\Usuario;
use App\Models\Carrito;
use App\Models\Carrito_detalle;
use App\Models\Pedido;
use App\Models\Pedido_detalle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class LibroAdminTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    protected function authenticateUser($role = 'usuario')
    {
        $user = Usuario::factory()->create([
            'contrasena' => Hash::make('password'),
            'rol' => $role,
        ]);
        $token = $user->createToken('test_token')->plainTextToken;
        return ['user' => $user, 'token' => $token];
    }

    public function test_admin_can_create_book()
    {
        $auth = $this->authenticateUser('admin');
        $token = $auth['token'];

        $bookData = [
            'titulo' => $this->faker->sentence(3),
            'autor' => $this->faker->name,
            'genero' => 'Fantasía',
            'descripcion' => $this->faker->paragraph(2),
            'precio' => 25.00,
            'disponible' => true,
        ];

        $image = UploadedFile::fake()->image('portada.jpg', 600, 600)->size(100);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/admin/libros/create', array_merge($bookData, ['imagen_portada' => $image]));

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Libro creado exitosamente']);

        $this->assertDatabaseHas('libros', [
            'titulo' => $bookData['titulo'],
            'autor' => $bookData['autor'],
        ]);
    }

    public function test_non_admin_cannot_create_book()
    {
        $auth = $this->authenticateUser('usuario');
        $token = $auth['token'];

        $bookData = [
            'titulo' => $this->faker->sentence(3),
            'autor' => $this->faker->name,
            'genero' => 'Ciencia Ficción',
            'descripcion' => $this->faker->paragraph(2),
            'precio' => 12.50,
            'disponible' => true,
        ];
        $image = UploadedFile::fake()->image('portada.jpg', 600, 600)->size(100);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/admin/libros/create', array_merge($bookData, ['imagen_portada' => $image]));

        $response->assertStatus(403);

        $this->assertDatabaseMissing('libros', [
            'titulo' => $bookData['titulo'],
        ]);
    }

    public function test_admin_can_edit_book()
    {
        $auth = $this->authenticateUser('admin');
        $token = $auth['token'];
        $libro = Libro::factory()->create();

        $updatedData = [
            'titulo' => 'Nuevo Titulo Editado',
            'autor' => 'Nuevo Autor',
            'genero' => 'Terror',
            'descripcion' => 'Descripción actualizada.',
            'precio' => 30.00,
            'disponible' => false,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/admin/libros/edit/' . $libro->id, $updatedData);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Libro actualizado exitosamente']);

        $this->assertDatabaseHas('libros', [
            'id' => $libro->id,
            'titulo' => 'Nuevo Titulo Editado',
            'disponible' => false,
        ]);
    }

    public function test_non_admin_cannot_edit_book()
    {
        $auth = $this->authenticateUser('usuario');
        $token = $auth['token'];
        $libro = Libro::factory()->create();

        $updatedData = [
            'titulo' => 'Intento de Edición',
            'autor' => 'No Permitido',
            'genero' => 'Aventura',
            'descripcion' => '...',
            'precio' => 5.00,
            'disponible' => true,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/admin/libros/edit/' . $libro->id, $updatedData);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('libros', [
            'id' => $libro->id,
            'titulo' => 'Intento de Edición',
        ]);
    }

    public function test_admin_can_delete_book_without_dependencies()
    {
        $auth = $this->authenticateUser('admin');
        $token = $auth['token'];
        $libro = Libro::factory()->create();

        $this->assertDatabaseHas('libros', ['id' => $libro->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->deleteJson('/api/admin/libros/delete/' . $libro->id);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Libro borrado exitosamente.']);

        $this->assertDatabaseMissing('libros', ['id' => $libro->id]);
    }

    public function test_admin_cannot_delete_book_with_pedido_details()
    {
        $auth = $this->authenticateUser('admin');
        $token = $auth['token'];
        $libro = Libro::factory()->create();
        $user = Usuario::factory()->create();
        $pedido = Pedido::factory()->create(['id_usuario' => $user->id]);
        Pedido_detalle::factory()->create(['id_pedido' => $pedido->id, 'id_libro' => $libro->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->deleteJson('/api/admin/libros/delete/' . $libro->id);

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Este libro no puede ser eliminado porque tiene historial de pedidos asociados.']);

        $this->assertDatabaseHas('libros', ['id' => $libro->id]);
    }

    public function test_admin_cannot_delete_book_with_carrito_details()
    {
        $auth = $this->authenticateUser('admin');
        $token = $auth['token'];
        $libro = Libro::factory()->create();
        $user = Usuario::factory()->create();
        $carrito = Carrito::factory()->create(['id_usuario' => $user->id]);
        Carrito_detalle::factory()->create(['id_carrito' => $carrito->id, 'id_libro' => $libro->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->deleteJson('/api/admin/libros/delete/' . $libro->id);

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Este libro no puede ser eliminado porque está en un carrito de compras.']);

        $this->assertDatabaseHas('libros', ['id' => $libro->id]);
    }
}