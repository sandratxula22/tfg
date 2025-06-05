<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BotController extends Controller
{
    public function recommendBook(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
        ]);

        $userQuery = $request->input('query');
        $apiKey = env('HUGGINGFACE_API_KEY');

        if (!$apiKey) {
            return response()->json(['message' => 'API Key de Hugging Face no configurada en el servidor.'], 500);
        }

        $prompt = "Actúa como un experto en recomendaciones de libros. Un usuario ha pedido la siguiente recomendación: '{$userQuery}'. Por favor, recomiéndale libros que coincidan con su petición, incluyendo título, autor y una breve descripción. Presenta cada recomendación en una línea nueva. La respuesta debe estar escrita completamente en español. Si no encuentras una recomendación clara, dilo amablemente.";

        $hfApiUrl = 'https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.1-8B-Instruct/v1/chat/completions';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(60)
            ->post($hfApiUrl, [
                'messages' => [
                    ['role' => 'system', 'content' => 'Eres un asistente experto en literatura que recomienda libros. Responde siempre en español.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'model' => 'meta-llama/Llama-3.1-8B-Instruct',
                'max_tokens' => 500,
                'temperature' => 0.5,
                'stream' => false,
            ]);

            $aiResponse = $response->json();

            if (isset($aiResponse['choices'][0]['message']['content'])) {
                $recommendationsText = $aiResponse['choices'][0]['message']['content'];

                if (str_starts_with(trim($recommendationsText), trim($prompt))) {
                    $recommendationsText = substr($recommendationsText, strlen(trim($prompt)));
                }
                $recommendationsText = trim($recommendationsText);

                return response()->json([
                    'message' => 'Recomendaciones del bot',
                    'raw_response' => $recommendationsText,
                ]);

            } else {
                Log::error('Respuesta inesperada o incompleta de la API de Hugging Face (Llama-3.1): ' . json_encode($aiResponse));
                return response()->json(['message' => 'El bot no pudo generar una recomendación en este momento. La respuesta de la IA no fue la esperada.'], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al conectar con la API de Hugging Face (Llama-3.1): ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Error al conectar con el servicio de recomendaciones: ' . $e->getMessage()], 500);
        }
    }
}