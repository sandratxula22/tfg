<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Libro;
use Illuminate\Http\JsonResponse;

class LibroController extends Controller
{
    public function showBooks(): JsonResponse
    {
        $libros = Libro::all()->map(function ($libro) {
            $libro->imagenes_adicionales = json_decode($libro->imagenes_adicionales);
            return $libro;
        });
    
        return response()->json($libros);
    }

    public function showBookById(int $id): JsonResponse
    {
        $libro = Libro::findOrFail($id);
        $libro->imagenes_adicionales = json_decode($libro->imagenes_adicionales);
        
        return response()->json($libro);
    }
}
