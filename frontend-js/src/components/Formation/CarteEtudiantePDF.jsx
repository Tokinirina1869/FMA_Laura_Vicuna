import React, { useRef } from 'react';
import { 
  FaTimes,
  FaPrint,
} from "react-icons/fa";
import fma from '../../../public/laura.jpg';

const CarteEtudiantePDF = ({ student, onClose, onPrint }) => {
  const cardRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non renseigné";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      {/* Overlay pour fermer */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Conteneur principal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* En-tête modal */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-2xl flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Carte d'Étudiant - Prévisualisation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl transition"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Options de personnalisation */}
          <div className="mb-6 bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3">Options d'impression :</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Imprimer en couleur</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Format A6 (Carte étudiante)</span>
              </label>
            </div>
          </div>

          {/* Prévisualisation de la carte - DESIGN SIMPLIFIÉ */}
          <div className="flex justify-center">
            <div 
              ref={cardRef}
              className="w-[85mm] h-[54mm] bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden relative"
              style={{ 
                transform: 'scale(1.5)',
                margin: '40px 0'
              }}
            >
              {/* En-tête de la carte */}
              <div className="bg-blue-800 text-white py-3 px-4 text-center border-b-2 border-blue-900">
                <div className="flex items-center justify-center mb-1">
                  <img 
                    src={fma} 
                    alt="FMA" 
                    className="w-6 h-6 mr-2 object-contain"
                  />
                  <h2 className="text-sm font-bold">CENTRE DE FORMATION PROFESSIONNELLE</h2>
                </div>
                <p className="text-[9px] font-medium">FMA Anjarasoa Ankofafa Fianarantsoa</p>
              </div>

              {/* Ligne de séparation */}
              <div className="h-[1px] bg-gray-400 mx-4"></div>

              {/* Corps de la carte */}
              <div className="p-3">
                {/* Nom et formation */}
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-800 uppercase">
                    {student?.inscription?.personne?.nom || ''} {student?.inscription?.personne?.prenom || ''}
                  </h3>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {student?.parcours && student.parcours.length > 0 
                        ? student.parcours[0].nomformation 
                        : student?.niveau?.nomniveau || "---"}
                    </span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-sm text-gray-600">
                      {student?.inscription?.anneesco || '2024-2025'}
                    </span>
                  </div>
                </div>

                {/* Informations en colonnes */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {/* Colonne gauche */}
                  <div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-600">Matricule:</span>
                      <span className="ml-1 text-gray-800 font-medium">
                        {student?.inscription?.personne?.matricule || 'N/A'}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-600">Nom:</span>
                      <span className="ml-1 text-gray-800 font-medium">
                        {student?.inscription?.personne?.nom || 'N/A'}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-600">Prénom(s):</span>
                      <span className="ml-1 text-gray-800 font-medium">
                        {student?.inscription?.personne?.prenom || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Colonne droite */}
                  <div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-600">Date de naissance:</span>
                      <span className="ml-1 text-gray-800 font-medium">
                        {formatDate(student?.inscription?.personne?.naiss)}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-600">Lieu:</span>
                      <span className="ml-1 text-gray-800 font-medium">
                        {student?.inscription?.personne?.lieunaiss || 'N/A'}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-600">CIN:</span>
                      <span className="ml-1 text-gray-800 font-medium">
                        {student?.inscription?.personne?.cin || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo (optionnelle, en bas à droite) */}
                {student?.inscription?.personne?.photo && (
                  <div className="absolute bottom-2 right-3">
                    <div className="w-12 h-16 border border-gray-300 rounded overflow-hidden">
                      <img
                        src={`http://localhost:8000/storage/${student.inscription.personne.photo}`}
                        alt="Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Dimensions: 85mm × 54mm (Format carte bancaire)</p>
            <p>Orientation: Portrait</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-2xl flex justify-center gap-4">
          <button
            onClick={onPrint}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 shadow-md"
          >
            <FaPrint className="w-5 h-5" />
            Générer le PDF
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold flex items-center gap-2"
          >
            <FaTimes className="w-5 h-5" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarteEtudiantePDF;