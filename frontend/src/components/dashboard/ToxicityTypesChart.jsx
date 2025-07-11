import React, { useEffect, useRef } from "react";

const ToxicityTypesChart = ({ messages }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!messages.length || !containerRef.current) return;

    // Simulate toxicity categories based on keywords in messages
    const toxicityCategories = {
      Abusive: 0,
      Threat: 0,
      "Hate Speech": 0,
      Obscene: 0,
      Provocative: 0,
    };

    // Keywords for each category (simplified classification)
    const categoryKeywords = {
      Abusive: ["idiot", "stupid", "moron", "dumb", "loser"],
      Threat: ["kill", "die", "hurt", "destroy", "attack"],
      "Hate Speech": ["hate", "racist", "discrimination", "prejudice"],
      Obscene: ["fuck", "shit", "damn", "hell", "ass"],
      Provocative: ["fight", "argue", "wrong", "bad", "terrible"],
    };

    // Classify toxic messages
    const toxicMessages = messages.filter((msg) => msg.sentiment === "toxic");

    toxicMessages.forEach((msg) => {
      const text = msg.text.toLowerCase();
      let classified = false;

      Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        if (!classified && keywords.some((keyword) => text.includes(keyword))) {
          toxicityCategories[category]++;
          classified = true;
        }
      });

      // If no specific category found, classify as general toxic
      if (!classified) {
        toxicityCategories["Provocative"]++;
      }
    });

    const total = Object.values(toxicityCategories).reduce(
      (sum, count) => sum + count,
      0
    );
    const percs = Object.values(toxicityCategories).map((count) =>
      total > 0 ? Math.round((count / total) * 100) : 0
    );
    const labels = Object.keys(toxicityCategories);
    const colors = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#ec4899"];

    // Clear previous content
    containerRef.current.innerHTML = `
      <div class="toxicity-chart-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 778 590" class="toxicity-svg">
          <circle class="mt-base" cx="389" cy="294" r="209" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="1.01" opacity="0.3" />
          <path class="mt-base-2" d="M559,294A170,170,0,1,1,389,124,170,170,0,0,1,559,294Z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="40" />
          <g class="mt-rings" fill="none" stroke-miterlimit="10" stroke-width="10">
            <path class="mt-base-2-track" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="#e5e7eb" />
            ${labels
              .map(
                (label, i) =>
                  `<path class="mt-ring mt-ring-${i}" d="M389,124A170,170,0,1,1,219,294,170,170,0,0,1,389,124Z" stroke="${colors[i]}" />`
              )
              .join("")}
            <text class="mt-text" x="320" y="303" font-size="20" fill="currentColor" font-weight="bold">TOXICITY TYPES</text>
          </g>
          <g class="mt-perc-lines">
            ${labels
              .map(
                (_, i) =>
                  `<rect class="mt-perc-line" x="388" y="94" width="2" height="49" fill="currentColor" />`
              )
              .join("")}
          </g>
          <line class="mt-line" x1="389" y1="294" x2="389" y2="94" fill="currentColor" stroke="currentColor" stroke-miterlimit="10" stroke-width="2" />
          <g class="mt-markers" fill="none" stroke="currentColor" stroke-miterlimit="10">
            ${labels
              .map(
                (_, i) =>
                  `<line class="mt-marker mt-marker-${i}" x1="389.5" y1="107" x2="389.5" y2="17" />`
              )
              .join("")}
          </g>
          <g class="mt-figures">
            <text class="toxicity-label" x="180" y="40" font-size="13" fill="currentColor">${
              labels[4]
            } - <tspan font-weight="bold">${percs[4]}%</tspan></text>
            <text class="toxicity-label" x="570" y="90" font-size="13" fill="currentColor">${
              labels[3]
            } - <tspan font-weight="bold">${percs[3]}%</tspan></text>
            <text class="toxicity-label" x="600" y="380" font-size="13" fill="currentColor">${
              labels[2]
            } - <tspan font-weight="bold">${percs[2]}%</tspan></text>
            <text class="toxicity-label" x="100" y="420" font-size="13" fill="currentColor">${
              labels[1]
            } - <tspan font-weight="bold">${percs[1]}%</tspan></text>
            <text class="toxicity-label" x="50" y="180" font-size="13" fill="currentColor">${
              labels[0]
            } - <tspan font-weight="bold">${percs[0]}%</tspan></text>
          </g>
        </svg>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement("style");
    style.textContent = `
      .toxicity-chart-container {
        width: 100%;
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .toxicity-svg {
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
      .toxicity-label {
        opacity: 0;
      }
    `;
    containerRef.current.appendChild(style);

    // Animation sequence
    setTimeout(() => animateChart(percs), 100);
  }, [messages]);

  const animateChart = (percs) => {
    const svg = containerRef.current.querySelector(".toxicity-svg");
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

    // Animation timeline
    const animations = [
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
          svg.querySelectorAll(".toxicity-label").forEach((el) => {
            el.style.opacity = "1";
            el.style.transition = "opacity 1s ease-in";
          });
        }, 1600),
    ];

    animations.forEach((fn, i) => setTimeout(fn, i * 50));
  };

  const animateElement = (selector, property, value, duration) => {
    if (!containerRef.current) return;

    const element = containerRef.current.querySelector(selector);
    if (element) {
      element.style[property] = value;
      element.style.transition = `${property} ${duration}ms ease-in-out`;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Toxicity Types Distribution
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Analysis of different types of toxic content in YouTube comments
      </p>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No toxicity data available
        </div>
      ) : (
        <div ref={containerRef} className="text-gray-800 dark:text-gray-200" />
      )}
    </div>
  );
};

export default ToxicityTypesChart;
