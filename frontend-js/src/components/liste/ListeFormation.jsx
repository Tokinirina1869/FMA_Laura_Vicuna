import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import AffichageFormation from "../Formation/AffichageFormation";
import NouvellePersonne from "../modals/NouvellePersonne";
import ModificationInscription from "../modals/ModificationInscription";
import axios from "axios";
import { FaGraduationCap } from "react-icons/fa";
const url = "http://127.0.0.1:8000/api";

const ListeFormation = ({ onViewDashPro }) => {
  const [showPersonne, setShowPersonne] = useState(false);
  const [showModification, setShowModification] = useState(false);
  const [selectedPersonne, setSelectedPersonne] = useState(null);
  const [formationsData, setFormationsData] = useState([]);
  
  const openNewPersonne = () => setShowPersonne(true);
  const closeNewPersonne = () => setShowPersonne(false); 

  const openModification = (personne) => {
    setSelectedPersonne(personne);
    setShowModification(true);
  };
  const closeModification = () => {
    setShowModification(false);
    setSelectedPersonne(null);
  };

  const fetchFormations = async () => {
    try {
      const response = await axios.get(`${url}/inscriptionComplete`); 
      
      if (response.data && response.data.data) {
        setFormationsData(response.data.data); 
      } else {
        setFormationsData([]);
      }
    } catch (err) {
      console.error("Erreur chargement formations :", err);
    }
  };

  // Charger toutes les données au démarrage
  useEffect(() => {
    fetchFormations();
  }, []);

  return (
    <div className="mt-5 flex flex-col min-h-screen">

      <div className="shadow p-4 md:p-6 flex items-center justify-between">
        <button onClick={onViewDashPro} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-8 h-8 text-indigo-600" />
        </button>

        <div className="flex items-center text-xl md:text-2xl font-bold space-x-3 mb-6">
          <FaGraduationCap className="w-8 h-8 text-indigo-600" />
          <h5 className="font-bold">Centre de la Formation Professionnelle FMA Laura Vicuna Anjarasoa Ankofafa</h5>
        </div>

        <button onClick={openNewPersonne} className="flex items-center gap-1 px-2 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Nouvelle Inscription
        </button>
        <button onClick={openNewPersonne} className="flex items-center gap-1 px-2 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Réinscription
        </button>
      </div>

      <div className="p-4 md:p-6 flex-1">
        {/* Passer les données mises à jour et la fonction d'édition */}
        <AffichageFormation formations={formationsData} onEdit={openModification}/>
      </div>

      <ModificationInscription 
        show={showModification} 
        handleClose={closeModification} 
        personneData={selectedPersonne} 
        refreshList={fetchFormations}
      />

      <NouvellePersonne 
        show={showPersonne}  
        handleClose={closeNewPersonne}
        refreshList={fetchFormations} 
      />
    </div>
  );
};

export default ListeFormation;