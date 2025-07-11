import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const YearlyTrendChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    const processedData = processYearlyData(messages);
    renderChart(processedData);
  }, [messages]);

  const processYearlyData = (messages) => {
    const groupedData = {};
    
    messages.forEach(msg => {
      const year = new Date(msg.created_at).getFullYear();
      
      if (!groupedData[year]) {
        groupedData[year] = { year, total: 0, toxic: 0, toxicityRate: 0 };
      }
      
      groupedData[year].total++;
      if (msg.sentiment === 'toxic') {
        groupedData[year].toxic++;
      }
    });

    return Object.values(groupedData)
      .map(data => ({
        ...data,
        toxicityRate: data.total > 0 ? (data.toxic / data.total) * 100 : 0
      }))
      .sort((a, b) => a.year - b.year);
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

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.toxicityRate)])
      .nice()
      .range([height, 0]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d))
      .selectAll('text')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('text')
      .style('font-size', '10px');

    // Line
    const line = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => yScale(d.toxicityRate))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.toxicityRate))
      .attr('r', 3)
      .attr('fill', '#ef4444');
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        Yearly Evolution
      </h4>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-8">No data</div>
      ) : (
        <svg ref={svgRef} className="w-full h-auto" />
      )}
    </div>
  );
};

export default YearlyTrendChart;
