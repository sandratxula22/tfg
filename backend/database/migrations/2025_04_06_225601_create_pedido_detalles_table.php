<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pedido_detalles', function (Blueprint $table) {
            $table->id();
            $table->decimal('precio', 8, 2);
            $table->foreignId('id_pedido')->constrained('pedidos');
            $table->foreignId('id_libro')->constrained('libros');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pedido_detalles');
    }
};
