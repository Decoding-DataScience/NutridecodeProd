import { BrowserRouter as Router } from 'react-router-dom';
import { Suspense, StrictMode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';

function App() {
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