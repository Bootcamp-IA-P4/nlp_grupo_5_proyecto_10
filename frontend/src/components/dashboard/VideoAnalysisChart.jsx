import React, { useEffect, useRef } from "react";

const VideoAnalysisChart = ({ messages }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!messages.length || !containerRef.current) return;

    // Simulate video analysis - group messages by video (simplified)
    const videoData = {};

    messages.forEach((msg, index) => {
      // Simulate VideoId based on message groups
      const videoId = `Video_${Math.floor(index / 5) + 1}`;

      if (!videoData[videoId]) {
        videoData[videoId] = {
          totalComments: 0,
          toxicComments: 0,
          videoTitle: `YouTube Video ${Math.floor(index / 5) + 1}`,
          category: ["Gaming", "Music", "News", "Entertainment", "Education"][
            Math.floor(index / 5) % 5
          ],
        };
      }

      videoData[videoId].totalComments++;
      if (msg.sentiment === "toxic") {
        videoData[videoId].toxicComments++;
      }
    });

    // Get top 5 videos by total comments
    const topVideos = Object.entries(videoData)
      .sort(([, a], [, b]) => b.totalComments - a.totalComments)
      .slice(0, 5);

    const vals = topVideos.map(([, data]) => data.totalComments);
    const toxicRates = topVideos.map(([, data]) =>
      data.totalComments > 0
        ? ((data.toxicComments / data.totalComments) * 100).toFixed(1)
        : 0
    );

    // Calculate percentages for visualization
    const total = Math.max(...vals) || 1;
    const percs = vals.map((val) => (100 * val) / total);

    // Clear previous content
    containerRef.current.innerHTML = `
      <div class="video-chart-container">
        <svg class="circ-graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500">
          <defs>
            <filter id="goo-video" color-interpolation-filters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter> 
          </defs>
          <g id="base-lines" opacity="0.18" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="25">
            <path d="M430.5,250A55.5,55.5,0,1,1,375,194.5" />
            <path d="M470.5,250A95.5,95.5,0,1,1,375,154.5" />
            <path d="M510.5,250A135.5,135.5,0,1,1,375,114.5" />
            <path d="M550.5,250A175.5,175.5,0,1,1,375,74.5" />
            <path d="M590.5,250C590.5,369,494,465.5,375,465.5S159.5,369,159.5,250,256,34.5,375,34.5" />
          </g>
          <g id="mid-lines" opacity="0.44" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="4">
            <path d="M445,250a70,70,0,1,1-70-70" />
            <path d="M485,250A110,110,0,1,1,375,140" />
            <path d="M525,250A150,150,0,1,1,375,100" />
            <path d="M565,250c0,104.93-85.07,190-190,190S185,354.93,185,250,270.07,60,375,60" />
            <path d="M605,250c0,127-103,230-230,230S145,377,145,250,248,20,375,20" />
          </g>
          <g id="top-lines" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="4">
            <path class="line0 line" d="M375,180a70,70,0,1,0,70,70" />
            <path class="line1 line" d="M375,140A110,110,0,1,0,485,250" />
            <path class="line2 line" d="M375,100A150,150,0,1,0,525,250" />
            <path class="line3 line" d="M375,60c-104.93,0-190,85.07-190,190s85.07,190,190,190,190-85.07,190-190" />
            <path class="line4 line" d="M375,20C248,20,145,123,145,250S248,480,375,480,605,377,605,250" />
          </g>
          <g id="horz-lines" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="4">
            <line x1="375" y1="180" x2="456" y2="180" />
            <line x1="375" y1="140" x2="456" y2="140" />
            <line x1="375" y1="100" x2="456" y2="100" />
            <line x1="375" y1="60" x2="456" y2="60" />
            <line x1="375" y1="20" x2="456" y2="20" />
          </g>
          <g id="video-info">
            ${topVideos
              .map(
                ([videoId, data], i) => `
              <g class="video-item">
                <text class="video-title" transform="translate(484 ${
                  201 - i * 40
                })" font-size="12" fill="currentColor" font-weight="bold">${
                  data.videoTitle
                }</text>
                <text class="video-category" transform="translate(484 ${
                  218 - i * 40
                })" font-size="10" fill="currentColor">${data.category} • ${
                  data.totalComments
                } comments</text>
                <text class="video-toxicity" transform="translate(620 ${
                  201 - i * 40
                })" font-size="11" fill="${
                  toxicRates[i] > 30
                    ? "#ef4444"
                    : toxicRates[i] > 15
                    ? "#f97316"
                    : "#22c55e"
                }" font-weight="bold">${toxicRates[i]}% toxic</text>
              </g>
            `
              )
              .join("")}
          </g>
          <g class="goo" filter="url(#goo-video)">
            <g id="circles" fill="currentColor">
              <circle class="circ4 circ" cx="375" cy="20" r="15" />
              <circle class="circ3 circ" cx="375" cy="60" r="15" />
              <circle class="circ2 circ" cx="375" cy="100" r="15" />
              <circle class="circ1 circ" cx="375" cy="140" r="15" />
              <circle class="circ0 circ" cx="375" cy="180" r="15" />
            </g>
            <circle id="center-circ" cx="375" cy="250" r="30.5" fill="currentColor" />
          </g>
          <text id="gain" transform="translate(356.43 255)" font-size="15" fill="#7b5ba3" font-weight="bold">VIDEOS</text>
          <text class="value" opacity="0" font-size="12" fill="#7b5ba3" font-weight="bold"></text>
          <text class="value" opacity="0" font-size="12" fill="#7b5ba3" font-weight="bold"></text>
          <text class="value" opacity="0" font-size="12" fill="#7b5ba3" font-weight="bold"></text>
          <text class="value" opacity="0" font-size="12" fill="#7b5ba3" font-weight="bold"></text>
          <text class="value" opacity="0" font-size="12" fill="#7b5ba3" font-weight="bold"></text>
        </svg>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement("style");
    style.textContent = `
      .video-chart-container {
        width: 100%;
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .circ-graph {
        width: 100%;
        height: 100%;
        max-width: 600px;
        visibility: hidden;
      }
      #base-lines path, #mid-lines path, #top-lines path {
        stroke-dasharray: 0, 1000;
      }
      .circ {
        opacity: 0;
        transform: translate(-50%, -50%);
      }
      #center-circ {
        transform-origin: 50% 50%;
        transform: scale(0);
      }
      #horz-lines line {
        transform: scaleX(0);
        transform-origin: left center;
      }
      .video-item {
        opacity: 0;
        transform: translateX(20px);
      }
    `;
    containerRef.current.appendChild(style);

    // Start animation
    setTimeout(() => animateVideoChart(percs, vals), 100);
  }, [messages]);

  const animateVideoChart = (percs, vals) => {
    const svg = containerRef.current.querySelector(".circ-graph");
    if (!svg) return;

    svg.style.visibility = "visible";

    // Animation timeline similar to the original
    const animations = [
      () => {
        const centerCirc = svg.querySelector("#center-circ");
        centerCirc.style.transform = "scale(1)";
        centerCirc.style.transition =
          "transform 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      },
      () =>
        setTimeout(() => {
          const gain = svg.querySelector("#gain");
          gain.style.opacity = "1";
          gain.style.transition = "opacity 0.3s ease";
        }, 200),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".circ").forEach((circ, i) => {
            setTimeout(() => {
              circ.style.opacity = "1";
              circ.style.transition =
                "opacity 0.5s ease, transform 2.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }, i * 150);
          });
        }, 400),
      () =>
        setTimeout(() => {
          svg.querySelectorAll("#base-lines path").forEach((path, i) => {
            setTimeout(() => {
              path.style.strokeDasharray = "1000, 0";
              path.style.transition =
                "stroke-dasharray 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }, i * 150);
          });
        }, 700),
      () =>
        setTimeout(() => {
          svg.querySelectorAll("#mid-lines path").forEach((path, i) => {
            setTimeout(() => {
              path.style.strokeDasharray = "1000, 0";
              path.style.transition =
                "stroke-dasharray 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }, i * 150);
          });
        }, 900),
      () =>
        setTimeout(() => {
          svg.querySelectorAll("#top-lines path").forEach((path, i) => {
            setTimeout(() => {
              const percentage = percs[i] || 0;
              path.style.strokeDasharray = `${percentage * 10}, 1000`;
              path.style.transition =
                "stroke-dasharray 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }, i * 150);
          });
        }, 1100),
      () =>
        setTimeout(() => {
          svg.querySelectorAll("#horz-lines line").forEach((line, i) => {
            setTimeout(() => {
              line.style.transform = "scaleX(1)";
              line.style.transition =
                "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }, i * 150);
          });
        }, 800),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".video-item").forEach((item, i) => {
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "translateX(0)";
              item.style.transition =
                "opacity 0.35s ease, transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }, i * 100);
          });
        }, 1000),
      () =>
        setTimeout(() => {
          svg.querySelectorAll(".value").forEach((value, i) => {
            value.setAttribute("x", 375 - 10);
            value.setAttribute("y", 20 + i * 40 + 5);
            value.textContent = vals.reverse()[i] || 0;
            value.style.opacity = "1";
            value.style.transition = "opacity 0.5s ease";
          });
        }, 1500),
    ];

    animations.forEach((fn) => fn());
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Video Comment Analysis
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Toxicity levels across different YouTube videos
      </p>

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No video data available
        </div>
      ) : (
        <div ref={containerRef} className="text-gray-800 dark:text-gray-200" />
      )}
    </div>
  );
};

export default VideoAnalysisChart;
