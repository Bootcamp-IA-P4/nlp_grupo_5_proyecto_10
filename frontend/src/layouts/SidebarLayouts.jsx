import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarLayout = ({ children }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Messages', path: '/messages' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-purple-800 text-white">
        <div className="p-4 text-2xl font-bold">Optuma</div>
        <nav>
          <ul>
            {links.map(link => (
              <li key={link.name} className={`${location.pathname === link.path ? 'bg-purple-700' : ''}`}>
                <Link to={link.path} className="block px-4 py-2">{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default SidebarLayout;
