import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HourlyToxicityChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    // Process data by hour
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      total: 0,
      toxic: 0,
      toxicityRate: 0,
    }));

    messages.forEach((msg) => {
      const hour = new Date(msg.created_at).getHours();
      hourlyData[hour].total++;
      if (msg.sentiment === "toxic") {
        hourlyData[hour].toxic++;
      }
    });

    // Calculate toxicity rates
    hourlyData.forEach((data) => {
      data.toxicityRate = data.total > 0 ? data.toxic / data.total : 0;
    });

    renderHeatmap(hourlyData);
  }, [messages]);

  const renderHeatmap = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    svg.attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    );

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.hour))
      .range([0, width])
      .padding(0.1);

    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, d3.max(data, (d) => d.toxicityRate)]);

    // Add title
    svg
      .append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text("Toxicity by Hour of Day");

    // Create bars
    const bars = g
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.hour))
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", (d) =>
        d.total > 0 ? colorScale(d.toxicityRate) : "#e5e7eb"
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer");

    // Animate bars
    bars
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .attr("y", 20)
      .attr("height", height - 20);

    // Add hour labels
    g.selectAll(".hour-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "hour-label")
      .attr("x", (d) => xScale(d.hour) + xScale.bandwidth() / 2)
      .attr("y", height + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text((d) => d.hour + "h");

    // Add toxicity rate labels
    g.selectAll(".rate-label")
      .data(data.filter((d) => d.total > 0))
      .enter()
      .append("text")
      .attr("class", "rate-label")
      .attr("x", (d) => xScale(d.hour) + xScale.bandwidth() / 2)
      .attr("y", height / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .style("opacity", 0)
      .text((d) => `${(d.toxicityRate * 100).toFixed(0)}%`)
      .transition()
      .duration(500)
      .delay(1200)
      .style("opacity", 1);

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width + margin.left - legendWidth}, ${margin.top - 30})`
      );

    const legendScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.toxicityRate)])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => `${(d * 100).toFixed(0)}%`);

    // Create gradient for legend
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter()
      .append("stop")
      .attr("offset", (d) => `${d * 100}%`)
      .attr("stop-color", (d) => d3.interpolateReds(d));

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", 10)
      .attr("fill", "url(#legend-gradient)");

    legend
      .append("g")
      .attr("transform", `translate(0, 10)`)
      .call(legendAxis)
      .attr("class", "axis");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Toxicity Patterns by Hour
      </h3>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No hourly data available
        </div>
      ) : (
        <svg
          ref={svgRef}
          className="w-full h-auto"
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
};

export default HourlyToxicityChart;
