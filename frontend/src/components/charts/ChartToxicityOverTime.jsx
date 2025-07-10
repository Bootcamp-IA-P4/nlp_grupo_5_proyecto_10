// frontend/src/components/charts/ChartToxicityOverTime.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartToxicityOverTime = () => {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Toxicity %',
        data: [23, 27, 25, 30, 28],
        fill: false,
        borderColor: 'rgba(139, 92, 246, 1)', // purple-500
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: 'Toxicity % Over Time',
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
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Toxicity % Over Time</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default ChartToxicityOverTime;
