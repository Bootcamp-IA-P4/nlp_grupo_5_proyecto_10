import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SeasonalChart = ({ messages }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!messages.length) return;

    const processedData = processSeasonalData(messages);
    renderChart(processedData);
  }, [messages]);

  const processSeasonalData = (messages) => {
    const seasons = [
      { name: 'Spring', color: '#10b981' },
      { name: 'Summer', color: '#f59e0b' }, 
      { name: 'Autumn', color: '#ef4444' },
      { name: 'Winter', color: '#3b82f6' }
    ];
    
    const groupedData = {};
    seasons.forEach(season => {
      groupedData[season.name] = { 
        season: season.name, 
        color: season.color,
        total: 0, 
        toxic: 0, 
        toxicityRate: 0 
      };
    });
    
    messages.forEach(msg => {
      const month = new Date(msg.created_at).getMonth();
      let seasonName;
      
      if (month >= 2 && month <= 4) seasonName = 'Spring';
      else if (month >= 5 && month <= 7) seasonName = 'Summer';
      else if (month >= 8 && month <= 10) seasonName = 'Autumn';
      else seasonName = 'Winter';
      
      groupedData[seasonName].total++;
      if (msg.sentiment === 'toxic') {
        groupedData[seasonName].toxic++;
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
      .domain(data.map(d => d.season))
      .range([0, width])
      .padding(0.2);

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

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.season))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.toxicityRate))
      .attr('height', d => height - yScale(d.toxicityRate))
      .attr('fill', d => d.color)
      .attr('opacity', 0.8);

    // Value labels
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('x', d => xScale(d.season) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.toxicityRate) - 3)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .text(d => `${d.toxicityRate.toFixed(1)}%`);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        Seasonal Patterns
      </h4>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-8">No data</div>
      ) : (
        <svg ref={svgRef} className="w-full h-auto" />
      )}
    </div>
  );
};

export default SeasonalChart;
