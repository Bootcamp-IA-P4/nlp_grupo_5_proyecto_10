// frontend/src/components/charts/ChartRoles.jsx
import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const ChartRoles = () => {
  const data = {
    labels: ['Admin', 'Moderator', 'User', 'Bot', 'Guest'],
    datasets: [
      {
        label: 'Roles',
        data: [300, 225, 240, 260, 220],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',    // red-500
          'rgba(59, 130, 246, 0.7)',   // blue-500
          'rgba(234, 179, 8, 0.7)',    // yellow-500
          'rgba(16, 185, 129, 0.7)',   // emerald-500
          'rgba(107, 114, 128, 0.7)'   // gray-500
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(107, 114, 128, 1)'
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
    scales: {
      r: {
        grid: {
          color: '#444',
        },
        pointLabels: {
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Roles Distribution</h2>
      <PolarArea data={data} options={options} />
    </div>
  );
};

export default ChartRoles;
