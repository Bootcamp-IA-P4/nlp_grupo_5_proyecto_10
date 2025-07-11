import React from "react";

const ConfidenceStars = ({ sentiment, confidence }) => {
  // Convert confidence to star rating (1-5)
  const getStarRating = (sentiment, confidence) => {
    if (sentiment === "toxic") {
      // For toxic messages: 1-3 stars based on confidence
      if (confidence >= 0.8) return 1; // Very toxic
      if (confidence >= 0.6) return 2; // Toxic
      return 3; // Probably toxic
    } else {
      // For not toxic messages: 3-5 stars based on confidence
      if (confidence >= 0.8) return 5; // Very safe
      if (confidence >= 0.6) return 4; // Safe
      return 3; // Probably safe
    }
  };

  const getStarLabel = (sentiment, confidence) => {
    if (sentiment === "toxic") {
      if (confidence >= 0.8) return "Very Toxic";
      if (confidence >= 0.6) return "Toxic";
      return "Probably Toxic";
    } else {
      if (confidence >= 0.8) return "Very Safe";
      if (confidence >= 0.6) return "Safe";
      return "Probably Safe";
    }
  };

  const getStarColor = (sentiment) => {
    return sentiment === "toxic" ? "text-red-500" : "text-green-500";
  };

  const starRating = getStarRating(sentiment, confidence || 0);
  const starLabel = getStarLabel(sentiment, confidence || 0);
  const starColor = getStarColor(sentiment);

  return (
    <div className="flex flex-col items-center">
      <div className={`flex ${starColor}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= starRating ? "opacity-100" : "opacity-20"
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {starLabel}
      </span>
      {confidence && (
        <span className="text-xs text-gray-500 dark:text-gray-500">
          ({(confidence * 100).toFixed(1)}%)
        </span>
      )}
    </div>
  );
};

export default ConfidenceStars;
