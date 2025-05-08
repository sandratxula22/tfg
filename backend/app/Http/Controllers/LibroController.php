<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Libro;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LibroController extends Controller
{
    public function showBooks(): JsonResponse
    {
        $libros = Libro::with('imagenesAdicionales')->get();

        return response()->json($libros);
    }

    public function showBookById(int $id): JsonResponse
    {
        try {
            $libro = Libro::with('imagenesAdicionales')->findOrFail($id);
            return response()->json($libro);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Libro no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al obtener el libro con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al obtener el libro'], 500);
        }
    }

    public function deleteBook(int $id): JsonResponse
    {
        try {
            $libro = Libro::findOrFail($id);
            $libro->delete();
            return response()->json(['message' => 'Libro borrado exitosamente']);
        } catch (\Exception $e) {
            Log::error("Error al borrar el libro con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al borrar el libro'], 500);
        }
    }

    public function editBook(Request $request, $id): JsonResponse
    {
        try {
            $libro = Libro::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'autor' => 'required|string|max:255',
                'genero' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'precio' => 'required|numeric|min:0',
                'disponible' => 'required|boolean',
                'imagen_portada' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $libro->update($request->all());

            return response()->json(['message' => 'Libro actualizado exitosamente']);
        } catch (\Exception $e) {
            Log::error("Error al actualizar el libro con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar el libro'], 500);
        }
    }

    public function createBook(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'autor' => 'required|string|max:255',
                'genero' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'precio' => 'required|numeric|min:0',
                'disponible' => 'required|boolean',
                'imagen_portada' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $libro = Libro::create($request->all());

            return response()->json($libro, 201);
        } catch (\Exception $e) {
            Log::error("Error al crear un nuevo libro: " . $e->getMessage());
            return response()->json(['message' => 'Error al crear el libro'], 500);
        }
    }

    public function uploadImage(Request $request, int $libro_id): JsonResponse
    {
        try {
            $libro = Libro::findOrFail($libro_id);

            $validator = Validator::make($request->all(), [
                'url' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $libro->imagenesAdicionales()->create(['url' => $request->input('url')]);

            return response()->json(['message' => 'Imagen añadida al libro exitosamente'], 201); // 201 Created

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Libro no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al añadir imagen al libro con ID {$libro_id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al añadir la imagen'], 500);
        }
    }
}
