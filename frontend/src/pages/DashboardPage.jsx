// frontend/src/pages/DashboardPage.jsx
import React from 'react';
import CardKPI from '../components/cards/CardKPI';
import ChartToxicity from '../components/charts/ChartToxicity';
import ProfileCard from "../components/cards/ProfileCard";
import ChartCategories from '../components/charts/ChartCategories';
import ChartRoles from '../components/charts/ChartRoles';
import ChartTopWords from '../components/charts/ChartTopWords';
import ChartToxicityOverTime from '../components/charts/ChartToxicityOverTime';

const DashboardPage = () => {
  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-purple-700 dark:text-purple-400">
          Control Panel
        </h1>
        {/* Here you could place a profile button or notifications */}
      </header>

      {/* Content */}
      <main className="flex flex-1 overflow-hidden p-6 space-x-6">
        {/* KPI sidebar */}
        <aside className="w-72 flex flex-col space-y-6">
          <CardKPI title="Toxicity %" value="27%" />
          <CardKPI title="Total Messages" value="1,250" />
          <CardKPI title="Avg Response Time" value="2.3h" />
        </aside>

        {/* Main charts and profile panel */}
        <section className="flex-1 flex flex-col space-y-6 overflow-auto">
          <ProfileCard />
          <ChartToxicity />
          <ChartCategories />
          <ChartRoles />
          <ChartTopWords />
          <ChartToxicityOverTime />
          {/* Add additional charts or widgets here */}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
