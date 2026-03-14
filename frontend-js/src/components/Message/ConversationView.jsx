import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationView = ({ conversation, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  console.log("CurrentUser", currentUser);
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/conversations/${conversation.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/conversations/${conversation.id}/messages`, {
        content: newMessage,
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      onNewMessage(response.data);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const otherUser = conversation.users.find(u => u.id !== currentUser?.id);

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="p-4 border-b flex items-center gap-3">
        <img
          src={otherUser?.photo ? `/storage/${otherUser.photo}` : '/default-avatar.png'}
          alt={otherUser?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-semibold">{otherUser?.name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">Aucun message. Commencez la conversation !</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.user_id === currentUser?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.user_id === currentUser?.id ? 'text-indigo-200' : 'text-gray-500'
                }`}>
                  {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ConversationView;