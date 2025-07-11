import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import MessagesPage from "./pages/MessagesPage";
import SidebarLayout from "./layouts/SidebarLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import HealthCheck from "./components/common/HealthCheck";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <SidebarLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/messages" element={<MessagesPage />} />
            </Routes>
          </SidebarLayout>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
