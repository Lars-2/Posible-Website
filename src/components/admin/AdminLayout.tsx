import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar,
  Plug,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Schedules', href: '/admin/schedules', icon: Calendar },
    { name: 'Integrations', href: '/admin/integrations', icon: Plug },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Posible Admin</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Posible</h1>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${active ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-gray-200 space-y-3">
            <div className="px-3">
              <p className="text-xs font-medium text-gray-700 mb-1">{user?.email}</p>
              <br />
              {user?.twilio_number && (
                <>
                  <p className="text-xs text-gray-500 mb-0.5">Assigned Chat Number:</p>
                  <p className="text-xs text-gray-600 mb-1">{user.twilio_number}</p>
                </>
              )}
            </div>
            <Link
              to="/"
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="mr-3 h-5 w-5 text-gray-400" />
              Back to Website
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-gray-900 bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full pt-20 pb-4">
              <nav className="flex-1 px-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${active
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5
                          ${active ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'}
                        `}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-gray-200 space-y-3">
                <div className="px-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">{user?.email}</p>
                  {user?.twilio_number && (
                    <>
                      <p className="text-xs text-gray-500 mb-0.5">Assigned Chat Number:</p>
                      <p className="text-xs text-gray-600 mb-1">{user.twilio_number}</p>
                    </>
                  )}
                  <p className="text-xs text-gray-500">Admin Console</p>
                </div>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home className="mr-3 h-5 w-5 text-gray-400" />
                  Back to Website
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

