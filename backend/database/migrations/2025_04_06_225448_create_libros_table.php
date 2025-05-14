<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('libros', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('autor');
            $table->string('genero');
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 8, 2);
            $table->boolean('disponible')->default(true);
            $table->string('imagen_portada');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('libros');
    }
};
