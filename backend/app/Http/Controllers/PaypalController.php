<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Carrito_detalle;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\Pedido;
use App\Models\Pedido_detalle;
use App\Models\Libro;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaypalController extends Controller
{
    private function getPayPalClient()
    {
        $clientId = env('PAYPAL_CLIENT_ID');
        $clientSecret = env('PAYPAL_CLIENT_SECRET');
        $environment = new SandboxEnvironment($clientId, $clientSecret);
        return new PayPalHttpClient($environment);
    }

    public function startPayPalCheckout(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        $carrito = Carrito::where('id_usuario', $userId)
            ->where('estado', 'activo')
            ->with('detalles.libro')
            ->first();

        if (!$carrito || $carrito->detalles->isEmpty()) {
            return response()->json(['message' => 'Tu carrito está vacío.'], 400);
        }

        $total = $carrito->detalles->sum(fn($detalle) => $detalle->precio);
        $items = $carrito->detalles->map(function ($detalle) {
            return [
                'name' => $detalle->libro->titulo,
                'unit_amount' => [
                    'currency_code' => 'EUR',
                    'value' => number_format($detalle->precio, 2, '.', ''),
                ],
                'quantity' => '1',
            ];
        })->toArray();

        DB::beginTransaction();
        try {
            $pendingOrder = Pedido::create([
                'id_usuario' => $userId,
                'total' => $total,
                'fecha_pedido' => now(),
                'estado' => 'pendiente_paypal',
            ]);

            $requestPayPal = new OrdersCreateRequest();
            $requestPayPal->prefer('return=representation');
            $requestPayPal->body = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $pendingOrder->id,
                        'amount' => [
                            'currency_code' => 'EUR',
                            'value' => number_format($total, 2, '.', ''),
                            'breakdown' => [
                                'item_total' => [
                                    'currency_code' => 'EUR',
                                    'value' => number_format($total, 2, '.', ''),
                                ],
                            ],
                        ],
                        'items' => $items,
                    ],
                ],
                'application_context' => [
                    'return_url' => route('paypal.capture'),
                    'cancel_url' => route('paypal.cancel'),
                ],
            ];

            $client = $this->getPayPalClient();
            $response = $client->execute($requestPayPal);

            if ($response->statusCode === 201) {
                $paypalOrderId = $response->result->id;
                $pendingOrder->payment_id = $paypalOrderId;
                $pendingOrder->save();
                DB::commit();
                foreach ($response->result->links as $link) {
                    if ($link->rel === 'approve') {
                        return response()->json(['approval_url' => $link->href], 200);
                    }
                }
            }

            DB::rollBack();
            Log::error('Error al crear la orden de PayPal: ' . json_encode($response->result));
            return response()->json(['message' => 'Error al crear la orden de PayPal'], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al conectar con PayPal: ' . $e->getMessage());
            return response()->json(['message' => 'Error al conectar con PayPal: ' . $e->getMessage()], 500);
        }
    }

    public function capturePayPalPayment(Request $request)
    {
        $orderId = $request->query('token');

        $requestPayPal = new OrdersCaptureRequest($orderId);
        $requestPayPal->prefer('return=representation');

        try {
            $client = $this->getPayPalClient();
            $response = $client->execute($requestPayPal);

            Log::info('Respuesta completa de PayPal Capture: ' . json_encode($response->result, JSON_PRETTY_PRINT));

            if ($response->statusCode === 201) {
                return $this->processOrderAfterPayment($response->result);
            }

            return redirect('/payment/cancelled')->with('message', 'Error al capturar el pago de PayPal.');
        } catch (\Exception $e) {
            Log::error('Error al capturar el pago de PayPal: ' . $e->getMessage());
            return redirect('/payment/cancelled')->with('message', 'Error al capturar el pago: ' . $e->getMessage());
        }
    }

    protected function processOrderAfterPayment($paymentResult)
    {
        $paypalOrderId = $paymentResult->id;
        Log::info('processOrderAfterPayment iniciado para PayPal Order ID: ' . $paypalOrderId);

        $pedido = null;
        try {
            $pedido = Pedido::where('payment_id', $paypalOrderId)->firstOrFail();
            Log::info('Pedido local encontrado con ID: ' . $pedido->id . ' y usuario ID: ' . $pedido->id_usuario);
            $userId = $pedido->id_usuario;
        } catch (\Exception $e) {
            Log::error('Error al encontrar el pedido local: ' . $e->getMessage());
            return redirect('/carrito')->with('message', 'Error al verificar tu pedido.');
        }

        DB::beginTransaction();
        try {
            $carrito = Carrito::where('id_usuario', $userId)
                ->where('estado', 'activo')
                ->with('detalles.libro')
                ->first();

            Log::info('Carrito encontrado: ' . ($carrito ? 'Sí' : 'No'));
            if (!$carrito) {
                DB::rollBack();
                Log::warning('Carrito no encontrado para usuario ID: ' . $userId);
                return redirect('/carrito')->with('message', 'Tu carrito no se encontró.');
            }

            // Check book availability (using 'disponible') BEFORE updating order and creating details
            foreach ($carrito->detalles as $detalle) {
                $libro = Libro::lockForUpdate()->find($detalle->id_libro);
                Log::info('Verificando disponibilidad para libro ID: ' . $libro->id . ', Disponible: ' . ($libro->disponible ? 'Sí' : 'No') . ', Reservado hasta: ' . $detalle->reservado_hasta);
                if (!$libro || !$libro->disponible) {
                    DB::rollBack();
                    Log::error('Libro no disponible: ' . $detalle->libro->titulo . ' (ID: ' . $libro->id . ')');
                    return redirect('/carrito')->with('message', 'El libro "' . $detalle->libro->titulo . '" ya no está disponible.');
                }

                // Check if the book is reserved by someone else
                if ($detalle->reservado_hasta && now() < $detalle->reservado_hasta && $detalle->id_carrito !== $carrito->id) {
                    DB::rollBack();
                    Log::error('Libro reservado por otra persona: ' . $detalle->libro->titulo . ' (ID: ' . $libro->id . ')');
                    return redirect('/carrito')->with('message', 'El libro "' . $detalle->libro->titulo . '" está reservado por otra persona.');
                }
            }

            $pedido->update(['estado' => 'pagado']);
            Log::info('Pedido ID: ' . $pedido->id . ' actualizado a estado: pagado');

            foreach ($carrito->detalles as $detalle) {
                $libro = Libro::find($detalle->id_libro); // No need to lock again
                Pedido_detalle::create([
                    'id_pedido' => $pedido->id,
                    'id_libro' => $libro->id,
                    'cantidad' => 1,
                    'precio_unitario' => $detalle->precio,
                ]);
                Log::info('Pedido detalle creado para libro ID: ' . $libro->id);
                // Mark the book as not available after successful purchase
                $libro->update(['disponible' => false]);
                Log::info('Libro ID: ' . $libro->id . ' marcado como no disponible.');
            }

            Carrito_detalle::where('id_carrito', $carrito->id)->delete();
            $carrito->total = 0;
            $carrito->estado = 'completado';
            $carrito->save();
            Log::info('Carrito del usuario ID: ' . $userId . ' vaciado y marcado como completado.');

            DB::commit();
            Log::info('Transacción completada para pedido ID: ' . $pedido->id);

            return response()->json(['message' => 'Pedido realizado con éxito', 'pedido_id' => $pedido->id], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al procesar el pedido: ' . $e->getMessage());
            return redirect('/carrito')->with('message', 'Error al procesar el pedido: ' . $e->getMessage());
        }
    }

    public function paymentCancel()
    {
        return redirect('/carrito')->with('message', 'El pago con PayPal fue cancelado.');
    }
}
