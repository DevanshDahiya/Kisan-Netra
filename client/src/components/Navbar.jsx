import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import FeedbackModal from './FeedbackModal';
import { Package, Search, Store, ShieldCheck, LogOut, LogIn, UserPlus, Sun, Moon, User, Home, MessageSquare, BookOpen, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) =>
    `px-3 py-2 text-sm font-medium rounded-btn transition-colors flex items-center gap-1.5 ${
      isActive(path)
        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/80 dark:text-primary-200 font-semibold border border-primary-300/70 dark:border-primary-700/60 shadow-2xs'
        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkSurface-hover'
    }`;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 dark:bg-darkSurface-card dark:text-neutral-200 border border-neutral-300 dark:border-darkSurface-border capitalize">
            <ShieldCheck className="w-3 h-3 text-primary-700 dark:text-primary-400" /> Admin
          </span>
        );
      case 'dealer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent-50 text-accent-800 dark:bg-accent-950/60 dark:text-accent-300 border border-accent-200 dark:border-accent-800/60 capitalize">
            <Store className="w-3 h-3 text-accent-600 dark:text-accent-400" /> Dealer
          </span>
        );
      case 'farmer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 capitalize">
            <User className="w-3 h-3 text-primary-600 dark:text-primary-400" /> Farmer
          </span>
        );
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-darkSurface-surface/95 border-b border-neutral-200 dark:border-darkSurface-border shadow-xs backdrop-blur-md transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex justify-between items-center">

          {/* Brand Logo */}
          <Logo size="md" />

          {/* Nav Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link to="/" className={linkStyle('/')}>
              <Home className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link to="/guide" className={linkStyle('/guide')}>
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="hidden md:inline">Guide</span>
            </Link>

            {user ? (
              <>
                <Link to="/catalog" className={linkStyle('/catalog')}>
                  <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="hidden md:inline">Catalog</span>
                </Link>

                {user.role === 'admin' && (
                  <Link to="/admin" className={linkStyle('/admin')}>
                    <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="hidden sm:inline">Admin Panel</span>
                    <span className="sm:hidden">Admin</span>
                  </Link>
                )}

                {user.role === 'dealer' && (
                  <Link to="/dealers/dashboard" className={linkStyle('/dealers/dashboard')}>
                    <Store className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    <span className="hidden sm:inline">My Store</span>
                    <span className="sm:hidden">Store</span>
                  </Link>
                )}

                {user.role === 'farmer' && (
                  <>
                    <Link to="/farmer/dashboard" className={linkStyle('/farmer/dashboard')}>
                      <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span className="hidden md:inline">My Inventory</span>
                      <span className="md:hidden">Inventory</span>
                    </Link>
                    <Link to="/search-dealers" className={linkStyle('/search-dealers')}>
                      <Search className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                      <span className="hidden md:inline">Find Dealers</span>
                      <span className="md:hidden">Dealers</span>
                    </Link>
                  </>
                )}

                {/* Feedback Button */}
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkSurface-hover rounded-btn transition-colors"
                  title="Feedback & Support"
                >
                  <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </button>

                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkSurface-hover rounded-btn transition-colors"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
                </button>

                {/* Divider */}
                <div className="h-5 w-px bg-neutral-200 dark:bg-darkSurface-border mx-0.5 hidden sm:block"></div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    id="user-menu-button"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1.5 rounded-btn hover:bg-neutral-100 dark:hover:bg-darkSurface-hover transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center border border-primary-200 dark:border-primary-800 flex-shrink-0">
                      <User className="w-4 h-4 text-primary-700 dark:text-primary-300" />
                    </div>
                    <span className="hidden sm:block text-xs font-medium text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      role="menu"
                      aria-labelledby="user-menu-button"
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-xl shadow-lg py-1 z-50"
                    >
                      {/* User info header */}
                      <div className="px-3.5 py-3 border-b border-neutral-100 dark:border-darkSurface-border">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{user.email}</p>
                        <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                      </div>

                      {/* Account Settings (farmer & dealer only) */}
                      {(user.role === 'farmer' || user.role === 'dealer') && (
                        <Link
                          to="/account"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-darkSurface-hover hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                          Account Settings
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        role="menuitem"
                        onClick={() => { setIsUserMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-b-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkSurface-hover rounded-btn transition-colors"
                  title="Feedback & Support"
                >
                  <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkSurface-hover rounded-btn transition-colors mr-1"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
                </button>

                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white font-medium rounded-btn hover:bg-neutral-100 dark:hover:bg-darkSurface-hover transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Global Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}