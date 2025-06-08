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
use Illuminate\Support\Facades\Mail;
use App\Mail\PedidoConfirmacion;
use App\Models\Usuario;

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

        $shippingAddressData = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'ciudad' => 'required|string|max:255',
            'codigo_postal' => 'required|string|max:10',
            'pais' => 'required|string|max:2',
        ]);


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
                'nombre_envio' => $shippingAddressData['nombre'],
                'apellidos_envio' => $shippingAddressData['apellidos'],
                'direccion_envio' => $shippingAddressData['direccion'],
                'ciudad_envio' => $shippingAddressData['ciudad'],
                'codigo_postal_envio' => $shippingAddressData['codigo_postal'],
                'pais_envio' => $shippingAddressData['pais'],
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
                        'shipping' => [
                            'name' => [
                                'full_name' => $shippingAddressData['nombre'] . ' ' . $shippingAddressData['apellidos']
                            ],
                            'address' => [
                                'address_line_1' => $shippingAddressData['direccion'],
                                'admin_area_2' => $shippingAddressData['ciudad'],
                                'postal_code' => $shippingAddressData['codigo_postal'],
                                'country_code' => $shippingAddressData['pais'],
                            ]
                        ]
                    ],
                ],
                'application_context' => [
                    'return_url' => route('paypal.capture'),
                    'cancel_url' => route('paypal.cancel'),
                    'shipping_preference' => 'SET_PROVIDED_ADDRESS',
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
                        return response()->json(['approval_url' => $link->href, 'pedido_id' => $pendingOrder->id], 200);
                    }
                }
            }

            DB::rollBack();
            return response()->json(['message' => 'Error al crear la orden de PayPal'], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al iniciar checkout PayPal: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Error al conectar con PayPal: ' . $e->getMessage()], 500);
        }
    }

    public function capturePayPalPayment(Request $request)
    {
        $orderId = $request->query('token');

        if (!$orderId) {
            return redirect(env('VITE_FRONTEND_URL') . '/carrito?payment=error&message=No se recibio el token de PayPal');
        }

        $requestPayPal = new OrdersCaptureRequest($orderId);
        $requestPayPal->prefer('return=representation');

        try {
            $client = $this->getPayPalClient();
            $response = $client->execute($requestPayPal);

            if ($response->statusCode === 201 || $response->statusCode === 200) {
                $processResult = $this->processOrderAfterPayment($response->result);

                if ($processResult instanceof \Illuminate\Http\JsonResponse) {
                    return redirect(env('VITE_FRONTEND_URL') . '/carrito?payment=error&message=' . urlencode($processResult->getData()->message));
                }

                $pedido = Pedido::where('payment_id', $orderId)->first();
                $pedidoId = $pedido ? $pedido->id : null;

                return redirect(env('VITE_FRONTEND_URL') . '/pedidos?payment=success&pedido_id=' . $pedidoId);
            } else {
                Log::error('Error al capturar el pago PayPal: ' . $response->statusCode . ' - ' . json_encode($response->result));
                return redirect(env('VITE_FRONTEND_URL') . '/carrito?payment=error&message=Error al capturar el pago de PayPal');
            }
        } catch (\Exception $e) {
            Log::error('Excepcion al capturar el pago PayPal: ' . $e->getMessage(), ['exception' => $e]);
            return redirect(env('VITE_FRONTEND_URL') . '/carrito?payment=error&message=' . urlencode('Error al capturar el pago: ' . $e->getMessage()));
        }
    }

    protected function processOrderAfterPayment($paymentResult)
    {
        $paypalOrderId = $paymentResult->id;
        try {
            $pedido = Pedido::where('payment_id', $paypalOrderId)
                ->with('detalles.libro', 'usuario')
                ->firstOrFail();
            $userId = $pedido->id_usuario;

            DB::beginTransaction();

            $carrito = Carrito::where('id_usuario', $userId)
                ->where('estado', 'activo')
                ->with('detalles.libro')
                ->first();

            if (!$carrito) {
                DB::rollBack();
                return response()->json(['message' => 'Tu carrito no se encontró.'], 400);
            }

            foreach ($carrito->detalles as $detalle) {
                $libro = Libro::lockForUpdate()->find($detalle->id_libro);
                if (!$libro || !$libro->disponible) {
                    DB::rollBack();
                    return response()->json(['message' => 'El libro "' . $detalle->libro->titulo . '" ya no está disponible.'], 409);
                }

                if ($detalle->reservado_hasta && now() < $detalle->reservado_hasta && $detalle->id_carrito !== $carrito->id) {
                    DB::rollBack();
                    return response()->json(['message' => 'El libro "' . $detalle->libro->titulo . '" está reservado por otra persona.'], 409);
                }
            }

            $pedido->update(['estado' => 'pagado']);

            foreach ($carrito->detalles as $detalle) {
                $libro = Libro::find($detalle->id_libro);
                Pedido_detalle::create([
                    'id_pedido' => $pedido->id,
                    'id_libro' => $libro->id,
                    'cantidad' => 1,
                    'precio' => $detalle->precio,
                ]);
                $libro->update(['disponible' => false]);
            }

            Carrito_detalle::where('id_carrito', $carrito->id)->delete();
            $carrito->total = 0;
            $carrito->estado = 'completado';
            $carrito->save();

            DB::commit();

            if ($pedido->usuario && $pedido->usuario->correo) {
                Mail::to($pedido->usuario->correo)->send(new PedidoConfirmacion($pedido));
                Log::info('correo de confirmación de pedido enviado para el pedido ID: ' . $pedido->id . ' al correo: ' . $pedido->usuario->correo);
            } else {
                Log::warning('No se pudo enviar el correo de confirmación para el pedido ID: ' . $pedido->id . ' - Usuario o correo no encontrado.');
            }

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en processOrderAfterPayment: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Error al procesar el pedido: ' . $e->getMessage()], 500);
        }
    }

    public function paymentCancel()
    {
        $token = request()->query('token');
        if ($token) {
            $pedido = Pedido::where('payment_id', $token)->first();
            if ($pedido) {
                $pedido->update(['estado' => 'cancelado']);
            }
        }
        return redirect(env('VITE_FRONTEND_URL') . '/carrito?payment=cancelled');
    }
}
