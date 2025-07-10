// frontend/src/pages/MessagesPage.jsx
import React from 'react';
import MessageForm from '../components/forms/MessageForm';
import MessagesTable from '../components/tables/MessagesTable';

const MessagesPage = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-purple-800 dark:text-purple-300">Messages</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <MessageForm />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <MessagesTable />
      </div>
    </div>
  );
};

export default MessagesPage;
