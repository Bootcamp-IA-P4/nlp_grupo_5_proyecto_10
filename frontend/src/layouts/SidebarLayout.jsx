// frontend/src/layouts/SidebarLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarLayout = ({ children }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Messages', path: '/messages' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-purple-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold tracking-wide">Optuma</div>
        <nav className="flex flex-col flex-1 px-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-4 py-3 rounded-md font-semibold transition-colors
                ${
                  location.pathname === link.path
                    ? 'bg-purple-700 text-white shadow'
                    : 'text-purple-200 hover:bg-purple-700 hover:text-white'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        {/* Footer o logout botón podrían ir aquí */}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default SidebarLayout;
