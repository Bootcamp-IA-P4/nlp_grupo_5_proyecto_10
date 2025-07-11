import React, { useEffect, useRef } from "react";

const ConfidenceDistributionChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    // Process confidence data
    const confidenceRanges = {
      "Very Low (0-0.2)": 0,
      "Low (0.2-0.4)": 0,
      "Medium (0.4-0.6)": 0,
      "High (0.6-0.8)": 0,
      "Very High (0.8-1.0)": 0,
    };

    messages.forEach((msg) => {
      const conf = msg.confidence || 0.5;
      if (conf < 0.2) confidenceRanges["Very Low (0-0.2)"]++;
      else if (conf < 0.4) confidenceRanges["Low (0.2-0.4)"]++;
      else if (conf < 0.6) confidenceRanges["Medium (0.4-0.6)"]++;
      else if (conf < 0.8) confidenceRanges["High (0.6-0.8)"]++;
      else confidenceRanges["Very High (0.8-1.0)"]++;
    });

    const data = Object.entries(confidenceRanges).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / messages.length) * 100).toFixed(1),
    }));

    // Create the animated circular chart (inspired by the first SVG)
    renderCircularChart(data);
  }, [messages]);

  const renderCircularChart = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 50;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#059669"];

    // Create pie chart
    const pie = d3
      .pie()
      .value((d) => d.count)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.8);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add paths with animation
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colors[i])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .text((d) => `${d.data.percentage}%`)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay(1500)
      .style("opacity", 1);

    // Add center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#6b7280")
      .attr("font-weight", "bold")
      .text("MODEL")
      .attr("y", -5);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#6b7280")
      .attr("font-weight", "bold")
      .text("CONFIDENCE")
      .attr("y", 10);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Model Confidence Distribution
      </h3>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No confidence data available
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-md"
            style={{ background: "transparent" }}
          />

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {["Very Low", "Low", "Medium", "High", "Very High"].map(
              (level, i) => (
                <div key={level} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: [
                        "#ef4444",
                        "#f97316",
                        "#eab308",
                        "#22c55e",
                        "#059669",
                      ][i],
                    }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {level}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceDistributionChart;
