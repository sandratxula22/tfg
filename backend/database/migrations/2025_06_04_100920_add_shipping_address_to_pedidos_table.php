<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddShippingAddressToPedidosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('nombre_envio')->nullable();
            $table->string('apellidos_envio')->nullable();
            $table->string('direccion_envio')->nullable();
            $table->string('ciudad_envio')->nullable();
            $table->string('codigo_postal_envio')->nullable();
            $table->string('pais_envio', 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn([
                'nombre_envio',
                'apellidos_envio',
                'direccion_envio',
                'ciudad_envio',
                'codigo_postal_envio',
                'pais_envio'
            ]);
        });
    }
}