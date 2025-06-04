<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }
        .header { background-color: #4CAF50; color: white; padding: 10px 0; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #777; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Gracias por tu compra en La Página Doblada!</h2>
        </div>
        <div class="content">
            <p>Hola {{ $pedido->usuario->name ?? 'Estimado cliente' }},</p>
            <p>Tu pedido **#{{ $pedido->id }}** ha sido confirmado y procesado con éxito. A continuación, los detalles de tu compra:</p>

            <h3>Detalles del Pedido:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Libro</th>
                        <th>Autor</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($pedido->detalles as $detalle)
                        <tr>
                            <td>{{ $detalle->libro->titulo }}</td>
                            <td>{{ $detalle->libro->autor }}</td>
                            <td>{{ number_format($detalle->precio, 2) }}€</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="total">
                <p><strong>Total pagado: {{ number_format($pedido->total, 2) }}€</strong></p>
            </div>
            <p>Recibirás otra notificación una vez que tu pedido sea enviado.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>Atentamente,<br>El equipo de La  Página Doblada</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} La Página Doblada. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>