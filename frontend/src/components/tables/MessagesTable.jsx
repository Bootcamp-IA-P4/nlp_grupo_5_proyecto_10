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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Text</th>
            <th className="px-4 py-2">Toxicity</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id} className="text-center border-b dark:border-gray-700">
              <td>{msg.id}</td>
              <td>{msg.text}</td>
              <td>{msg.toxicity}</td>
              <td>
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