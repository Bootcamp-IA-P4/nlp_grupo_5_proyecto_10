// frontend/src/components/common/DarkModeToggle.jsx
import React from 'react';
import useDarkMode from '../../hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;
