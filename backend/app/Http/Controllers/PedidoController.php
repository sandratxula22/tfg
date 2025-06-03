<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Pedido;
use Illuminate\Support\Facades\Log;


class PedidoController extends Controller
{
    public function showOrders()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        try {
            $pedidos = Pedido::where('id_usuario', $userId)
                ->with(['detalles' => function ($query) {
                    $query->orderBy('id', 'asc');
                }, 'detalles.libro'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($pedidos, 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener pedidos del usuario ' . $userId . ': ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Error interno del servidor al cargar los pedidos.'], 500);
        }
    }
}
