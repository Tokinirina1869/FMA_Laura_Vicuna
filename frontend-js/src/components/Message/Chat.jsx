import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import NewConversationModal from './NewConversationModal';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [currentUser, setCurrentUser] = useState(null);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('/api/conversations');
            console.log('Conversations response:', response.data); // Pour déboguer
            // Si la réponse est un objet avec une propriété data, utilisez response.data.data
            // Sinon, assurez-vous que c'est un tableau
            const data = Array.isArray(response.data) ? response.data : [];
            setConversations(data);
        } catch (error) {
            console.error('Erreur chargement conversations:', error);
            setConversations([]); // En cas d'erreur, on met un tableau vide
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchConversations();
    }, []);

    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        // Optionnel: marquer comme lu
        axios.post(`/api/conversations/${conv.id}/read`);
    };

    const handleNewMessage = (message) => {
        // Mettre à jour la liste des conversations (dernier message)
        setConversations(prev => prev.map(c => 
        c.id === message.conversation_id 
            ? { ...c, lastMessage: message } 
            : c
        ));
    };

  return (
    <div className="flex h-screen">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Discussions</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Nouvelle discussion
          </button>
        </div>
        {loading ? (
          <p className="p-4">Chargement...</p>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id}
            onSelect={handleSelectConversation}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Zone de conversation */}
      <div className="w-2/3">
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sélectionnez une discussion
          </div>
        )}
      </div>

      {/* Modal nouvelle conversation */}
      <NewConversationModal
        show={showNewModal}
        onClose={() => setShowNewModal(false)}
        onConversationCreated={(conv) => {
          setConversations(prev => [conv, ...prev]);
          setSelectedConversation(conv);
        }}

        currentUser={currentUser}
      />
    </div>
  );
};

export default Chat;