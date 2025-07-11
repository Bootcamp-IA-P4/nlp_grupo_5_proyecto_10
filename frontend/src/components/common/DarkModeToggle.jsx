// frontend/src/components/common/DarkModeToggle.jsx
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-purple-200">
        {theme === "light" ? "☀️" : "🌙"}
      </span>
      <button
        onClick={toggleTheme}
        className="relative w-12 h-6 bg-purple-300 dark:bg-purple-600 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
            theme === "dark" ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs text-purple-200">
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </div>
  );
};

export default DarkModeToggle;
