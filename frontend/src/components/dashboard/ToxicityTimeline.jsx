import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const ToxicityTimeline = ({ messages, title = "Toxicity Over Time" }) => {
  const svgRef = useRef();
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    if (!messages.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Process data by time range
    const processedData = processDataByTime(messages, timeRange);
    if (!processedData.length) return;

    // Setup dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

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

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d.date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => Math.max(d.toxic, d.total))])
      .nice()
      .range([height, 0]);

    // Line generator
    const toxicLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.toxic))
      .curve(d3.curveMonotoneX);

    const totalLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.total))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "toxicity-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", height)
      .attr("x2", 0)
      .attr("y2", 0);

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.1);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.6);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d")))
      .attr("class", "axis text-gray-600 dark:text-gray-400");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "axis text-gray-600 dark:text-gray-400");

    // Add area under toxic line
    const area = d3
      .area()
      .x((d) => xScale(d.date))
      .y0(height)
      .y1((d) => yScale(d.toxic))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(processedData)
      .attr("fill", "url(#toxicity-gradient)")
      .attr("d", area);

    // Add lines
    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3)
      .attr("d", toxicLine);

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", totalLine);

    // Add dots
    g.selectAll(".toxic-dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "toxic-dot")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.toxic))
      .attr("r", 4)
      .attr("fill", "#ef4444");

    // Add labels
    g.append("text")
      .attr("x", width - 100)
      .attr("y", 20)
      .attr("fill", "#ef4444")
      .style("font-size", "12px")
      .text("● Toxic Messages");

    g.append("text")
      .attr("x", width - 100)
      .attr("y", 35)
      .attr("fill", "#22c55e")
      .style("font-size", "12px")
      .text("--- Total Messages");
  }, [messages, timeRange]);

  const processDataByTime = (messages, range) => {
    const groupedData = {};

    messages.forEach((msg) => {
      const date = new Date(msg.created_at);
      let key;

      switch (range) {
        case "hour":
          key = d3.timeHour.floor(date);
          break;
        case "day":
          key = d3.timeDay.floor(date);
          break;
        case "week":
          key = d3.timeWeek.floor(date);
          break;
        case "month":
          key = d3.timeMonth.floor(date);
          break;
        default:
          key = d3.timeDay.floor(date);
      }

      if (!groupedData[key]) {
        groupedData[key] = { total: 0, toxic: 0 };
      }

      groupedData[key].total++;
      if (msg.sentiment === "toxic") {
        groupedData[key].toxic++;
      }
    });

    return Object.entries(groupedData)
      .map(([date, counts]) => ({
        date: new Date(date),
        ...counts,
      }))
      .sort((a, b) => a.date - b.date);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="hour">Last 24 Hours</option>
          <option value="day">Last 7 Days</option>
          <option value="week">Last 4 Weeks</option>
          <option value="month">Last 12 Months</option>
        </select>
      </div>

      <div className="flex justify-center">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            No data available for timeline
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-2xl"
            style={{ background: "transparent" }}
          />
        )}
      </div>
    </div>
  );
};

export default ToxicityTimeline;
