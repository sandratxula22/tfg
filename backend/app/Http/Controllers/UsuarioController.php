<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var \App\Models\Usuario $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'direccion' => $user->direccion,
            'correo' => $user->correo,
            'rol' => $user->rol,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\Usuario $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->nombre = $request->nombre;
        $user->apellido = $request->apellido;
        $user->direccion = $request->direccion;

        $user->save();

        return response()->json(['message' => 'Información actualizada exitosamente.', 'user' => $user]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        /** @var \App\Models\Usuario $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->contrasena)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $user->contrasena = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada exitosamente.']);
    }

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
        DB::beginTransaction();
        try {
            $loggedInUser = Auth::user();
            if ($loggedInUser && $loggedInUser->id === $id) {
                DB::rollBack();
                return response()->json(['message' => 'No puedes eliminar tu propio usuario.'], 403);
            }

            $usuario = Usuario::findOrFail($id);

            if ($usuario->pedidos()->exists()) {
                DB::rollBack();
                return response()->json(['message' => 'Este usuario no puede ser eliminado porque tiene historial de pedidos asociados.'], 409);
            }

            foreach ($usuario->carritos as $carrito) {
                $carrito->detalles()->delete();
                $carrito->delete();
            }

            $usuario->delete();

            DB::commit();
            return response()->json(['message' => 'Usuario borrado exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error al borrar el usuario con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al borrar el usuario: ' . $e->getMessage()], 500);
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
            $usuarioAEditar = Usuario::findOrFail($id);
            $loggedInUser = Auth::user();

            $rules = [
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'direccion' => 'required|string|max:255',
                'correo' => 'required|string|email|max:255|unique:usuarios,correo,' . $id,
            ];

            if ($usuarioAEditar->id === $loggedInUser->id) {
                if ($request->has('rol') && $request->rol !== $usuarioAEditar->rol) {
                    return response()->json(['message' => 'No puedes cambiar tu propio rol.'], 403);
                }
                $dataToUpdate = $request->except('rol');
            } else {
                $rules['rol'] = 'required|string|in:usuario,admin';
                $dataToUpdate = $request->all();
            }

            $validator = Validator::make($dataToUpdate, $rules);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuarioAEditar->update($dataToUpdate);

            return response()->json(['message' => 'Usuario actualizado exitosamente'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error("Error al actualizar el usuario con ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar el usuario'], 500);
        }
    }
}
