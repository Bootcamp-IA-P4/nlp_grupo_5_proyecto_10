#!/bin/bash
# filepath: c:\Users\USUARIO\desktop\factoria-f5\biap4\nlp_grupo_5_proyecto_10\cleanup.sh

echo "Cleaning up unnecessary files..."

# Remove timeline-related components (if they exist)
rm -rf frontend/src/components/timeline
rm -f frontend/src/components/charts/TimelineChart.jsx
rm -f frontend/src/components/charts/TimestampChart.jsx

# Remove old chart components we replaced
rm -f frontend/src/components/dashboard/OldDashboard.jsx
rm -f frontend/src/components/dashboard/BasicCharts.jsx

# Remove development/test files
rm -rf frontend/src/test
rm -rf frontend/src/testing

# Remove backup files
find . -name "*.bak" -delete 2>/dev/null
find . -name "*.backup" -delete 2>/dev/null

# Remove log files
find . -name "*.log" -delete 2>/dev/null

# Remove temporary files
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.temp" -delete 2>/dev/null

echo "Cleanup completed!"