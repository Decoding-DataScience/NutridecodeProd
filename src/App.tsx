import { BrowserRouter as Router } from 'react-router-dom';
import { Suspense, StrictMode, useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import { initializeDatabase } from './services/supabase';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitialized(true); // Continue even if DB init fails
      }
    };
    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <StrictMode>
      <Router>
        <AuthProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            <Routes />
          </Suspense>
        </AuthProvider>
      </Router>
    </StrictMode>
  );
}

export default App;