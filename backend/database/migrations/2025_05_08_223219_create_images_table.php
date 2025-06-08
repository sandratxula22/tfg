<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('libro_id');
            $table->string('url');
            $table->timestamps();

            $table->foreign('libro_id')->references('id')->on('libros')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};