import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Resolutions from './pages/Resolutions';
import Ordinances from './pages/Ordinances';
import Procurements from './pages/Procurements';
import Budgets from './pages/Budgets';
import Vacancies from './pages/Vacancies';
import Announcements from './pages/Announcements';
import AdminDashboard from './pages/admin/Dashboard';
import AdminResolutions from './pages/admin/Resolutions';
import AdminOrdinances from './pages/admin/Ordinances';
import AdminProcurements from './pages/admin/Procurements';
import AdminBudgets from './pages/admin/Budgets';
import AdminVacancies from './pages/admin/Vacancies';
import AdminApplications from './pages/admin/Applications';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminTemplates from './pages/admin/Templates';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="resolutions" element={<Resolutions />} />
          <Route path="ordinances" element={<Ordinances />} />
          <Route path="procurements" element={<Procurements />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="vacancies" element={<Vacancies />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={isAuthenticated ? <AdminLayout /> : <Navigate to="/" replace />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="resolutions" element={<AdminResolutions />} />
          <Route path="ordinances" element={<AdminOrdinances />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="procurements" element={<AdminProcurements />} />
          <Route path="budgets" element={<AdminBudgets />} />
          <Route path="vacancies" element={<AdminVacancies />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
