import React, { useState } from "react";

const MessageFilters = ({ onFiltersChange, onClear }) => {
  const [filters, setFilters] = useState({
    sentiment: "",
    source: "",
    confidence_min: "",
    confidence_max: "",
    search_text: "",
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      sentiment: "",
      source: "",
      confidence_min: "",
      confidence_max: "",
      search_text: "",
    };
    setFilters(clearedFilters);
    onClear();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
        🔍 Filters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Text
          </label>
          <input
            type="text"
            placeholder="Search in messages..."
            value={filters.search_text}
            onChange={(e) => handleFilterChange("search_text", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sentiment
          </label>
          <select
            value={filters.sentiment}
            onChange={(e) => handleFilterChange("sentiment", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Sentiments</option>
            <option value="toxic">🔴 Toxic</option>
            <option value="not toxic">🟢 Not Toxic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange("source", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Sources</option>
            <option value="youtube">📺 YouTube</option>
            <option value="manual">✍️ Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Confidence
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            placeholder="0.0"
            value={filters.confidence_min}
            onChange={(e) =>
              handleFilterChange("confidence_min", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <button
            onClick={handleClear}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageFilters;
