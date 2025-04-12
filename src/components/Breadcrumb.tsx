import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  '': 'Home',
  'dashboard': 'Dashboard',
  'scan': 'Scan',
  'results': 'Results',
  'preferences': 'Preferences',
  'history': 'History'
};

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 py-4 px-6 bg-white border-b">
      <Link to="/" className="flex items-center hover:text-blue-600">
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.length > 0 && (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center">
            <Link
              to={routeTo}
              className={`${
                isLast 
                  ? 'text-gray-900 font-medium cursor-default pointer-events-none' 
                  : 'hover:text-blue-600'
              }`}
            >
              {routeNames[name] || name}
            </Link>
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
            )}
          </div>
        );
      })}
    </nav>
  );
}; 