// frontend/src/components/tables/MessagesTable.jsx
import React, { useEffect, useState } from 'react';
import { getMessages, deleteMessage } from '../../services/messageService';

export default function MessagesTable() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const data = await getMessages();
    setMessages(data);
  };

  const handleDelete = async (id) => {
    await deleteMessage(id);
    loadMessages();
  };

  const getSentimentLabel = (toxicity) => {
    return toxicity === 0 ? "Positive" : "Negative";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-purple-700 text-white">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Text</th>
            <th className="px-4 py-2">Sentiment</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id} className="text-center border-b dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900">
              <td className="px-4 py-2">{msg.id}</td>
              <td className="px-4 py-2">{msg.text}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${msg.toxicity === 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {getSentimentLabel(msg.toxicity)}
                </span>
              </td>
              <td className="px-4 py-2">
                <button className="text-blue-500 mx-2">Edit</button>
                <button
                  className="text-red-500 mx-2"
                  onClick={() => handleDelete(msg.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
