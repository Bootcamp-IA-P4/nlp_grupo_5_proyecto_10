// frontend/src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import DashboardCharts from "../components/dashboard/DashboardCharts";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [videoComparison, setVideoComparison] = useState(null);
  const [toxicityPatterns, setToxicityPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats first (most reliable)
      const statsData = await dashboardService.getStats();
      setStats(statsData);

      // Try to load analytics with fallback
      try {
        const analyticsData = await dashboardService.getAnalytics();
        setAnalytics(analyticsData);
      } catch (analyticsError) {
        console.warn("Analytics failed:", analyticsError);
        setAnalytics({ error: "Analytics temporarily unavailable" });
      }

      // Try to load video comparison with fallback
      try {
        const videoData = await dashboardService.getVideoComparison();
        setVideoComparison(videoData);
      } catch (videoError) {
        console.warn("Video comparison failed:", videoError);
        setVideoComparison({
          error: "Video comparison temporarily unavailable",
        });
      }

      // Try to load toxicity patterns with fallback
      try {
        const patternsData = await dashboardService.getToxicityPatterns();
        setToxicityPatterns(patternsData);
      } catch (patternsError) {
        console.warn("Toxicity patterns failed:", patternsError);
        setToxicityPatterns({
          error: "Toxicity patterns temporarily unavailable",
        });
      }
    } catch (err) {
      setError("Failed to load basic dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-purple-600 dark:text-purple-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Deep insights into comment sentiment patterns and toxicity analysis
        </p>
      </div>

      {/* Quick Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Messages
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.total_messages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Toxicity Rate
                </p>
                <p className="text-2xl font-semibold text-red-600">
                  {stats.toxicity_rate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">📺</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  YouTube Comments
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.youtube_messages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Confidence
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.avg_confidence}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Professional Charts Component */}
      <DashboardCharts />

      {/* Keep existing analytics summary as fallback/additional detail */}
      {analytics &&
        !analytics.error &&
        toxicityPatterns &&
        !toxicityPatterns.error && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              📋 Detailed Analytics Summary
            </h2>

            {/* Toxicity Patterns Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                🔍 Toxicity Pattern Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Toxic Comments
                  </h4>
                  <p className="text-sm">
                    Average Length:{" "}
                    {toxicityPatterns.toxic_patterns?.avg_text_length} chars
                  </p>
                  <p className="text-sm">
                    Total Count: {toxicityPatterns.toxic_patterns?.total_count}
                  </p>
                  <p className="text-sm">
                    Avg Confidence:{" "}
                    {toxicityPatterns.toxic_patterns?.avg_confidence}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Non-Toxic Comments
                  </h4>
                  <p className="text-sm">
                    Average Length:{" "}
                    {toxicityPatterns.non_toxic_patterns?.avg_text_length} chars
                  </p>
                  <p className="text-sm">
                    Total Count:{" "}
                    {toxicityPatterns.non_toxic_patterns?.total_count}
                  </p>
                  <p className="text-sm">
                    Avg Confidence:{" "}
                    {toxicityPatterns.non_toxic_patterns?.avg_confidence}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DashboardPage;
