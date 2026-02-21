<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
    {
        Schema::create('suiviformations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('no_inscrit');
            $table->string('code_formation', 50);
            $table->enum('statut_emploi', ['travaille', 'chomeur', 'auto-entrepreneur', 'autre'])->nullable();
            $table->enum('statut_etudes', ['poursuit_etudes', 'aucune_etude'])->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();

            $table->foreign('no_inscrit')->references('no_inscrit')->on('inscriptions')->onDelete('cascade');
            $table->foreign('code_formation')->references('code_formation')->on('parcours')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suiviformations');
    }
};
