import React from 'react';

const CardKPI = ({ title, value }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h2>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

export default CardKPI;
