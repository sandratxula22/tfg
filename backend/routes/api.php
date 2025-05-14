<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\UsuarioController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/libros', [LibroController::class, 'showBooks']);
Route::get('/libros/{id}', [LibroController::class, 'showBookById']);


Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/admin/libros/delete/{id}', [LibroController::class, 'deleteBook']);
    Route::post('/admin/libros/edit/{id}', [LibroController::class, 'editBook']);
    Route::post('/admin/libros/create', [LibroController::class, 'createBook']);
    Route::post('/admin/libros/{libro_id}/upload-image', [LibroController::class, 'uploadImage']);
    Route::get('/admin/images', [LibroController::class, 'getImages']);
    Route::get('/admin/images/{id}', [LibroController::class, 'getImageById']);
    Route::delete('/admin/images/delete/{id}', [LibroController::class, 'deleteImage']);
    Route::post('/admin/images/edit/{id}', [LibroController::class, 'editImage']);

    Route::get('/admin/usuarios', [UsuarioController::class, 'getUsers']);
    Route::get('/admin/usuarios/{id}', [UsuarioController::class, 'getUserById']);
    Route::post('/admin/usuarios/create', [UsuarioController::class, 'createUser']);
    Route::delete('/admin/usuarios/delete/{id}', [UsuarioController::class, 'deleteUser']);
    Route::put('/admin/usuarios/edit/{id}', [UsuarioController::class, 'editUser']);
});
