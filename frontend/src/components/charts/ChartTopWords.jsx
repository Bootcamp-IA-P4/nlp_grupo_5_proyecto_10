// frontend/src/components/charts/ChartTopWords.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartTopWords = () => {
  const data = {
    labels: ['stupid', 'idiot', 'trash', 'noob', 'hate', 'kill'],
    datasets: [
      {
        label: 'Frequency',
        data: [65, 59, 80, 81, 56, 45],
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Toxic Words',
        color: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: '#444' },
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: '#444' },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Top Toxic Words</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ChartTopWords;
