import React from "react";
import ConfidenceStars from "../common/ConfidenceStars";

const RecentMessages = ({ messages }) => {
  const getSentimentStyle = (sentiment) => {
    return sentiment === "not toxic"
      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
  };

  const getSentimentLabel = (sentiment) => {
    return sentiment === "not toxic" ? "Safe" : "Toxic";
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No recent messages
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start space-x-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  {message.text}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentStyle(
                      message.sentiment
                    )}`}
                  >
                    {getSentimentLabel(message.sentiment)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {message.created_at && formatTime(message.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ConfidenceStars
                  sentiment={message.sentiment}
                  confidence={message.confidence}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentMessages;
