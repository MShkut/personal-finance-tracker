import React from 'react';

import { useTheme } from 'contexts/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`fixed top-8 right-8 z-50 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          p-4 transition-colors focus:outline-none
          ${isDarkMode 
            ? 'text-gray-400 hover:text-gray-300' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <span className="text-3xl">{isDarkMode ? '◐' : '◑'}</span>
      </button>
    </div>
  );
}
