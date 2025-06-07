<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Mail\PeticionLibroMail;

class PeticionController extends Controller
{
    public function enviarPeticion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'autor' => 'required|string|max:255',
            'mensaje' => 'nullable|string',
            'email_remitente' => 'required|string|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error de validación', 'errors' => $validator->errors()], 422);
        }

        try {
            $peticionData = $request->only(['titulo', 'autor', 'mensaje', 'email_remitente']);

            Mail::to(env('MAIL_ADMIN_RECEIVER_EMAIL'))->send(new PeticionLibroMail($peticionData));

            Log::info('Petición de libro enviada desde: ' . $peticionData['email_remitente'] . ' - Título: ' . $peticionData['titulo']);

            return response()->json(['message' => 'Petición enviada exitosamente.'], 200);
        } catch (\Exception $e) {
            Log::error('Error al enviar petición de libro: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Error interno al enviar la petición.'], 500);
        }
    }
}