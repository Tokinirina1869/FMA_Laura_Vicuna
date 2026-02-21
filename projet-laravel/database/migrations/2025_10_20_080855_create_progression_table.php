<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progressions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('suivre_id');
            $table->string('module'); 
            $table->enum('statut', ['non_commencé', 'en_cours', 'terminé', 'validé'])->default('non_commencé');
            $table->integer('note')->nullable();
            $table->timestamps();

            $table->foreign('suivre_id')->references('id')->on('suivres')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progressions');
    }
};
