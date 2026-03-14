import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationList = ({ conversations = [], selectedId, onSelect, currentUser }) => {
  const getOtherUser = (conv) => {
    if (!currentUser) return null;
    return conv.users.find(u => u.id !== currentUser.id);
  };

  return (
    <ul className="divide-y">
      {conversations.map(conv => {
        const other = getOtherUser(conv);
        const lastMessage = conv.lastMessage;
        return (
          <li
            key={conv.id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedId === conv.id ? 'bg-indigo-50' : ''
            }`}
            onClick={() => onSelect(conv)}
          >
            <div className="flex items-center gap-3">
              <img
                src={other?.photo ? `/storage/${other.photo}` : '/default-avatar.png'}
                alt={other?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{other?.name}</p>
                {lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage.user_id === currentUser?.id ? 'Vous : ' : ''}
                    {lastMessage.content}
                  </p>
                )}
              </div>
              {lastMessage && (
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true, locale: fr })}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ConversationList;