import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mon', toxicity: 20 },
  { date: 'Tue', toxicity: 25 },
  { date: 'Wed', toxicity: 22 },
  { date: 'Thu', toxicity: 30 },
  { date: 'Fri', toxicity: 28 },
];

const ChartToxicity = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 shadow rounded">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Toxicity % Over Time</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#8884d8" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="toxicity" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartToxicity;
