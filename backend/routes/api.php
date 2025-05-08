<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LibroController;

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

Route::middleware('auth:sanctum')->delete('/admin/libros/delete/{id}', [LibroController::class, 'deleteBook']);
Route::middleware('auth:sanctum')->put('/admin/libros/edit/{id}', [LibroController::class, 'editBook']);
Route::middleware('auth:sanctum')->post('/admin/libros/create', [LibroController::class, 'createBook']);
Route::middleware('auth:sanctum')->post('/admin/libros/{libro_id}/upload-image', [LibroController::class, 'uploadImage']);