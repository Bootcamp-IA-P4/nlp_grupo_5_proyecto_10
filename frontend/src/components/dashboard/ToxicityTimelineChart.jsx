import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const ToxicityTimelineChart = ({ messages }) => {
  const svgRef = useRef();
  const [timeRange, setTimeRange] = useState("months");
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    if (!messages.length) return;

    const processedData = processDataByTimeRange(messages, timeRange);
    setCurrentData(processedData);
    renderChart(processedData);
  }, [messages, timeRange]);

  const processDataByTimeRange = (messages, range) => {
    const groupedData = {};

    messages.forEach((msg) => {
      const date = new Date(msg.created_at);
      let key, label;

      switch (range) {
        case "years":
          key = date.getFullYear();
          label = key.toString();
          break;
        case "months":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          label = new Date(
            date.getFullYear(),
            date.getMonth()
          ).toLocaleDateString("en-US", { month: "short", year: "numeric" });
          break;
        case "weeks":
          // Weeks within current month
          const weekOfMonth = Math.ceil(date.getDate() / 7);
          key = `Week ${weekOfMonth}`;
          label = key;
          break;
        case "weekdays":
          const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          key = date.getDay();
          label = days[key];
          break;
        default:
          key = date.toDateString();
          label = key;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: label,
          total: 0,
          toxic: 0,
          toxicityRate: 0,
          date: date,
        };
      }

      groupedData[key].total++;
      if (msg.sentiment === "toxic") {
        groupedData[key].toxic++;
      }
    });

    // Calculate toxicity rates and sort
    const result = Object.values(groupedData).map((data) => ({
      ...data,
      toxicityRate: data.total > 0 ? (data.toxic / data.total) * 100 : 0,
    }));

    // Sort by appropriate criteria
    if (range === "weekdays") {
      const dayOrder = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return dayOrder.map(
        (day) =>
          result.find((d) => d.period === day) || {
            period: day,
            total: 0,
            toxic: 0,
            toxicityRate: 0,
          }
      );
    } else if (range === "weeks") {
      return result.sort((a, b) => a.period.localeCompare(b.period));
    } else {
      return result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const renderChart = (data) => {
    if (!data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
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
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        Math.max(
          d3.max(data, (d) => d.toxicityRate),
          10
        ),
      ])
      .nice()
      .range([height, 0]);

    const yScaleVolume = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .nice()
      .range([height, 0]);

    // Create gradients
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
      .attr("stop-opacity", 0.7);

    // Add axes
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .attr("class", "text-gray-600 dark:text-gray-400");

    const yAxis = g
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "text-gray-600 dark:text-gray-400");

    // Add right axis for volume
    const yAxisRight = g
      .append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yScaleVolume))
      .attr("class", "text-gray-600 dark:text-gray-400");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("class", "text-gray-700 dark:text-gray-300")
      .style("font-size", "12px")
      .text("Toxicity Rate (%)");

    g.append("text")
      .attr(
        "transform",
        `translate(${width + margin.right - 10}, ${height / 2}) rotate(-90)`
      )
      .style("text-anchor", "middle")
      .attr("class", "text-gray-700 dark:text-gray-300")
      .style("font-size", "12px")
      .text("Total Messages");

    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "text-gray-800 dark:text-gray-200")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(getChartTitle(timeRange));

    // Volume bars (background)
    g.selectAll(".volume-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "volume-bar")
      .attr("x", (d) => xScale(d.period))
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "#e5e7eb")
      .attr("opacity", 0.5)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", (d) => yScaleVolume(d.total))
      .attr("height", (d) => height - yScaleVolume(d.total));

    // Line generator for toxicity rate
    const line = d3
      .line()
      .x((d) => xScale(d.period) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.toxicityRate))
      .curve(d3.curveMonotoneX);

    // Area generator for toxicity rate
    const area = d3
      .area()
      .x((d) => xScale(d.period) + xScale.bandwidth() / 2)
      .y0(height)
      .y1((d) => yScale(d.toxicityRate))
      .curve(d3.curveMonotoneX);

    // Add area under the line
    g.append("path")
      .datum(data)
      .attr("fill", "url(#toxicity-gradient)")
      .attr("d", area)
      .style("opacity", 0)
      .transition()
      .duration(1500)
      .delay(500)
      .style("opacity", 1);

    // Add the line
    const path = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate line drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .delay(800)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.period) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.toxicityRate))
      .attr("r", 0)
      .attr("fill", "#ef4444")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .transition()
      .duration(500)
      .delay((d, i) => 1000 + i * 100)
      .attr("r", 5);

    // Add hover effects
    g.selectAll(".dot")
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 8);

        // Show tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "timeline-tooltip")
          .style("position", "absolute")
          .style("visibility", "visible")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .html(
            `
            <div><strong>${d.period}</strong></div>
            <div>Toxicity Rate: ${d.toxicityRate.toFixed(1)}%</div>
            <div>Total Messages: ${d.total}</div>
            <div>Toxic Messages: ${d.toxic}</div>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("r", 5);
        d3.selectAll(".timeline-tooltip").remove();
      });
  };

  const getChartTitle = (range) => {
    const titles = {
      years: "Toxicity Trends Over Years",
      months: "Toxicity Trends Over Months",
      weeks: "Toxicity by Week of Month",
      weekdays: "Toxicity by Day of Week",
    };
    return titles[range] || "Toxicity Timeline";
  };

  const getInsights = () => {
    if (!currentData.length) return null;

    const maxToxicity = currentData.reduce(
      (max, d) => (d.toxicityRate > max.toxicityRate ? d : max),
      currentData[0]
    );
    const minToxicity = currentData.reduce(
      (min, d) => (d.toxicityRate < min.toxicityRate ? d : min),
      currentData[0]
    );
    const avgToxicity =
      currentData.reduce((sum, d) => sum + d.toxicityRate, 0) /
      currentData.length;

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Key Insights:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-red-600 dark:text-red-400">
            <strong>Highest:</strong> {maxToxicity.period} (
            {maxToxicity.toxicityRate.toFixed(1)}%)
          </div>
          <div className="text-green-600 dark:text-green-400">
            <strong>Lowest:</strong> {minToxicity.period} (
            {minToxicity.toxicityRate.toFixed(1)}%)
          </div>
          <div className="text-blue-600 dark:text-blue-400">
            <strong>Average:</strong> {avgToxicity.toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Toxicity Timeline Analysis
        </h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="years">By Years</option>
          <option value="months">By Months</option>
          <option value="weeks">By Week of Month</option>
          <option value="weekdays">By Day of Week</option>
        </select>
      </div>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No temporal data available
        </div>
      ) : (
        <>
          <svg
            ref={svgRef}
            className="w-full h-auto"
            style={{ background: "transparent" }}
          />
          {getInsights()}
        </>
      )}
    </div>
  );
};

export default ToxicityTimelineChart;
