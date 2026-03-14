import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const url = 'http://localhost:8000/api';

const ReinscriptionCfp = ({ show, handleclose, initialMatricule = '', onReinscriptionSuccess }) => {
  const [matricule, setMatricule] = useState(initialMatricule);
  const [student, setStudent] = useState(null);
  const [formationChoisie, setFormationChoisie] = useState('');
  const [anneeEtude, setAnneeEtude] = useState('');
  const [anneeScolaire, setAnneeScolaire] = useState('');
  const [dateInscription, setDateInscription] = useState(new Date().toISOString().split('T')[0]);
  const [formations, setFormations] = useState([]); // Liste des formations de 2 ans
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Récupérer la liste des formations (parcours) au montage, mais seulement celles de 2 ans
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get(`${url}/parcours`);
        // Filtrer pour ne garder que les formations de 2 ans
        const formationsDeuxAns = (response.data || []).filter(f => f.duree === '2 ans');
        setFormations(formationsDeuxAns);
      } catch (err) {
        console.error('Erreur chargement formations:', err);
        setError('Impossible de charger la liste des formations');
      }
    };
    fetchFormations();
  }, []);

  // Rechercher un apprenant par matricule
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!matricule.trim()) {
      setError('Veuillez saisir un matricule');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setFormationChoisie('');
    setAnneeEtude('');
    setAnneeScolaire('');

    try {
      const response = await axios.get(`${url}/personne/matricule/${matricule.trim()}`);
      const data = response.data;
      console.log('Données reçues :', data);
      setStudent(data);
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
    return years.reverse();
  };

  // Déterminer si la formation choisie est de 2 ans (toujours vrai ici, mais gardé pour cohérence)
  const formationSelectionnee = formations.find(f => f.nomformation === formationChoisie);
  const estDeuxAns = formationSelectionnee?.duree === '2 ans'; // sera toujours true

  // Soumettre la réinscription
  const handleReinscription = async (e) => {
    e.preventDefault();
    if (!student) return;
    if (!formationChoisie) {
      setError('Veuillez choisir une formation');
      return;
    }
    // L'année d'étude est toujours requise car formation de 2 ans
    if (!anneeEtude) {
      setError('Veuillez préciser l\'année d\'étude (1ère ou 2ème)');
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
      // Appel à l'API de réinscription formation
      const response = await axios.post(`${url}/reinscrirecfp`, {
        matricule: student.matricule,
        annee_scolaire: anneeScolaire,
        nouveau_nom_formation: formationChoisie,
        nouvelle_annee_etude: anneeEtude,
        date_inscription: dateInscription,
      });

      console.log("Donneeeeeess: ", response); 
      Swal.fire({
        icon: "success",
        text: `Réinscription réussie pour ${student.nom} ${student.prenom} à la formation ${formationChoisie} (${anneeEtude}) pour l'année ${anneeScolaire}`,
        background: '#1e1e2f',
        color: "white",
        showConfirmButton: true,
      });

      if (onReinscriptionSuccess) {
        onReinscriptionSuccess(response.data);
      }

      // Réinitialiser le formulaire
      setFormationChoisie('');
      setAnneeEtude('');
      setAnneeScolaire('');
      setDateInscription(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={show ? 'block' : 'hidden'}>
      <div className="bg-gray-100 z-[999] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-5 bg-indigo-600 p-3 rounded">
            <h2 className="text-3xl text-center font-bold text-white">
              Réinscription d'un apprenant (CFP)
            </h2>
            <button
              onClick={handleclose}
              className="text-red-500 hover:text-red-700 text-5xl font-bold"
            >
              &times;
            </button>
          </div>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="matricule" className="block text-sm font-bold text-gray-700">
                Matricule de l'apprenant
              </label>
              <input
                type="text"
                id="matricule"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full p-2 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Ex: 26/INF/01"
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

          {/* Informations de l'apprenant trouvé */}
          {student && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 py-5 px-5">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Apprenant trouvé
              </h3>
              <div className="space-y-2 text-sm text-gray-600 p-2">
                <p>
                  <span className="font-semibold text-gray-700">Matricule :</span>{' '}
                  {student.matricule}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Nom et Prenom(s):</span>{' '}
                  {student.personne?.nom} {student.personne?.prenom}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Formation(s) actuelle(s) :</span>{' '}
                  {student.inscriptionformation?.parcours?.nomformation || 'Non inscrit en formation'}
                </p>
              </div>

              {/* Formulaire de réinscription */}
              <form onSubmit={handleReinscription} className="mt-4 space-y-4">
                {/* Sélection de la formation (uniquement 2 ans) */}
                <div>
                  <label htmlFor="formation" className="block text-sm font-semibold text-gray-700">
                    Nouvelle formation
                  </label>
                  <select
                    id="formation"
                    value={formationChoisie}
                    onChange={(e) => {
                      setFormationChoisie(e.target.value);
                      setAnneeEtude(''); // réinitialiser quand on change de formation
                    }}
                    disabled={loading || formations.length === 0}
                    className="mt-1 block w-full p-2 rounded-md text-center border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">--- Choisir la formation ---</option>
                    {formations.map((f) => (
                      <option key={f.code_formation} value={f.nomformation}>
                        {f.nomformation}
                      </option>
                    ))}
                  </select>
                  {formations.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Aucune formation de 2 ans disponible</p>
                  )}
                </div>

                {/* Année d'étude (toujours affiché car formation 2 ans) */}
                <div>
                  <label htmlFor="anneeEtude" className="block text-sm font-semibold text-gray-700">
                    Année d'étude
                  </label>
                  <select
                    id="anneeEtude"
                    value={anneeEtude}
                    onChange={(e) => setAnneeEtude(e.target.value)}
                    disabled={loading}
                    className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">--- Choisir l'année ---</option>
                    <option value="1ere année">1ère année</option>
                    <option value="2eme année">2ème année</option>
                  </select>
                </div>

                {/* Année scolaire */}
                <div>
                  <label htmlFor="anneeScolaire" className="block text-sm font-semibold text-gray-700">
                    Année scolaire <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="anneeScolaire"
                    value={anneeScolaire}
                    onChange={(e) => setAnneeScolaire(e.target.value)}
                    disabled={loading}
                    className="mt-1 block w-full p-2 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    required
                  >
                    <option value="">--- Choisir l'année scolaire ---</option>
                    {generateAnnee().map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>

                {/* Date d'inscription */}
                <div>
                  <label htmlFor="dateInscription" className="block text-sm font-semibold text-gray-700">
                    Date d'inscription
                  </label>
                  <input
                    type="date"
                    id="dateInscription"
                    value={dateInscription}
                    onChange={(e) => setDateInscription(e.target.value)}
                    disabled={loading}
                    className="mt-1 block w-full p-2 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
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
    </div>
  );
};

export default ReinscriptionCfp;