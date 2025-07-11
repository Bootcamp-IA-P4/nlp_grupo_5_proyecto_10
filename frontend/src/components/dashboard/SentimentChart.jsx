import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const SentimentChart = ({ toxic, notToxic, messages = [] }) => {
  const svgRef = useRef();
  const [selectedCategory, setSelectedCategory] = useState("sentiment");

  const total = toxic + notToxic;

  useEffect(() => {
    if (!messages.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup dimensions
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const width = 500 - (margin.left + margin.right);
    const height = 350 - (margin.top + margin.bottom);

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${
          height + margin.top + margin.bottom
        }`
      )
      .style("background", "transparent");

    // Create gradients
    const defs = svg.append("defs");

    // Gradient for toxic messages
    const toxicGradient = defs
      .append("radialGradient")
      .attr("id", "toxic-gradient")
      .attr("cx", 0.3)
      .attr("cy", 0.3);

    toxicGradient
      .append("stop")
      .attr("stop-color", "#fca5a5")
      .attr("offset", "0%");

    toxicGradient
      .append("stop")
      .attr("stop-color", "#ef4444")
      .attr("offset", "100%");

    // Gradient for safe messages
    const safeGradient = defs
      .append("radialGradient")
      .attr("id", "safe-gradient")
      .attr("cx", 0.3)
      .attr("cy", 0.3);

    safeGradient
      .append("stop")
      .attr("stop-color", "#86efac")
      .attr("offset", "0%");

    safeGradient
      .append("stop")
      .attr("stop-color", "#22c55e")
      .attr("offset", "100%");

    // Create main group
    const mainGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + width / 2} ${margin.top + height / 2})`
      );

    // Define categories and centers
    const centers = {
      sentiment: [
        { x: -width / 4, y: 0, label: "Toxic" },
        { x: width / 4, y: 0, label: "Safe" },
      ],
      confidence: [
        { x: -width / 3, y: -height / 4, label: "Low" },
        { x: 0, y: -height / 4, label: "Medium" },
        { x: width / 3, y: -height / 4, label: "High" },
      ],
      length: [
        { x: -width / 4, y: height / 4, label: "Short" },
        { x: width / 4, y: height / 4, label: "Long" },
      ],
    };

    // Add category labels
    const currentCenters = centers[selectedCategory];
    const labels = mainGroup
      .selectAll(".category-label")
      .data(currentCenters)
      .enter()
      .append("text")
      .attr("class", "category-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 80)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .text((d) => d.label);

    // Prepare data for bubbles
    const bubbleData = messages.map((msg, i) => ({
      ...msg,
      id: msg.id || i,
      radius: Math.max(8, Math.min(20, msg.text.length / 10 + 8)),
      color:
        msg.sentiment === "toxic"
          ? "url(#toxic-gradient)"
          : "url(#safe-gradient)",
      strokeColor: msg.sentiment === "toxic" ? "#dc2626" : "#16a34a",
    }));

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "chart-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Create bubbles
    const bubbles = mainGroup
      .selectAll(".bubble")
      .data(bubbleData, (d) => d.id)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .style("cursor", "pointer");

    // Add main circles
    bubbles
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => d.strokeColor)
      .attr("stroke-width", 2)
      .style("opacity", 0.8);

    // Add highlight circles
    bubbles
      .append("circle")
      .attr("r", (d) => d.radius * 0.6)
      .attr("fill", "rgba(255, 255, 255, 0.3)")
      .style("pointer-events", "none");

    // Add mouse events
    bubbles
      .on("mouseenter", function (event, d) {
        d3.select(this).select("circle").style("opacity", 1);

        tooltip
          .html(
            `
          <div><strong>${d.text.substring(0, 50)}${
              d.text.length > 50 ? "..." : ""
            }</strong></div>
          <div>Sentiment: ${d.sentiment === "toxic" ? "Toxic" : "Safe"}</div>
          <div>Confidence: ${
            d.confidence ? (d.confidence * 100).toFixed(1) + "%" : "N/A"
          }</div>
          <div>Length: ${d.text.length} chars</div>
        `
          )
          .style("visibility", "visible")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).select("circle").style("opacity", 0.8);
        tooltip.style("visibility", "hidden");
      });

    // Force simulation
    const getCategoryCenter = (d) => {
      const centers = {
        sentiment: d.sentiment === "toxic" ? 0 : 1,
        confidence: d.confidence >= 0.7 ? 2 : d.confidence >= 0.4 ? 1 : 0,
        length: d.text.length > 100 ? 1 : 0,
      };
      const centerIndex = centers[selectedCategory];
      return currentCenters[centerIndex] || currentCenters[0];
    };

    const simulation = d3
      .forceSimulation(bubbleData)
      .force("x", d3.forceX((d) => getCategoryCenter(d).x).strength(0.8))
      .force("y", d3.forceY((d) => getCategoryCenter(d).y).strength(0.8))
      .force(
        "collision",
        d3.forceCollide((d) => d.radius + 2)
      )
      .alpha(0.3)
      .on("tick", () => {
        bubbles.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    // Cleanup function
    return () => {
      tooltip.remove();
      simulation.stop();
    };
  }, [messages, selectedCategory, toxic, notToxic]);

  const categories = [
    { value: "sentiment", label: "By Sentiment" },
    { value: "confidence", label: "By Confidence" },
    { value: "length", label: "By Length" },
  ];

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex justify-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chart container */}
      <div className="flex justify-center">
        {total === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            No data to display. Add some messages to see the visualization!
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-lg text-gray-800 dark:text-gray-200"
            style={{ background: "transparent" }}
          />
        )}
      </div>

      {/* Legend */}
      {total > 0 && (
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Toxic ({toxic})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Safe ({notToxic})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentChart;
