<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $user = Auth::user();

        if (!in_array($user->rol, $roles)) {
            return response()->json(['message' => 'Acceso no autorizado. Se requiere un rol específico.'], 403);
        }

        return $next($request);
    }
}