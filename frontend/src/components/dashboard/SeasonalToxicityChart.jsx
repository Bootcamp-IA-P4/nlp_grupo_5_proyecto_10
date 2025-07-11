import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const SeasonalToxicityChart = ({ messages }) => {
  const svgRef = useRef();
  const [analysisType, setAnalysisType] = useState("seasons");

  useEffect(() => {
    if (!messages.length) return;

    const processedData = processSeasonalData(messages, analysisType);
    renderSeasonalChart(processedData);
  }, [messages, analysisType]);

  const processSeasonalData = (messages, type) => {
    const groupedData = {};

    messages.forEach((msg) => {
      const date = new Date(msg.created_at);
      let key, label, color;

      switch (type) {
        case "seasons":
          const month = date.getMonth();
          if (month >= 2 && month <= 4) {
            key = "Spring";
            color = "#10b981";
          } else if (month >= 5 && month <= 7) {
            key = "Summer";
            color = "#f59e0b";
          } else if (month >= 8 && month <= 10) {
            key = "Autumn";
            color = "#ef4444";
          } else {
            key = "Winter";
            color = "#3b82f6";
          }
          label = key;
          break;
        case "monthPeriods":
          const dayOfMonth = date.getDate();
          if (dayOfMonth <= 10) {
            key = "Early Month";
            color = "#10b981";
          } else if (dayOfMonth <= 20) {
            key = "Mid Month";
            color = "#f59e0b";
          } else {
            key = "Late Month";
            color = "#ef4444";
          }
          label = key;
          break;
        case "timeOfDay":
          const hour = date.getHours();
          if (hour >= 6 && hour < 12) {
            key = "Morning";
            color = "#fbbf24";
          } else if (hour >= 12 && hour < 18) {
            key = "Afternoon";
            color = "#f59e0b";
          } else if (hour >= 18 && hour < 22) {
            key = "Evening";
            color = "#ef4444";
          } else {
            key = "Night";
            color = "#3b82f6";
          }
          label = key;
          break;
        default:
          key = "Unknown";
          label = key;
          color = "#6b7280";
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: label,
          total: 0,
          toxic: 0,
          toxicityRate: 0,
          color: color,
        };
      }

      groupedData[key].total++;
      if (msg.sentiment === "toxic") {
        groupedData[key].toxic++;
      }
    });

    // Calculate toxicity rates
    return Object.values(groupedData).map((data) => ({
      ...data,
      toxicityRate: data.total > 0 ? (data.toxic / data.total) * 100 : 0,
    }));
  };

  const renderSeasonalChart = (data) => {
    if (!data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 60, right: 40, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr(
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
      .domain(data.map((d) => d.period))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.toxicityRate)])
      .nice()
      .range([height, 0]);

    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("class", "text-gray-800 dark:text-gray-200")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(getSeasonalTitle(analysisType));

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("class", "text-gray-600 dark:text-gray-400");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "text-gray-600 dark:text-gray-400");

    // Add axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("class", "text-gray-700 dark:text-gray-300")
      .style("font-size", "12px")
      .text("Toxicity Rate (%)");

    // Create bars with custom colors
    const bars = g
      .selectAll(".seasonal-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "seasonal-bar")
      .attr("x", (d) => xScale(d.period))
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.8)
      .style("cursor", "pointer");

    // Animate bars
    bars
      .transition()
      .duration(1200)
      .delay((d, i) => i * 200)
      .attr("y", (d) => yScale(d.toxicityRate))
      .attr("height", (d) => height - yScale(d.toxicityRate));

    // Add value labels on top of bars
    g.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(d.period) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.toxicityRate) - 5)
      .attr("text-anchor", "middle")
      .attr("class", "text-gray-800 dark:text-gray-200")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text((d) => `${d.toxicityRate.toFixed(1)}%`)
      .transition()
      .duration(500)
      .delay((d, i) => 1200 + i * 200)
      .style("opacity", 1);

    // Add hover effects
    bars
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("opacity", 1);

        // Show tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "seasonal-tooltip")
          .style("position", "absolute")
          .style("visibility", "visible")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "12px")
          .style("border-radius", "8px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .html(
            `
            <div style="font-weight: bold; margin-bottom: 4px;">${
              d.period
            }</div>
            <div>Toxicity Rate: <strong>${d.toxicityRate.toFixed(
              1
            )}%</strong></div>
            <div>Total Messages: ${d.total}</div>
            <div>Toxic Messages: ${d.toxic}</div>
            <div>Safe Messages: ${d.total - d.toxic}</div>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("opacity", 0.8);
        d3.selectAll(".seasonal-tooltip").remove();
      });

    // Add insight box
    const insight = getSeasonalInsight(data, analysisType);
    if (insight) {
      g.append("foreignObject")
        .attr("x", 10)
        .attr("y", height + 40)
        .attr("width", width - 20)
        .attr("height", 60)
        .append("xhtml:div")
        .style("background", "rgba(59, 130, 246, 0.1)")
        .style("padding", "8px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("color", "currentColor")
        .html(`<strong>💡 Insight:</strong> ${insight}`);
    }
  };

  const getSeasonalTitle = (type) => {
    const titles = {
      seasons: "Toxicity by Season",
      monthPeriods: "Toxicity by Month Period",
      timeOfDay: "Toxicity by Time of Day",
    };
    return titles[type] || "Seasonal Analysis";
  };

  const getSeasonalInsight = (data, type) => {
    if (!data.length) return null;

    const maxPeriod = data.reduce((max, d) =>
      d.toxicityRate > max.toxicityRate ? d : max
    );
    const minPeriod = data.reduce((min, d) =>
      d.toxicityRate < min.toxicityRate ? d : min
    );

    const insights = {
      seasons: `${
        maxPeriod.period
      } shows the highest toxicity (${maxPeriod.toxicityRate.toFixed(
        1
      )}%), while ${
        minPeriod.period
      } is the most peaceful (${minPeriod.toxicityRate.toFixed(1)}%).`,
      monthPeriods: `People tend to be most toxic ${maxPeriod.period.toLowerCase()} (${maxPeriod.toxicityRate.toFixed(
        1
      )}%) and most civil ${minPeriod.period.toLowerCase()} (${minPeriod.toxicityRate.toFixed(
        1
      )}%).`,
      timeOfDay: `${
        maxPeriod.period
      } hours show peak toxicity (${maxPeriod.toxicityRate.toFixed(
        1
      )}%), while ${minPeriod.period.toLowerCase()} is the calmest time (${minPeriod.toxicityRate.toFixed(
        1
      )}%).`,
    };

    return insights[type];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Seasonal Toxicity Patterns
        </h3>
        <select
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="seasons">By Seasons</option>
          <option value="monthPeriods">By Month Period</option>
          <option value="timeOfDay">By Time of Day</option>
        </select>
      </div>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No seasonal data available
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

export default SeasonalToxicityChart;
