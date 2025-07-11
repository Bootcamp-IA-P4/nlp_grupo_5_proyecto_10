// frontend/src/pages/MessagesPage.jsx
import React, { useState } from "react";
import MessageForm from "../components/forms/MessageForm";
import MessagesTable from "../components/tables/MessagesTable";

const MessagesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMessageSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-purple-800 dark:text-purple-300">
        Message Sentiment Analysis
      </h1>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Analyze New Message
          </h2>
          <MessageForm onSuccess={handleMessageSuccess} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Message History
          </h2>
          <MessagesTable refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
