import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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

const Routes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollProgress />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected routes */}
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
          {/* Catch all other dashboard routes */}
          <Route
            path="/dashboard/*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Route>
        
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </div>
  );
};

export default Routes; 