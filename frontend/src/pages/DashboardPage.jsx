// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { getMessages } from "../services/messageService";
import StatsCard from "../components/dashboard/StatsCard";
import SentimentChart from "../components/dashboard/SentimentChart";
import RecentMessages from "../components/dashboard/RecentMessages";
import CircularConfidenceChart from "../components/dashboard/CircularConfidenceChart";
import ConcentricGrowthChart from "../components/dashboard/ConcentricGrowthChart";
import ToxicityTypesChart from "../components/dashboard/ToxicityTypesChart";
import VideoAnalysisChart from "../components/dashboard/VideoAnalysisChart";
import ToxicityTimelineChart from "../components/dashboard/ToxicityTimelineChart";
import SeasonalToxicityChart from "../components/dashboard/SeasonalToxicityChart";
import YearlyTrendChart from '../components/dashboard/YearlyTrendChart';
import MonthlyTrendChart from '../components/dashboard/MonthlyTrendChart';
import SeasonalChart from '../components/dashboard/SeasonalChart';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import HourlyChart from '../components/dashboard/HourlyChart';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    toxic: 0,
    notToxic: 0,
    accuracy: 0,
  });
  const [messages, setMessages] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const messagesData = await getMessages();
      setMessages(messagesData);

      // Calculate stats
      const total = messagesData.length;
      const toxic = messagesData.filter(
        (msg) => msg.sentiment === "toxic"
      ).length;
      const notToxic = total - toxic;

      setStats({
        total,
        toxic,
        notToxic,
        accuracy:
          total > 0 ? (((notToxic + toxic) / total) * 100).toFixed(1) : 0,
      });

      // Get recent messages (last 5)
      setRecentMessages(messagesData.slice(-5).reverse());
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

      {/* Temporal Analysis Section - 5 Small Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Temporal Toxicity Analysis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <YearlyTrendChart messages={messages} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <MonthlyTrendChart messages={messages} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <SeasonalChart messages={messages} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <WeeklyChart messages={messages} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <HourlyChart messages={messages} />
          </div>
        </div>
      </div>

      {/* Original Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Interactive Sentiment Visualization
          </h2>
          <SentimentChart
            toxic={stats.toxic}
            notToxic={stats.notToxic}
            messages={messages}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <ToxicityTypesChart messages={messages} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <VideoAnalysisChart messages={messages} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Recent Predictions
          </h2>
          <RecentMessages messages={recentMessages} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
