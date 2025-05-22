<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('carrito_detalles', function (Blueprint $table) {
            $table->id();
            $table->decimal('precio', 8, 2);
            $table->foreignId('id_carrito')->constrained('carritos');
            $table->foreignId('id_libro')->constrained('libros');
            $table->timestamp('reservado_hasta')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('carrito_detalles');
    }
};
