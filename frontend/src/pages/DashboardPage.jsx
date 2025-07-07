import React from 'react';
import CardKPI from '../components/cards/CardKPI';
import ChartToxicity from '../components/charts/ChartToxicity';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-300">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardKPI title="Toxicity %" value="27%" />
        <CardKPI title="Total Messages" value="1,250" />
        <CardKPI title="Avg Response Time" value="2.3h" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartToxicity />
      </div>
    </div>
  );
};

export default DashboardPage;
