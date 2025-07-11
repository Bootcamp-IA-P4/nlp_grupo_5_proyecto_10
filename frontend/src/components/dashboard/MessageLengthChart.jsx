import React, { useEffect, useRef } from "react";

const MessageLengthChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    // Process data for length vs toxicity correlation
    const processedData = messages.map((msg) => ({
      length: msg.text.length,
      sentiment: msg.sentiment,
      confidence: msg.confidence || 0.5,
      text: msg.text.substring(0, 50) + (msg.text.length > 50 ? "..." : ""),
    }));

    // Create animated circular chart inspired by the second SVG
    renderCircularChart(processedData);
  }, [messages]);

  const renderCircularChart = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 400;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Create animated concentric circles
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 150;

    // Background circles (like the original design)
    const backgroundData = [
      { radius: 30, opacity: 0.18 },
      { radius: 60, opacity: 0.25 },
      { radius: 90, opacity: 0.35 },
      { radius: 120, opacity: 0.44 },
      { radius: 150, opacity: 0.18 },
    ];

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Add background circles with animation
    backgroundData.forEach((bg, i) => {
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 0)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2)
        .attr("opacity", bg.opacity)
        .transition()
        .duration(800)
        .delay(i * 150)
        .attr("r", bg.radius);
    });

    // Create length categories
    const lengthCategories = [
      { min: 0, max: 20, label: "Very Short", radius: 30, color: "#22c55e" },
      { min: 21, max: 50, label: "Short", radius: 60, color: "#84cc16" },
      { min: 51, max: 100, label: "Medium", radius: 90, color: "#eab308" },
      { min: 101, max: 200, label: "Long", radius: 120, color: "#f97316" },
      {
        min: 201,
        max: Infinity,
        label: "Very Long",
        radius: 150,
        color: "#ef4444",
      },
    ];

    // Group data by categories
    const groupedData = lengthCategories.map((cat) => {
      const categoryMessages = data.filter(
        (d) => d.length >= cat.min && d.length <= cat.max
      );
      const toxicCount = categoryMessages.filter(
        (d) => d.sentiment === "toxic"
      ).length;
      const toxicityRate =
        categoryMessages.length > 0 ? toxicCount / categoryMessages.length : 0;

      return {
        ...cat,
        count: categoryMessages.length,
        toxicCount,
        toxicityRate,
        messages: categoryMessages.slice(0, 5), // Sample messages
      };
    });

    // Add data circles
    groupedData.forEach((category, i) => {
      if (category.count === 0) return;

      // Calculate angle for this category
      const angle = i * 72 * (Math.PI / 180); // 72 degrees apart
      const dataRadius = category.radius;

      // Add main category circle
      const circle = g
        .append("circle")
        .attr("cx", 0)
        .attr("cy", -dataRadius)
        .attr("r", 0)
        .attr("fill", category.color)
        .attr("opacity", 0.7)
        .style("cursor", "pointer");

      // Animate circle size based on count
      const finalRadius = Math.max(8, Math.min(25, category.count * 2));
      circle
        .transition()
        .duration(1000)
        .delay(1000 + i * 200)
        .attr("r", finalRadius);

      // Add toxicity indicator (inner circle)
      if (category.toxicCount > 0) {
        g.append("circle")
          .attr("cx", 0)
          .attr("cy", -dataRadius)
          .attr("r", 0)
          .attr("fill", "#ef4444")
          .attr("opacity", 0.9)
          .transition()
          .duration(800)
          .delay(1200 + i * 200)
          .attr("r", finalRadius * category.toxicityRate);
      }

      // Add label
      g.append("text")
        .attr("x", 0)
        .attr("y", -dataRadius - finalRadius - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#374151")
        .attr("font-weight", "bold")
        .style("opacity", 0)
        .text(category.label)
        .transition()
        .duration(500)
        .delay(1500 + i * 200)
        .style("opacity", 1);

      // Add count label
      g.append("text")
        .attr("x", 0)
        .attr("y", -dataRadius + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .style("opacity", 0)
        .text(category.count)
        .transition()
        .duration(500)
        .delay(1600 + i * 200)
        .style("opacity", 1);
    });

    // Add center label
    g.append("text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#6366f1")
      .attr("font-weight", "bold")
      .style("opacity", 0)
      .text("MESSAGE")
      .transition()
      .duration(500)
      .delay(2000)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 0)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#6366f1")
      .attr("font-weight", "bold")
      .style("opacity", 0)
      .text("LENGTH")
      .transition()
      .duration(500)
      .delay(2000)
      .style("opacity", 1);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Message Length vs Toxicity Distribution
      </h3>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No message length data available
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-lg"
            style={{ background: "transparent" }}
          />

          {/* Legend */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Very Short (0-20)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-lime-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Short (21-50)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Medium (51-100)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Long (101-200)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Very Long (200+)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-gray-600 dark:text-gray-400">
                Toxic content
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageLengthChart;
