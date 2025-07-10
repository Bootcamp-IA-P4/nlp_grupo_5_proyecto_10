import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartCategories = () => {
  const data = {
    labels: ['Toxic', 'Neutral', 'Positive'],
    datasets: [
      {
        label: 'Categories',
        data: [300, 500, 200],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',    // red-500
          'rgba(107, 114, 128, 0.7)',  // gray-500
          'rgba(34, 197, 94, 0.7)'     // green-500
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#fff', // Adjust for dark mode if needed
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Message Categories</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ChartCategories;