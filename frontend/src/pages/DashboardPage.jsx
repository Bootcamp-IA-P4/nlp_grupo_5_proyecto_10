// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import CardKPI from "../components/cards/CardKPI";
import ChartToxicity from "../components/charts/ChartToxicity";
import ProfileCard from "../components/cards/ProfileCard";
import ChartCategories from "../components/charts/ChartCategories";
import ChartRoles from "../components/charts/ChartRoles";
import ChartTopWords from "../components/charts/ChartTopWords";
import ChartToxicityOverTime from "../components/charts/ChartToxicityOverTime";
import { getMessages } from "../services/messageService";
import StatsCard from "../components/dashboard/StatsCard";
import SentimentChart from "../components/dashboard/SentimentChart";
import RecentMessages from "../components/dashboard/RecentMessages";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    toxic: 0,
    notToxic: 0,
    accuracy: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const messages = await getMessages();

      // Calculate stats
      const total = messages.length;
      const toxic = messages.filter((msg) => msg.sentiment === "toxic").length;
      const notToxic = total - toxic;

      setStats({
        total,
        toxic,
        notToxic,
        accuracy:
          total > 0 ? (((notToxic + toxic) / total) * 100).toFixed(1) : 0,
      });

      // Get recent messages (last 5)
      setRecentMessages(messages.slice(-5).reverse());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-purple-600 dark:text-purple-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

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

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-purple-800 dark:text-purple-300 mb-2">
            NLP Sentiment Analysis Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and analyze message sentiment predictions in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Messages"
            value={stats.total}
            icon="📊"
            color="blue"
          />
          <StatsCard
            title="Toxic Messages"
            value={stats.toxic}
            icon="⚠️"
            color="red"
          />
          <StatsCard
            title="Safe Messages"
            value={stats.notToxic}
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Model Accuracy"
            value={`${stats.accuracy}%`}
            icon="🎯"
            color="purple"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Interactive Sentiment Visualization
            </h2>
            <SentimentChart
              toxic={stats.toxic}
              notToxic={stats.notToxic}
              messages={recentMessages}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Recent Predictions
            </h2>
            <RecentMessages messages={recentMessages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
