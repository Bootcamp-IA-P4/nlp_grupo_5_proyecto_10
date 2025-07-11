// frontend/src/components/cards/ProfileCard.jsx

import React from "react";

const ProfileCard = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white w-full max-w-xl">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Toxicity NLP Model</h1>
        <span className="text-gray-400">Environment: Production</span>
      </div>

      <div className="mt-4">
        <h3 className="text-yellow-400 text-lg mb-2 border-b border-gray-600 pb-1">About</h3>
        <p className="text-sm text-gray-300">
          This model classifies messages for toxicity, obscenity, threats, and other harmful content in real-time to assist moderators and ensure a healthy community environment.
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
