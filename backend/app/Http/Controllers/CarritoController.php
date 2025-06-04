<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Carrito_detalle;
use App\Models\Libro;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CarritoController extends Controller
{
    public function showCart()
    {
        try {
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

            $now = now();
            $detallesConEstado = $carrito->detalles->map(function ($detalle) use ($idUsuario, $now) {
                $libro = $detalle->libro;
                $reservadoHasta = $detalle->reservado_hasta ? Carbon::parse($detalle->reservado_hasta) : null;

                $canBePurchased = true;
                $statusMessage = '';
                $isReservedByOther = false;
                $reservationExpiredForCurrentUser = false;

                if (!$libro || !$libro->disponible) {
                    $canBePurchased = false;
                    $statusMessage = 'Este libro ya no está disponible.';
                } else {
                    $isReservedByOther = Carrito_detalle::where('id_libro', $detalle->id_libro)
                        ->where('reservado_hasta', '>', $now)
                        ->where('id', '!=', $detalle->id)
                        ->whereHas('carrito', function ($query) use ($idUsuario) {
                            $query->where('estado', 'activo')
                                  ->where('id_usuario', '!=', $idUsuario);
                        })
                        ->exists();

                    if ($isReservedByOther) {
                        $canBePurchased = false;
                        $statusMessage = 'Este libro está reservado por otra persona.';
                    } else {
                        if ($reservadoHasta && $reservadoHasta->isPast()) {
                            $statusMessage = 'Reserva expirada';
                            $reservationExpiredForCurrentUser = true;
                        } elseif ($reservadoHasta) {
                            $timeLeft = $reservadoHasta->diffInMinutes($now, false);
                            $statusMessage = 'Reservado por ' . abs($timeLeft) . ' minutos';
                        }
                    }
                }

                $detalle->can_be_purchased = $canBePurchased;
                $detalle->status_message = $statusMessage;
                $detalle->is_reserved_by_other = $isReservedByOther;
                $detalle->reservation_expired_for_current_user = $reservationExpiredForCurrentUser;

                return $detalle;
            });

            return response()->json(['detalles' => $detallesConEstado]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al cargar el carrito: ' . $e->getMessage()], 500);
        }
    }

    public function addToCart(Request $request)
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'id_libro' => 'required|exists:libros,id',
                'precio' => 'required|numeric|min:0',
            ]);

            $idLibro = $request->input('id_libro');
            $precio = $request->input('precio');
            $idUsuario = Auth::id();

            if (!$idUsuario) {
                DB::rollBack();
                return response()->json(['message' => 'Usuario no autenticado'], 401);
            }

            $libro = Libro::find($idLibro);
            if (!$libro || !$libro->disponible) {
                DB::rollBack();
                return response()->json(['message' => 'Este libro no está disponible para la compra en este momento.'], 409);
            }

            $libroReservadoPorOtro = Carrito_detalle::where('id_libro', $idLibro)
                ->where('reservado_hasta', '>', now())
                ->whereHas('carrito', function ($query) use ($idUsuario) {
                    $query->where('estado', 'activo')
                          ->where('id_usuario', '!=', $idUsuario);
                })
                ->exists();

            if ($libroReservadoPorOtro) {
                DB::rollBack();
                return response()->json(['message' => 'Este libro está actualmente reservado por otro usuario.'], 409);
            }

            $carrito = Carrito::firstOrCreate(['id_usuario' => $idUsuario, 'estado' => 'activo'], ['total' => 0]);

            $detalleExistente = Carrito_detalle::where('id_carrito', $carrito->id)
                ->where('id_libro', $idLibro)
                ->first();

            if ($detalleExistente) {
                $reservadoHasta = $detalleExistente->reservado_hasta ? Carbon::parse($detalleExistente->reservado_hasta) : null;
                
                if (!$reservadoHasta || $reservadoHasta->isPast()) {
                    $detalleExistente->reservado_hasta = now()->addMinutes(15);
                    $detalleExistente->save();
                    $carrito->total = Carrito_detalle::where('id_carrito', $carrito->id)->sum('precio');
                    $carrito->save();
                    DB::commit();
                    return response()->json(['message' => 'Reserva renovada', 'carrito_detalle' => $detalleExistente], 200);
                } else {
                    DB::rollBack();
                    return response()->json(['message' => 'Este libro ya está en tu carrito y tu reserva está activa.'], 200, ['already_in_cart' => true]);
                }
            }

            $carritoDetalle = new Carrito_detalle();
            $carritoDetalle->precio = $precio;
            $carritoDetalle->id_carrito = $carrito->id;
            $carritoDetalle->id_libro = $idLibro;
            $carritoDetalle->reservado_hasta = now()->addMinutes(15);
            $carritoDetalle->save();

            $carrito->total = Carrito_detalle::where('id_carrito', $carrito->id)->sum('precio');
            $carrito->save();

            DB::commit();
            return response()->json(['message' => 'Libro añadido y reservado', 'carrito_detalle' => $carritoDetalle], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Datos de entrada inválidos: ' . $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al añadir el libro al carrito: ' . $e->getMessage()], 500);
        }
    }

    public function removeItem($id)
    {
        DB::beginTransaction();
        try {
            $idUsuario = Auth::id();

            if (!$idUsuario) {
                DB::rollBack();
                return response()->json(['message' => 'Usuario no autenticado'], 401);
            }

            $carritoDetalle = Carrito_detalle::where('id', $id)
                ->whereHas('carrito', function ($query) use ($idUsuario) {
                    $query->where('id_usuario', $idUsuario);
                })
                ->first();

            if (!$carritoDetalle) {
                DB::rollBack();
                return response()->json(['message' => 'Item de carrito no encontrado o no pertenece a este usuario.'], 404);
            }

            $carritoDetalle->delete();

            $carrito = Carrito::where('id', $carritoDetalle->id_carrito)->first();
            if ($carrito) {
                $carrito->total = Carrito_detalle::where('id_carrito', $carrito->id)->sum('precio');
                $carrito->save();
            }

            DB::commit();
            return response()->json(['message' => 'Libro eliminado del carrito'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al eliminar el libro del carrito: ' . $e->getMessage()], 500);
        }
    }

    public function renewReservation($id)
    {
        DB::beginTransaction();
        try {
            $idUsuario = Auth::id();

            if (!$idUsuario) {
                DB::rollBack();
                return response()->json(['message' => 'Usuario no autenticado'], 401);
            }

            $carritoDetalle = Carrito_detalle::where('id', $id)
                ->whereHas('carrito', function ($query) use ($idUsuario) {
                    $query->where('id_usuario', $idUsuario);
                })
                ->first();

            if (!$carritoDetalle) {
                DB::rollBack();
                return response()->json(['message' => 'Item de carrito no encontrado o no pertenece a este usuario.'], 404);
            }

            $libro = Libro::find($carritoDetalle->id_libro);
            if (!$libro || !$libro->disponible) {
                DB::rollBack();
                return response()->json(['message' => 'Este libro ya no está disponible para la compra o ha sido retirado.'], 409);
            }

            $libroReservadoPorOtro = Carrito_detalle::where('id_libro', $carritoDetalle->id_libro)
                ->where('reservado_hasta', '>', now())
                ->where('id', '!=', $carritoDetalle->id)
                ->whereHas('carrito', function ($query) use ($idUsuario) {
                    $query->where('estado', 'activo')
                          ->where('id_usuario', '!=', $idUsuario);
                })
                ->exists();

            if ($libroReservadoPorOtro) {
                DB::rollBack();
                return response()->json(['message' => 'Este libro está actualmente reservado por otra persona.'], 409);
            }

            $carritoDetalle->reservado_hasta = now()->addMinutes(15);
            $carritoDetalle->save();

            DB::commit();
            return response()->json([
                'message' => 'Reserva renovada con éxito.',
                'reservado_hasta' => $carritoDetalle->reservado_hasta,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al renovar la reserva: ' . $e->getMessage()], 500);
        }
    }
}