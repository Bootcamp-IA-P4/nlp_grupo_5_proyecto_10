import React, { useEffect, useRef } from "react";

const CircularSentimentChart = ({ stats }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!stats || !svgRef.current) return;

    // Calculate percentages
    const total = stats.total_messages || 1;
    const toxicPerc = Math.round((stats.toxic_messages / total) * 100);
    const notToxicPerc = Math.round((stats.not_toxic_messages / total) * 100);
    const youtubePerc = Math.round((stats.youtube_messages / total) * 100);
    const manualPerc = Math.round((stats.manual_messages / total) * 100);

    const percentages = [toxicPerc, notToxicPerc, youtubePerc, manualPerc];
    const colors = ["#ef4444", "#22c55e", "#dc2626", "#8b5cf6"];
    const labels = ["TOXIC", "NOT TOXIC", "YOUTUBE", "MANUAL"];

    // Calculate stroke-dasharray for each segment
    const circumference = 2 * Math.PI * 170; // radius = 170
    let currentOffset = 0;

    percentages.forEach((perc, index) => {
      const segmentLength = (perc / 100) * circumference;
      const ring = svgRef.current.querySelector(`.sentiment-ring-${index}`);
      const marker = svgRef.current.querySelector(`.sentiment-marker-${index}`);
      const figure = svgRef.current.querySelector(`.sentiment-figure-${index}`);

      if (ring) {
        ring.style.strokeDasharray = `${segmentLength} ${circumference}`;
        ring.style.strokeDashoffset = -currentOffset;
        ring.style.stroke = colors[index];
      }

      if (marker) {
        const angle =
          ((currentOffset + segmentLength / 2) / circumference) * 360 - 90;
        marker.style.transform = `rotate(${angle}deg)`;
        marker.style.transformOrigin = "389px 294px";
      }

      if (figure) {
        figure.textContent = `${labels[index]} - ${perc}%`;
      }

      currentOffset += segmentLength;
    });
  }, [stats]);

  if (!stats) return null;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
        }}
      />

      <svg
        ref={svgRef}
        className="relative z-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 778 590"
        style={{ width: "100%", height: "100%", maxWidth: "600px" }}
      >
        {/* Base circles */}
        <circle
          cx="389"
          cy="294"
          r="209"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Track ring */}
        <circle
          cx="389"
          cy="294"
          r="170"
          fill="none"
          stroke="#ffffff40"
          strokeWidth="40"
        />

        {/* Sentiment rings */}
        <g fill="none" strokeWidth="40" strokeLinecap="round">
          <circle
            className="sentiment-ring-0"
            cx="389"
            cy="294"
            r="170"
            transform="rotate(-90 389 294)"
          />
          <circle
            className="sentiment-ring-1"
            cx="389"
            cy="294"
            r="170"
            transform="rotate(-90 389 294)"
          />
          <circle
            className="sentiment-ring-2"
            cx="389"
            cy="294"
            r="170"
            transform="rotate(-90 389 294)"
          />
          <circle
            className="sentiment-ring-3"
            cx="389"
            cy="294"
            r="170"
            transform="rotate(-90 389 294)"
          />
        </g>

        {/* Center text */}
        <text
          x="389"
          y="290"
          textAnchor="middle"
          className="fill-white text-lg font-light"
          fontSize="24"
        >
          SENTIMENT
        </text>
        <text
          x="389"
          y="315"
          textAnchor="middle"
          className="fill-white text-sm font-light"
          fontSize="16"
        >
          ANALYSIS
        </text>

        {/* Markers */}
        <g stroke="#fff" strokeWidth="2" fill="none">
          <line
            className="sentiment-marker-0"
            x1="389"
            y1="294"
            x2="389"
            y2="124"
          />
          <line
            className="sentiment-marker-1"
            x1="389"
            y1="294"
            x2="389"
            y2="124"
          />
          <line
            className="sentiment-marker-2"
            x1="389"
            y1="294"
            x2="389"
            y2="124"
          />
          <line
            className="sentiment-marker-3"
            x1="389"
            y1="294"
            x2="389"
            y2="124"
          />
        </g>

        {/* Labels */}
        <g className="fill-white text-sm font-light">
          <text className="sentiment-figure-0" x="260" y="50" fontSize="14" />
          <text className="sentiment-figure-1" x="520" y="100" fontSize="14" />
          <text className="sentiment-figure-2" x="520" y="500" fontSize="14" />
          <text className="sentiment-figure-3" x="100" y="450" fontSize="14" />
        </g>
      </svg>
    </div>
  );
};

export default CircularSentimentChart;
