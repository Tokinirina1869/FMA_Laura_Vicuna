import React, { useState, useEffect } from 'react';
import axios from 'axios';

const url = 'http://localhost:8000/api';

const ReinscriptionLycee = ({ show, handleclose, initialMatricule ='', onReinscriptionSuccess }) => {
  // États
  const [mat, setMat] = useState(initialMatricule);

  const [matricule, setMatricule] = useState('');
  const [student, setStudent] = useState(null);
  const [newLevelCode, setNewLevelCode] = useState('');
  const [anneeScolaire, setAnneeScolaire] = useState('');
  const [classe, setClasse] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger la liste des niveaux depuis l'API
  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const response = await axios.get(`${url}/niveau`);
        if (response.data?.data && Array.isArray(response.data.data)) {
          setNiveaux(response.data.data);
        } else {
          console.error('Format inattendu des niveaux:', response.data);
          setError('Format de données invalide pour les niveaux');
        }
      } catch (err) {
        console.error('Erreur chargement niveaux:', err);
        setError('Impossible de charger la liste des niveaux');
      }
    };
    setMat(initialMatricule);
    fetchNiveaux();
  }, [initialMatricule]);

  // Rechercher une inscription par matricule
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!matricule.trim()) {
      setError('Veuillez saisir un matricule');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setNewLevelCode('');
    setAnneeScolaire('');
    setClasse('');

    try {
      const response = await axios.get(`${url}/personne/matricule/${matricule.trim()}`);
      const data = response.data; // C'est l'objet Inscription
      console.log('Données reçues :', data);

      setStudent(data);
      // Pré-sélectionner le niveau actuel s'il existe
      if (data.inscriptionacademique?.niveau?.code_niveau) {
        setNewLevelCode(data.inscriptionacademique.niveau.code_niveau);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Générer années scolaires
  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    return years.reverse(); // Afficher l'année la plus récente en premier
  };

  // Valider la réinscription (création d'une nouvelle inscription)
  const handleReinscription = async (e) => {
    e.preventDefault();
    if (!student) return;
    if (!newLevelCode) {
      setError('Veuillez sélectionner un niveau');
      return;
    }
    if (!anneeScolaire.trim()) {
      setError('Veuillez saisir l\'année scolaire');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Appel à l'API de réinscription
      const response = await axios.post(`${url}/reinscrire`, {
        matricule: student.matricule,
        nouveau_code_niveau: newLevelCode,
        annee_scolaire: anneeScolaire,
        classe: classe || null, // envoyer null si vide
      });

      // La réponse peut contenir la nouvelle inscription ou l'objet reinscription
      // Supposons que le backend renvoie { message, reinscription } avec reinscription.inscription
      const nouvelleInscription = response.data.reinscription?.inscription || response.data.inscription;
      
      if (nouvelleInscription) {
        setStudent(nouvelleInscription);
        // Mettre à jour le niveau pré-sélectionné avec le nouveau
        if (nouvelleInscription.inscriptionacademique?.niveau?.code_niveau) {
          setNewLevelCode(nouvelleInscription.inscriptionacademique.niveau.code_niveau);
        }
      }

      setSuccess(
        `Réinscription réussie pour ${student.personne?.prenom} ${student.personne?.nom} au niveau ${response.data.reinscription?.nouveau_niveau?.nomniveau || newLevelCode} pour l'année ${anneeScolaire}`
      );

      if(onReinscriptionSuccess) {
        onReinscriptionSuccess(response.data);
      }

      setAnneeScolaire('');
      setClasse('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div show={show} className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Réinscription d'un élève
        </h2>

        {/* Formulaire de recherche */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
              Matricule de l'élève
            </label>
            <input
              type="text"
              id="matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ex: 26/LYC/87"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Informations de l'élève trouvé */}
        {student && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Élève trouvé
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">Matricule :</span>{' '}
                {student.matricule}
              </p>
              <p>
                <span className="font-medium text-gray-700">Nom :</span>{' '}
                {student.personne?.nom}
              </p>
              <p>
                <span className="font-medium text-gray-700">Prénom :</span>{' '}
                {student.personne?.prenom}
              </p>
              <p>
                <span className="font-medium text-gray-700">Niveau actuel :</span>{' '}
                {student.inscriptionacademique?.niveau?.nomniveau || 'Non défini'}
              </p>
            </div>

            {/* Formulaire de réinscription */}
            <form onSubmit={handleReinscription} className="mt-4 space-y-4">
              <div>
                <label htmlFor="newLevel" className="block text-sm font-medium text-gray-700">
                  Nouveau niveau
                </label>
                <select
                  id="newLevel"
                  value={newLevelCode}
                  onChange={(e) => setNewLevelCode(e.target.value)}
                  disabled={loading || niveaux.length === 0}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">--- Sélectionner un niveau ---</option>
                  {niveaux.map((niveau) => (
                    <option key={niveau.code_niveau} value={niveau.code_niveau}>
                      {niveau.nomniveau}
                    </option>
                  ))}
                </select>
              </div>

              {/* Champ Année scolaire */}
              <div>
                <label htmlFor="anneeScolaire" className="block text-sm font-medium text-gray-700">
                  Année scolaire <span className="text-red-500">*</span>
                </label>
                <select
                  type="text"
                  id="anneeScolaire"
                  value={anneeScolaire}
                  onChange={(e) => setAnneeScolaire(e.target.value)}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  placeholder="Ex: 2026-2027"
                  required
                >
                  <option value="">--- Choisir l'année scolaire ---</option>
                  {generateAnnee().map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Traitement...' : 'Confirmer la réinscription'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReinscriptionLycee;