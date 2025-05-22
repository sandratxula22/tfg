<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Carrito_detalle;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CarritoController extends Controller
{
    public function showCarrito()
    {
        $idUsuario = Auth::id();

        if (!$idUsuario) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        $carrito = Carrito::where('id_usuario', $idUsuario)
            ->where('estado', 'activo')
            ->with('detalles.libro')
            ->first();

        if (!$carrito) {
            return response()->json(['detalles' => []]);
        }

        return response()->json(['detalles' => $carrito->detalles]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'id_libro' => 'required|exists:libros,id',
            'precio' => 'required|numeric|min:0',
        ]);

        $idLibro = $request->input('id_libro');
        $precio = $request->input('precio');
        $idUsuario = Auth::id();

        if (!$idUsuario) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        $carrito = Carrito::firstOrCreate(['id_usuario' => $idUsuario, 'estado' => 'activo'], ['total' => 0]);

        $detalleExistente = Carrito_detalle::where('id_carrito', $carrito->id)
            ->where('id_libro', $idLibro)
            ->first();

        if ($detalleExistente) {
            $reservadoHasta = $detalleExistente->reservado_hasta ? Carbon::parse($detalleExistente->reservado_hasta) : null;
            if ($reservadoHasta && $reservadoHasta->isPast()) {
                $detalleExistente->reservado_hasta = now()->addMinutes(15);
                $detalleExistente->save();
                $carrito->total = Carrito_detalle::where('id_carrito', $carrito->id)->sum('precio');
                $carrito->save();
                return response()->json(['message' => 'Reserva renovada', 'carrito_detalle' => $detalleExistente], 200);
            } else {
                return response()->json(['message' => 'Este libro ya está en tu carrito'], 200, ['already_in_cart' => true]);
            }
        }

        $libroReservado = Carrito_detalle::where('id_libro', $idLibro)
            ->where('reservado_hasta', '>', now())
            ->where('id_carrito', '!=', $carrito->id)
            ->exists();

        if ($libroReservado) {
            return response()->json(['message' => 'Este libro está actualmente reservado por otro usuario'], 409);
        }

        $carritoDetalle = new Carrito_detalle();
        $carritoDetalle->precio = $precio;
        $carritoDetalle->id_carrito = $carrito->id;
        $carritoDetalle->id_libro = $idLibro;
        $carritoDetalle->reservado_hasta = now()->addMinutes(15);
        $carritoDetalle->save();

        $carrito->total = Carrito_detalle::where('id_carrito', $carrito->id)->sum('precio');
        $carrito->save();

        return response()->json(['message' => 'Libro añadido y reservado', 'carrito_detalle' => $carritoDetalle], 201);
    }

    public function removeItem($id)
    {
        $idUsuario = Auth::id();

        if (!$idUsuario) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        $carritoDetalle = Carrito_detalle::where('id', $id)
            ->whereHas('carrito', function ($query) use ($idUsuario) {
                $query->where('id_usuario', $idUsuario);
            })
            ->firstOrFail();

        $carritoDetalle->delete();

        $carrito = Carrito::where('id', $carritoDetalle->id_carrito)->first();
        if ($carrito) {
            $carrito->total = Carrito_detalle::where('id_carrito', $carrito->id)->sum('precio');
            $carrito->save();
        }

        return response()->json(['message' => 'Libro eliminado del carrito'], 200);
    }
}
