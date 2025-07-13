// frontend/src/layouts/SidebarLayout.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeToggle from "../components/common/DarkModeToggle";

const SidebarLayout = ({ children }) => {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Messages", path: "/messages" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-48 bg-purple-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold tracking-wide">Opssuma</div>
        <nav className="flex flex-col flex-1 px-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-md font-medium transition-colors text-sm
                ${
                  location.pathname === link.path
                    ? "bg-purple-700 text-white shadow"
                    : "text-purple-200 hover:bg-purple-700 hover:text-white"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-3">
          <DarkModeToggle />
        </div>
        {/* Footer o logout botón podrían ir aquí */}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default SidebarLayout;
