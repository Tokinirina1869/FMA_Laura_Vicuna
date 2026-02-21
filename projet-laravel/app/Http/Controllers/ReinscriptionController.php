<?php

namespace App\Http\Controllers;

use App\Models\Inscription;
use App\Models\InscriptionAcademie;
use App\Models\Reinscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReinscriptionController extends Controller
{
    /**
     * Afficher la liste des réinscriptions (optionnel).
     */
    public function index()
    {
        $reinscriptions = Reinscription::with(['inscription.personne', 'ancienNiveau', 'nouveauNiveau', 'user'])->get();
        return response()->json($reinscriptions);
    }

    public function reinscrire(Request $request)
    {
        $request->validate([
            'matricule' => 'required|exists:personnes,matricule',
            'nouveau_code_niveau' => 'required|exists:niveaux,code_niveau',
            'annee_scolaire' => 'required|string',
        ]);

        // Récupérer l'ancienne inscription (la plus récente) pour obtenir l'ancien niveau
        $ancienneInscription = Inscription::where('matricule', $request->matricule)
                                ->latest('dateinscrit')
                                ->first();

        $ancienNiveau = $ancienneInscription?->inscriptionacademique?->niveau?->code_niveau;

        // Créer une nouvelle inscription pour la nouvelle année scolaire
        $nouvelleInscription = Inscription::create([
            'matricule' => $request->matricule,
            'dateinscrit' => now(),
            'anneesco' => $request->annee_scolaire,
        ]);

        // Créer l'inscription académique associée avec le nouveau niveau
        $inscriptionAcademie = InscriptionAcademie::create([
            'no_inscrit' => $nouvelleInscription->no_inscrit,
            'code_niveau' => $request->nouveau_code_niveau,
            'type_inscrit' => 'Réinscription', // ou autre valeur selon votre logique
        ]);

        // Enregistrer dans la table reinscriptions
        $reinscription = Reinscription::create([
            'no_inscrit' => $nouvelleInscription->no_inscrit,
            'ancien_code_niveau' => $ancienNiveau,
            'nouveau_code_niveau' => $request->nouveau_code_niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'user_id' => Auth::id(), 
        ]);

        // Charger les relations pour la réponse
        $reinscription->load(['inscription.personne', 'nouveauNiveau']);

        return response()->json([
            'message' => 'Réinscription effectuée avec succès',
            'reinscription' => $reinscription,
        ], 201);
    }

    /**
     * Mettre à jour une réinscription (rare, mais possible).
     */
    public function update(Request $request, $id)
    {
        $reinscription = Reinscription::find($id);
        if (!$reinscription) {
            return response()->json(['message' => 'Réinscription non trouvée'], 404);
        }

        $request->validate([
            'classe' => 'nullable|string|max:100',
            // autres champs si nécessaire
        ]);

        $reinscription->update($request->only('classe'));

        return response()->json([
            'message' => 'Réinscription mise à jour',
            'reinscription' => $reinscription,
        ]);
    }

    /**
     * Supprimer une réinscription (optionnel).
     */
    public function destroy($id)
    {
        $reinscription = Reinscription::find($id);
        if (!$reinscription) {
            return response()->json(['message' => 'Réinscription non trouvée'], 404);
        }

        $reinscription->delete();
        return response()->json(['message' => 'Réinscription supprimée']);
    }
}