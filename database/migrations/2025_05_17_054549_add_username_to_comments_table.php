<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */

     public function up()
{
    Schema::table('comments', function (Illuminate\Database\Schema\Blueprint $table) {
        $table->string('username')->nullable(); // or remove nullable() if you want it required
    });
}

public function down()
{
    Schema::table('comments', function (Illuminate\Database\Schema\Blueprint $table) {
        $table->dropColumn('username');
    });
}

};
