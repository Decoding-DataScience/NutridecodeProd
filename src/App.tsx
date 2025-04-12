import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;