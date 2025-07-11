import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const WeeklyChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    const processedData = processWeeklyData(messages);
    renderChart(processedData);
  }, [messages]);

  const processWeeklyData = (messages) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const groupedData = {};
    
    days.forEach((day, index) => {
      groupedData[index] = { day, total: 0, toxic: 0, toxicityRate: 0 };
    });
    
    messages.forEach(msg => {
      const dayIndex = new Date(msg.created_at).getDay();
      groupedData[dayIndex].total++;
      if (msg.sentiment === 'toxic') {
        groupedData[dayIndex].toxic++;
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

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.day))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.toxicityRate)])
      .nice()
      .range([height, 0]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('text')
      .style('font-size', '10px');

    // Bars with weekend highlighting
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.day))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.toxicityRate))
      .attr('height', d => height - yScale(d.toxicityRate))
      .attr('fill', d => (d.day === 'Sat' || d.day === 'Sun') ? '#f59e0b' : '#3b82f6')
      .attr('opacity', 0.8);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        Weekly Patterns
      </h4>
      <p className="text-xs text-gray-500">🟦 Weekdays 🟨 Weekends</p>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-8">No data</div>
      ) : (
        <svg ref={svgRef} className="w-full h-auto" />
      )}
    </div>
  );
};

export default WeeklyChart;
