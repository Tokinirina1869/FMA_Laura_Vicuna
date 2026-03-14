<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inscrit_formations', function (Blueprint $table) {
            $table->string('annee_etude')->nullable()->after('duree');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscrit_formations', function (Blueprint $table) {
            $table->dropColumn('annee_etude');
        });
    }
};
