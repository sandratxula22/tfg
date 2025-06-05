<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Petición de Libro</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }
        .header { background-color: #007bff; color: white; padding: 10px 0; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #777; }
        ul { list-style-type: none; padding: 0; }
        ul li strong { display: inline-block; width: 120px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Nueva Petición de Libro Recibida!</h2>
        </div>
        <div class="content">
            <p>Se ha recibido una nueva petición de libro a través de la página de "La Página Doblada".</p>
            <ul>
                <li><strong>Título:</strong> {{ $peticionData['titulo'] ?? 'N/A' }}</li>
                <li><strong>Autor:</strong> {{ $peticionData['autor'] ?? 'N/A' }}</li>
                <li><strong>Email del Remitente:</strong> {{ $peticionData['email_remitente'] ?? 'N/A' }}</li>
                @if (isset($peticionData['mensaje']) && $peticionData['mensaje'])
                    <li><strong>Mensaje:</strong><br>{{ $peticionData['mensaje'] }}</li>
                @endif
            </ul>
            <p>Por favor, revisa esta petición.</p>
            <p>Atentamente,<br>Sistema de Notificaciones de La Página Doblada</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} La Página Doblada. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>