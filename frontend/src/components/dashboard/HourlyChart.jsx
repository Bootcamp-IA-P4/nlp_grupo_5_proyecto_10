import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HourlyChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    const processedData = processHourlyData(messages);
    renderChart(processedData);
  }, [messages]);

  const processHourlyData = (messages) => {
    const groupedData = {};
    
    // Initialize all 24 hours
    for (let hour = 0; hour < 24; hour++) {
      groupedData[hour] = { hour, total: 0, toxic: 0, toxicityRate: 0 };
    }
    
    messages.forEach(msg => {
      const hour = new Date(msg.created_at).getHours();
      groupedData[hour].total++;
      if (msg.sentiment === 'toxic') {
        groupedData[hour].toxic++;
      }
    });

    return Object.values(groupedData).map(data => ({
      ...data,
      toxicityRate: data.total > 0 ? (data.toxic / data.total) * 100 : 0
    }));
  };

  const renderChart = (data) => {
    if (!data.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 300 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.toxicityRate)])
      .nice()
      .range([height, 0]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => d + 'h'))
      .selectAll('text')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('text')
      .style('font-size', '10px');

    // Line
    const line = d3.line()
      .x(d => xScale(d.hour))
      .y(d => yScale(d.toxicityRate))
      .curve(d3.curveCardinal);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Area
    const area = d3.area()
      .x(d => xScale(d.hour))
      .y0(height)
      .y1(d => yScale(d.toxicityRate))
      .curve(d3.curveCardinal);

    g.append('path')
      .datum(data)
      .attr('fill', '#f59e0b')
      .attr('fill-opacity', 0.2)
      .attr('d', area);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        Hourly Activity
      </h4>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-8">No data</div>
      ) : (
        <svg ref={svgRef} className="w-full h-auto" />
      )}
    </div>
  );
};

export default HourlyChart;
