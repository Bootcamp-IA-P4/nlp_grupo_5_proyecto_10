import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { dashboardService } from "../../services/dashboardService";

const COLORS = {
  toxic: "#ef4444",
  "not toxic": "#22c55e",
  youtube: "#dc2626",
  manual: "#3b82f6",
  high: "#10b981",
  medium: "#f59e0b",
  low: "#ef4444",
  primary: "#8b5cf6",
};

const DashboardCharts = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const [analyticsData, statsData] = await Promise.all([
          dashboardService.getAnalytics(),
          dashboardService.getStats(),
        ]);
        setAnalytics(analyticsData);
        setStats(statsData);
      } catch (err) {
        console.error("Analytics error:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, []);

  if (loading) return <div className="text-center p-8">Loading charts...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!analytics) return null;

  // SENTIMENT BY SOURCE - Fix data mapping
  const sentimentSourceData =
    analytics.sentiment_by_source?.reduce((acc, item) => {
      const sentimentKey = item.sentiment.replace(" ", "_");
      const sourceKey = item.source === "youtube" ? "YouTube" : "Manual";
      
      const existing = acc.find((x) => x.source === sourceKey);
      if (existing) {
        existing[sentimentKey] = item.count;
      } else {
        const newSource = {
          source: sourceKey,
          toxic: 0,
          not_toxic: 0
        };
        newSource[sentimentKey] = item.count;
        acc.push(newSource);
      }
      return acc;
    }, []) || [];

  // Debug: Log the data to console
  console.log("Sentiment Source Data:", sentimentSourceData);
  console.log("Raw Analytics Data:", analytics.sentiment_by_source);

  // CONFIDENCE DISTRIBUTION
  const confidenceData =
    analytics.confidence_distribution?.map((item) => ({
      name: item.confidence_range,
      value: item.count,
      fill: item.confidence_range.includes("High")
        ? COLORS.high
        : item.confidence_range.includes("Medium")
        ? COLORS.medium
        : COLORS.low,
    })) || [];

  // TOP CHANNELS
  const channelsData =
    analytics.top_youtube_channels?.slice(0, 6).map((channel) => ({
      ...channel,
      channel:
        channel.channel.length > 20
          ? channel.channel.substring(0, 20) + "..."
          : channel.channel,
    })) || [];

  // TEXT LENGTH
  const textLengthData =
    analytics.text_length_vs_sentiment?.map((item) => ({
      length: item.length_range,
      count: item.count,
    })) || [];

  // TOXICITY RATE
  const toxicityRate = stats?.toxicity_rate || 0;

  // TOP TOXIC WORDS
  const topToxicWords = analytics.top_toxic_words || [];

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SENTIMENT BY SOURCE - 2 Charts Only */}
        <ChartCard title="📊 Sentiment by Source">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Chart */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ✍️ Manual Messages
              </h4>

              {(() => {
                const manualData = sentimentSourceData.find(
                  (s) => s.source === "Manual"
                );
                
                console.log("Manual Data:", manualData); // Debug log
                
                const totalMessages =
                  (manualData?.toxic || 0) + (manualData?.not_toxic || 0);
                
                // Only show chart if there's data
                if (totalMessages === 0) {
                  return (
                    <div className="text-gray-500 text-sm py-8">
                      No manual messages found
                    </div>
                  );
                }
                
                const pieData = [
                  {
                    name: "Clean",
                    value: manualData?.not_toxic || 0,
                    fill: "#22c55e",
                  },
                  {
                    name: "Toxic",
                    value: manualData?.toxic || 0,
                    fill: "#ef4444",
                  },
                ].filter(item => item.value > 0); // Only include non-zero values

                return (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`manual-${idx}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-1 text-xs">
                      <div className="text-gray-600 dark:text-gray-400 font-medium">
                        {totalMessages} total messages
                      </div>
                      <div className="space-y-1">
                        <div className="text-green-600 dark:text-green-400">
                          ✓ {manualData?.not_toxic || 0} clean (
                          {totalMessages > 0
                            ? (
                                ((manualData?.not_toxic || 0) / totalMessages) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </div>
                        <div className="text-red-600 dark:text-red-400">
                          ⚠ {manualData?.toxic || 0} toxic (
                          {totalMessages > 0
                            ? (
                                ((manualData?.toxic || 0) / totalMessages) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* YouTube Chart */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📺 YouTube Messages
              </h4>

              {(() => {
                const youtubeData = sentimentSourceData.find(
                  (s) => s.source === "YouTube"
                );
                
                console.log("YouTube Data:", youtubeData); // Debug log
                
                const totalMessages =
                  (youtubeData?.toxic || 0) + (youtubeData?.not_toxic || 0);
                
                // Only show chart if there's data
                if (totalMessages === 0) {
                  return (
                    <div className="text-gray-500 text-sm py-8">
                      No YouTube messages found
                    </div>
                  );
                }
                
                const pieData = [
                  {
                    name: "Clean",
                    value: youtubeData?.not_toxic || 0,
                    fill: "#22c55e",
                  },
                  {
                    name: "Toxic",
                    value: youtubeData?.toxic || 0,
                    fill: "#ef4444",
                  },
                ].filter(item => item.value > 0); // Only include non-zero values

                return (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`youtube-${idx}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-1 text-xs">
                      <div className="text-gray-600 dark:text-gray-400 font-medium">
                        {totalMessages} total messages
                      </div>
                      <div className="space-y-1">
                        <div className="text-green-600 dark:text-green-400">
                          ✓ {youtubeData?.not_toxic || 0} clean (
                          {totalMessages > 0
                            ? (
                                ((youtubeData?.not_toxic || 0) /
                                  totalMessages) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </div>
                        <div className="text-red-600 dark:text-red-400">
                          ⚠ {youtubeData?.toxic || 0} toxic (
                          {totalMessages > 0
                            ? (
                                ((youtubeData?.toxic || 0) / totalMessages) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </ChartCard>

        {/* CONFIDENCE DISTRIBUTION */}
        <ChartCard title="🎯 Model Confidence">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={confidenceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* TOXICITY RATE */}
        <ChartCard title="⚠️ Toxicity Rate">
          <ResponsiveContainer width="100%" height={150}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              data={[
                {
                  name: "Toxicity",
                  value: parseFloat(toxicityRate.toFixed(2)),
                  fill:
                    toxicityRate > 20
                      ? COLORS.toxic
                      : toxicityRate > 10
                      ? COLORS.medium
                      : COLORS.high,
                },
              ]}
            >
              <RadialBar dataKey="value" cornerRadius={10} />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xl font-bold fill-gray-700 dark:fill-gray-300"
              >
                {toxicityRate.toFixed(2)}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center">
            <span
              className={`text-xs font-medium ${
                toxicityRate > 20
                  ? "text-red-600"
                  : toxicityRate > 10
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {toxicityRate > 20
                ? "High Risk"
                : toxicityRate > 10
                ? "Moderate"
                : "Low Risk"}
            </span>
          </div>
        </ChartCard>

        {/* TEXT LENGTH */}
        <ChartCard title="📝 Text Length">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={textLengthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="length" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip
                formatter={(value) => [value, "Messages"]}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* TOP YOUTUBE CHANNELS - Replace with Circular Chart */}
      <ChartCard title="📺 Top YouTube Channels">
        {channelsData.length > 0 ? (
          <div className="relative w-full h-[300px] flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: `linear-gradient(135deg,rgba(220, 38, 38, 0.3) 0%,rgba(139, 92, 246, 0.3) 100%),rgba(255, 255, 255, 0.5)`,
                backgroundBlendMode: "lighten",
              }}
            />

            <svg
              className="relative z-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 400"
              style={{ width: "100%", height: "100%", maxWidth: "300px" }}
            >
              {/* Base circle */}
              <circle
                cx="200"
                cy="200"
                r="120"
                fill="none"
                stroke="#ffffff40"
                strokeWidth="20"
              />

              {/* Channel rings - Split toxic/non-toxic */}
              <g fill="none" strokeWidth="20" strokeLinecap="round">
                {channelsData.slice(0, 4).map((channel, index) => {
                  const circumference = 2 * Math.PI * 120;

                  // Better proportional scaling - use a more balanced approach
                  const maxComments = Math.max(
                    ...channelsData.map((c) => c.total_comments)
                  );
                  const minComments = Math.min(
                    ...channelsData.map((c) => c.total_comments)
                  );

                  // Scale between 30% and 100% of the circle to show differences without making small channels invisible
                  const minScale = 0.3; // Minimum 30% of quarter circle
                  const maxScale = 1.0; // Maximum 100% of quarter circle

                  const normalizedSize =
                    (channel.total_comments - minComments) /
                    (maxComments - minComments || 1);
                  const quarterCirclePercentage =
                    (minScale + normalizedSize * (maxScale - minScale)) * 25; // 25% = quarter circle

                  // Calculate toxic vs non-toxic percentages within this channel
                  const toxicPerc =
                    (channel.toxic_comments / channel.total_comments) * 100;
                  const nonToxicPerc = 100 - toxicPerc;

                  // Calculate arc lengths
                  const totalArcLength =
                    (quarterCirclePercentage / 100) * circumference;
                  const toxicArcLength = (toxicPerc / 100) * totalArcLength;
                  const nonToxicArcLength =
                    (nonToxicPerc / 100) * totalArcLength;

                  const rotation = index * 90 - 90;

                  // Base colors for each channel
                  const baseColors = [
                    "#dc2626",
                    "#8b5cf6",
                    "#3b82f6",
                    "#22c55e",
                  ];
                  const darkColor = baseColors[index]; // For toxic
                  const lightColor = baseColors[index] + "80"; // For non-toxic (with transparency)

                  return (
                    <g key={index}>
                      {/* Non-toxic arc (lighter) */}
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        stroke={lightColor}
                        strokeDasharray={`${nonToxicArcLength} ${circumference}`}
                        transform={`rotate(${rotation} 200 200)`}
                        opacity="0.6"
                      />

                      {/* Toxic arc (darker) - offset by non-toxic arc */}
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        stroke={darkColor}
                        strokeDasharray={`${toxicArcLength} ${circumference}`}
                        strokeDashoffset={-nonToxicArcLength}
                        transform={`rotate(${rotation} 200 200)`}
                        opacity="0.9"
                      />
                    </g>
                  );
                })}
              </g>

              {/* Center text */}
              <text
                x="200"
                y="195"
                textAnchor="middle"
                className="fill-white text-sm font-light"
                fontSize="16"
              >
                YOUTUBE
              </text>
              <text
                x="200"
                y="215"
                textAnchor="middle"
                className="fill-white text-xs font-light"
                fontSize="12"
              >
                CHANNELS
              </text>

              {/* Channel labels with toxicity info */}
              <g className="fill-white text-xs font-light">
                {channelsData.slice(0, 4).map((channel, index) => {
                  const positions = [
                    { x: 200, y: 40 }, // Top
                    { x: 360, y: 200 }, // Right
                    { x: 200, y: 360 }, // Bottom
                    { x: 40, y: 200 }, // Left
                  ];

                  const toxicPerc = (
                    (channel.toxic_comments / channel.total_comments) *
                    100
                  ).toFixed(1);
                  const nonToxicPerc = (100 - parseFloat(toxicPerc)).toFixed(1);

                  return (
                    <g key={index}>
                      <text
                        x={positions[index].x}
                        y={positions[index].y}
                        textAnchor="middle"
                        fontSize="10"
                        className="font-semibold"
                      >
                        {channel.channel}
                      </text>
                      <text
                        x={positions[index].x}
                        y={positions[index].y + 12}
                        textAnchor="middle"
                        fontSize="8"
                      >
                        {channel.total_comments} comments
                      </text>
                      <text
                        x={positions[index].x}
                        y={positions[index].y + 22}
                        textAnchor="middle"
                        fontSize="7"
                        className="fill-red-300"
                      >
                        {toxicPerc}% toxic
                      </text>
                      <text
                        x={positions[index].x}
                        y={positions[index].y + 31}
                        textAnchor="middle"
                        fontSize="7"
                        className="fill-green-300"
                      >
                        {nonToxicPerc}% clean
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">📹</div>
            <p className="text-sm font-semibold">
              No YouTube channel data available
            </p>
            <p className="text-xs mt-1">
              Analyze some YouTube videos to see channel comparison
            </p>
          </div>
        )}
      </ChartCard>

      {/* TOP TOXIC WORDS */}
      <ChartCard title="🔥 Top Toxic Words">
        {topToxicWords.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
            {topToxicWords.slice(0, 8).map((item, index) => (
              <div
                key={index}
                className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center border border-red-200 dark:border-red-800"
              >
                <div className="text-sm font-bold text-red-600 dark:text-red-400">
                  {item.count}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                  "{item.word}"
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm font-semibold">No toxic words detected!</p>
          </div>
        )}
      </ChartCard>
    </div>
  );
};

// Reusable chart card component
const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-white">
      {title}
    </h3>
    {children}
  </div>
);

const tooltipStyle = {
  backgroundColor: "#f3f4f6",
  border: "1px solid #d1d5db",
  fontSize: "12px",
};

export default DashboardCharts;
