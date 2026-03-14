import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

const NewConversationModal = ({ show, onClose, onConversationCreated, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && currentUser) {
      fetchUsers();
    } 
    else {
      setUsers([]);
    }
  }, [show,currentUser]);

  const fetchUsers = async () => {
    try {
        const response = await axios.get('/api/users');
        console.log('Réponse API users: ', response);
        const usersList = Array.isArray(response.data) ? response.data : [];
        // Filtrer avec currentUser (prop) plutôt que localStorage
        const filtered = usersList.filter(u => u.id !== currentUser?.id);
        setUsers(filtered);
    } 
    catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        Swal.fire('Erreur', 'Impossible de charger la liste des utilisateurs.', 'error');
    }
    };

  const handleToggleUser = (userId) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Erreur', 'Sélectionnez au moins un utilisateur', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/conversations', {
        user_ids: selectedIds,
      });
      onConversationCreated(response.data);
      onClose();
      setSelectedIds([]);
    } catch (error) {
      console.error('Erreur création conversation:', error);
      Swal.fire('Erreur', 'Impossible de créer la discussion', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Nouvelle discussion</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto border rounded p-2">
          {users.length === 0 ? (
            <p className="text-center text-gray-500">Aucun utilisateur disponible</p>
          ) : (
            users.map(user => (
              <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => handleToggleUser(user.id)}
                  className="rounded"
                />
                <img
                  src={user.photo ? `/storage/${user.photo}` : '/default-avatar.png'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <span>{user.name}</span>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedIds.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;