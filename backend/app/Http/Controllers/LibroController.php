<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Libro;
use App\Models\Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Models\Carrito_detalle;

class LibroController extends Controller
{
    public function showBooks(): JsonResponse
    {
        $libros = Libro::with('imagenesAdicionales')->get()->map(function ($libro) {
            $estaReservado = $libro->estaReservado();

            return $libro->toArray() + [
                'esta_reservado' => $estaReservado,
            ];
        });
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
            $libro->carritoDetalles()->delete();
            $imagenesAdicionales = $libro->imagenesAdicionales;

            foreach ($imagenesAdicionales as $imagen) {
                $filename = $imagen->url;
                $path = $filename;

                if (File::exists($path)) {
                    File::delete($path);
                } else {
                    Log::warning("Archivo de imagen no encontrado al eliminar libro ID {$id}: " . $path);
                }
            }

            $libro->delete();

            return response()->json(['message' => 'Libro y sus imágenes borradas exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Libro no encontrado'], 404);
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
                'imagen_portada' => 'nullable|image|mimes:jpeg,png,jpg,gif'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $libroData = $request->except('imagen_portada');

            if ($request->hasFile('imagen_portada')) {
                if ($libro->imagen_portada) {
                    $oldFilePath = public_path($libro->imagen_portada);
                    if (File::exists($oldFilePath)) {
                        File::delete($oldFilePath);
                    } else {
                        Log::warning('Portada antigua no encontrada al borrar: ' . $oldFilePath);
                    }
                }

                $image = $request->file('imagen_portada');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
                $image->move(public_path('portadas'), $filename);
                $libroData['imagen_portada'] = 'portadas/' . $filename;
            } else {
                $libroData['imagen_portada'] = $libro->imagen_portada;
            }

            $libro->update($libroData);

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
                'imagen_portada' => 'required|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $libroData = $request->except('imagen_portada');

            if ($request->hasFile('imagen_portada')) {
                $image = $request->file('imagen_portada');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
                $image->move(public_path('portadas'), $filename);
                $libroData['imagen_portada'] = 'portadas/' . $filename;
            }

            $libro = Libro::create($libroData);

            return response()->json(['message' => 'Libro creado exitosamente'], 201);
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
                'imagen' => 'required|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            if ($request->hasFile('imagen')) {
                $image = $request->file('imagen');
                $originalFilename = $image->getClientOriginalName();
                $extension = $image->getClientOriginalExtension();
                $uniqueFilename = Str::slug(pathinfo($originalFilename, PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
                $path = public_path('adicionales');

                if (!File::exists($path)) {
                    File::makeDirectory($path, 0775, true);
                }
                $image->move($path, $uniqueFilename);
                $url = 'adicionales/' . $uniqueFilename;

                $libro->imagenesAdicionales()->create(['url' => $url]);

                return response()->json(['message' => 'Imagen subida exitosamente', 'filename' => $uniqueFilename, 'url' => $url], 201);
            }

            return response()->json(['message' => 'No se proporcionó ninguna imagen'], 400);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Libro no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al subir la imagen al libro con ID {$libro_id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al subir la imagen: ' . $e->getMessage()], 500);
        }
    }

    public function getImages(): JsonResponse
    {
        $images = Image::with('libro')->get();
        $images = $images->map(function ($image) {
            return [
                'id' => $image->id,
                'libro_id' => $image->libro_id,
                'titulo_libro' => $image->libro->titulo,
                'url' => $image->url,
                'created_at' => $image->created_at,
                'updated_at' => $image->updated_at,
            ];
        });

        return response()->json($images);
    }

    public function getImageById(int $id): JsonResponse
    {
        try {
            $image = Image::findOrFail($id);
            return response()->json($image);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Imagen no encontrada'], 404);
        } catch (\Exception $e) {
            Log::error("Error al obtener la imagen con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al obtener la imagen'], 500);
        }
    }

    public function deleteImage(int $id): JsonResponse
    {
        try {
            $image = Image::findOrFail($id);

            $filename = $image->url;
            $filePath = public_path($filename);

            if (file_exists($filePath)) {
                unlink($filePath);
            } else {
                Log::warning('Archivo no encontrado: ' . $filePath);
            }

            $image->delete();

            return response()->json(['message' => 'Imagen borrada exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Imagen no encontrada'], 404);
        } catch (\Exception $e) {
            Log::error("Error al borrar la imagen con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al borrar la imagen'], 500);
        }
    }

    public function editImage(Request $request, int $id): JsonResponse
    {
        try {
            $image = Image::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'libro_id' => 'required|exists:libros,id',
                'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'url' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $image->libro_id = $request->libro_id;

            if ($request->hasFile('imagen')) {
                if ($image->url) {
                    $oldFilePath = public_path($image->url);
                    if (File::exists($oldFilePath)) {
                        File::delete($oldFilePath);
                    } else {
                        Log::warning('Imagen antigua no encontrada al borrar: ' . $oldFilePath);
                    }
                }

                $imageFile = $request->file('imagen');
                $extension = $imageFile->getClientOriginalExtension();
                $filename = Str::slug(pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
                $imageFile->move(public_path('adicionales'), $filename);
                $image->url = 'adicionales/' . $filename;
            } elseif ($request->filled('url')) {
                $image->url = $request->url;
            }

            $image->save();

            return response()->json(['message' => 'Imagen actualizada exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Imagen no encontrada'], 404);
        } catch (\Exception $e) {
            Log::error("Error al actualizar la imagen con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar la imagen'], 500);
        }
    }
}
