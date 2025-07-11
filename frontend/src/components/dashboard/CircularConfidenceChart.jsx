import React, { useEffect, useRef } from "react";

const CircularConfidenceChart = ({ messages }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!messages.length || !containerRef.current) return;

    // Process confidence data into 5 categories
    const confidenceRanges = {
      "Very Low": 0,
      Low: 0,
      Medium: 0,
      High: 0,
      "Very High": 0,
    };

    messages.forEach((msg) => {
      const conf = msg.confidence || 0.5;
      if (conf < 0.2) confidenceRanges["Very Low"]++;
      else if (conf < 0.4) confidenceRanges["Low"]++;
      else if (conf < 0.6) confidenceRanges["Medium"]++;
      else if (conf < 0.8) confidenceRanges["High"]++;
      else confidenceRanges["Very High"]++;
    });

    const total = messages.length;
    const percs = Object.values(confidenceRanges).map((count) =>
      total > 0 ? Math.round((count / total) * 100) : 0
    );
    const labels = Object.keys(confidenceRanges);

    // Clear previous content
    containerRef.current.innerHTML = `
      <div class="confidence-chart-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 778 590" class="confidence-svg">
          <circle class="mt-base" cx="389" cy="294" r="209" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="1.01" opacity="0.3" />
          <path class="mt-base-2" d="M559,294A170,170,0,1,1,389,124,170,170,0,0,1,559,294Z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="40" />
          <g class="mt-rings" fill="none" stroke-miterlimit="10" stroke-width="10">
            <path class="mt-base-2-track" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#e5e7eb" />
            <path class="mt-ring mt-ring-0" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#ef4444" />
            <path class="mt-ring mt-ring-1" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#f97316" />
            <path class="mt-ring mt-ring-2" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#eab308" />
            <path class="mt-ring mt-ring-3" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#22c55e" />
            <path class="mt-ring mt-ring-4" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#059669" />
            <text class="mt-text" x="330" y="303" font-size="24" fill="currentColor" font-weight="bold">CONFIDENCE</text>
          </g>
          <g class="mt-perc-lines">
            <rect class="mt-perc-line" x="388" y="94" width="2" height="49" fill="currentColor" />
            <rect class="mt-perc-line" x="388" y="94" width="2" height="49" fill="currentColor" />
            <rect class="mt-perc-line" x="388" y="94" width="2" height="49" fill="currentColor" />
            <rect class="mt-perc-line" x="388" y="94" width="2" height="49" fill="currentColor" />
            <rect class="mt-perc-line" x="388" y="94" width="2" height="49" fill="currentColor" />
          </g>
          <line class="mt-line" x1="389" y1="294" x2="389" y2="94" fill="currentColor" stroke="currentColor" stroke-miterlimit="10" stroke-width="2" />
          <g class="mt-markers" fill="none" stroke="currentColor" stroke-miterlimit="10">
            <line class="mt-marker mt-marker-0" x1="389.5" y1="107" x2="389.5" y2="17" />
            <line class="mt-marker mt-marker-1" x1="389.5" y1="107" x2="389.5" y2="17" />
            <line class="mt-marker mt-marker-2" x1="389.5" y1="107" x2="389.5" y2="17" />
            <line class="mt-marker mt-marker-3" x1="389.5" y1="107" x2="389.5" y2="17" />
            <line class="mt-marker mt-marker-4" x1="389.5" y1="107" x2="389.5" y2="17" />
          </g>
          <g class="mt-figures">
            <text class="confidence-label" x="200" y="30" font-size="14" fill="currentColor">${labels[4]} - <tspan font-weight="bold">${percs[4]}%</tspan></text>
            <text class="confidence-label" x="578" y="78" font-size="14" fill="currentColor">${labels[3]} - <tspan font-weight="bold">${percs[3]}%</tspan></text>
            <text class="confidence-label" x="620" y="398" font-size="14" fill="currentColor">${labels[2]} - <tspan font-weight="bold">${percs[2]}%</tspan></text>
            <text class="confidence-label" x="120" y="432" font-size="14" fill="currentColor">${labels[1]} - <tspan font-weight="bold">${percs[1]}%</tspan></text>
            <text class="confidence-label" x="50" y="180" font-size="14" fill="currentColor">${labels[0]} - <tspan font-weight="bold">${percs[0]}%</tspan></text>
          </g>
        </svg>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement("style");
    style.textContent = `
      .confidence-chart-container {
        width: 100%;
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .confidence-svg {
        width: 100%;
        height: 100%;
        max-width: 500px;
        visibility: hidden;
      }
      .mt-perc-line {
        transform-origin: 1px 200px;
        opacity: 0;
      }
      .mt-base-2 {
        transform-origin: 50% 50%;
        transform: rotate(-90deg);
        stroke-dasharray: 0, 1000;
      }
      .mt-base-2-track {
        transform-origin: 50% 50%;
        stroke-dasharray: 0, 1000;
      }
      .mt-marker {
        transform-origin: 1px 277px;
        stroke-dasharray: 0, 1000;
      }
      .mt-ring {
        stroke-dasharray: 0, 1000;
      }
      .mt-line {
        stroke-dasharray: 0, 2;
      }
    `;
    containerRef.current.appendChild(style);

    // Animation sequence
    setTimeout(() => animateChart(percs), 100);
  }, [messages]);

  const animateChart = (percs) => {
    const svg = containerRef.current.querySelector(".confidence-svg");
    if (!svg) return;

    svg.style.visibility = "visible";

    // Calculate percentage ranges for arcs
    let addPercs = 0;
    const percsRange = [];
    const percsEnd = [];
    const markersAngles = [];

    percs.forEach((perc, i) => {
      percsEnd.push(addPercs);
      const tempStart = addPercs;
      addPercs = addPercs + perc;
      const rangeString = `${tempStart}% ${addPercs}%`;
      percsRange.push(rangeString);
      markersAngles.push(
        ((tempStart + (addPercs - tempStart) / 2) / 100) * 360
      );
    });

    percsEnd.reverse();
    markersAngles.reverse();

    // Animate elements
    const timeline = [
      () => animateElement(".mt-line", "stroke-dasharray", "0px 200px", 400),
      () =>
        setTimeout(
          () =>
            animateElement(".mt-line", "stroke-dasharray", "200px 150px", 300),
          400
        ),
      () =>
        setTimeout(() => {
          svg.querySelector(".mt-line").style.opacity = "0";
          svg
            .querySelectorAll(".mt-perc-line")
            .forEach((el) => (el.style.opacity = "1"));
        }, 700),
      () =>
        setTimeout(
          () =>
            animateElement(".mt-base-2", "stroke-dasharray", "0% 100%", 1400),
          800
        ),
      () =>
        setTimeout(
          () =>
            animateElement(
              ".mt-base-2-track",
              "stroke-dasharray",
              "0% 100%",
              1000
            ),
          850
        ),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".mt-perc-line").forEach((el, i) => {
            setTimeout(() => {
              el.style.transform = `rotate(${(percsEnd[i] / 100) * 360}deg)`;
              el.style.transition = "transform 1.4s ease-in-out";
            }, i * 100);
          });
        }, 900),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".mt-marker").forEach((el, i) => {
            setTimeout(() => {
              el.style.transform = `rotate(${markersAngles[i]}deg)`;
              el.style.strokeDasharray = "0% 100%";
              el.style.transition =
                "transform 0.8s ease-out, stroke-dasharray 0.8s ease-out";
            }, i * 100);
          });
        }, 1000),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".mt-ring").forEach((el, i) => {
            el.style.strokeDasharray = percsRange[i];
            el.style.transition = "stroke-dasharray 1.4s ease-in-out";
          });
        }, 1100),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".mt-figures text").forEach((el) => {
            el.style.opacity = "1";
            el.style.transition = "opacity 1s ease-in";
          });
        }, 1600),
    ];

    timeline.forEach((fn, i) => setTimeout(fn, i * 50));
  };

  const animateElement = (selector, property, value, duration) => {
    const element = containerRef.current.querySelector(selector);
    if (element) {
      element.style[property] = value;
      element.style.transition = `${property} ${duration}ms ease-in-out`;
    }
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
        <div ref={containerRef} className="text-gray-800 dark:text-gray-200" />
      )}
    </div>
  );
};

export default CircularConfidenceChart;
