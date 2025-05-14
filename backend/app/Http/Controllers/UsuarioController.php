<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    public function getUsers(): JsonResponse
    {
        try {
            $usuarios = Usuario::all();
            return response()->json($usuarios);
        } catch (\Exception $e) {
            Log::error("Error al obtener la lista de usuarios: " . $e->getMessage());
            return response()->json(['message' => 'Error al obtener la lista de usuarios'], 500);
        }
    }

    public function getUserById(int $id): JsonResponse
    {
        try {
            $usuario = Usuario::findOrFail($id);
            return response()->json($usuario);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al obtener el usuario con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al obtener el usuario'], 500);
        }
    }

    public function deleteUser(int $id): JsonResponse
    {
        try {
            $usuario = Usuario::findOrFail($id);
            $usuario->delete();
            return response()->json(['message' => 'Usuario borrado exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al borrar el usuario con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al borrar el usuario'], 500);
        }
    }

    public function createUser(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'direccion' => 'required|string|max:255',
                'correo' => 'required|string|email|max:255|unique:usuarios,correo',
                'contrasena' => 'required|string|min:6',
                'rol' => 'required|string|in:usuario,admin',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = Usuario::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'direccion' => $request->direccion,
                'correo' => $request->correo,
                'contrasena' => Hash::make($request->contrasena),
                'rol' => $request->rol,
            ]);

            return response()->json(['message' => 'Usuario creado exitosamente'], 201);
        } catch (\Exception $e) {
            Log::error("Error al crear un nuevo usuario: " . $e->getMessage());
            return response()->json(['message' => 'Error al crear el usuario'], 500);
        }
    }

    public function editUser(Request $request, int $id): JsonResponse
    {
        try {
            $usuario = Usuario::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'direccion' => 'required|string|max:255',
                'correo' => 'required|string|email|max:255|unique:usuarios,correo,' . $id,
                'rol' => 'required|string|in:usuario,admin',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario->update($request->all());

            return response()->json(['message' => 'Usuario actualizado exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al actualizar el usuario con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar el usuario'], 500);
        }
    }
}
