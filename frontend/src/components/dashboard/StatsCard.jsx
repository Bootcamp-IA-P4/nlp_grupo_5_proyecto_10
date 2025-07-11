import React from "react";

const StatsCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        <div
          className={`${colorClasses[color]} rounded-full p-3 text-white text-xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
