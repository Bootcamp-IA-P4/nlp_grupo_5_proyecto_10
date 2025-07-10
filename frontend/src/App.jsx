import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import SidebarLayout from './layouts/SidebarLayout';

function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Routes>
      </SidebarLayout>
    </Router>
  );
}

export default App;
