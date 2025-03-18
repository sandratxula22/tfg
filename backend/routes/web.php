<?php
use Illuminate\Support\Facades\Route;

//Route::middleware('cors')->group(function () {
//    // Tus rutas protegidas por CORS aquí
//});

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test', function () {
    return response()->json(['message' => 'Conexión exitosa con Laravel'], 200);
});
