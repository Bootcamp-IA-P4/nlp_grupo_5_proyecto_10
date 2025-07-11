// frontend/src/pages/MessagesPage.jsx
import React, { useState } from "react";
import MessageForm from "../components/forms/MessageForm";
import MessagesTable from "../components/tables/MessagesTable";
import YouTubeAnalysisForm from "../components/forms/YouTubeAnalysisForm";

const MessagesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [youtubeComments, setYoutubeComments] = useState([]);

  const handleMessageSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleYouTubeCommentsLoaded = (data) => {
    setYoutubeComments(data.comentarios || []);
    console.log("YouTube comments loaded:", data);
    // TODO: Here we'll later analyze and save these comments to the database
  };

  const handleYouTubeAnalysisComplete = (data) => {
    console.log("YouTube analysis complete:", data);
    // Optionally show success message or update UI
  };

  const handleRefreshMessages = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-purple-800 dark:text-purple-300">
        Message Sentiment Analysis
      </h1>

      <div className="grid gap-6">
        {/* YouTube Comments Analysis Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <svg
              className="h-6 w-6 text-red-600 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube Comment Analysis & Database Integration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Extract, analyze, and save YouTube comments to your database. Get
            sentiment analysis for each comment with confidence ratings and
            toxicity detection.
          </p>
          <YouTubeAnalysisForm
            onAnalysisComplete={handleYouTubeAnalysisComplete}
            onRefreshMessages={handleRefreshMessages}
          />
        </div>

        {/* Individual Message Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Analyze Individual Message
          </h2>
          <MessageForm onSuccess={handleMessageSuccess} />
        </div>

        {/* Message History */}
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
