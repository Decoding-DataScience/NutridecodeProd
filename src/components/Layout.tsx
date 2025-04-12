import { Outlet } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';
import Header from './Header';
import Footer from './Footer';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-white to-background-light">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-primary-light/20 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-secondary-light/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary-light/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <Breadcrumb />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout; 