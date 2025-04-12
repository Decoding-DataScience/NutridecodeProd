import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ScrollProgress from './components/ScrollProgress';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/Scan';
import Results from './pages/Results';
import History from './pages/History';
import Preferences from './pages/Preferences';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeDatabase } from './services/supabase';

const Routes = () => {
  useEffect(() => {
    // Initialize database when app starts
    const init = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollProgress />
      <RouterRoutes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            }
          />
          {/* Redirect /dashboard/* to /dashboard */}
          <Route
            path="/dashboard/*"
            element={<Navigate to="/dashboard" replace />}
          />
          {/* Redirect authenticated users accessing root to dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
        </Route>
      </RouterRoutes>
    </div>
  );
};

export default Routes; 