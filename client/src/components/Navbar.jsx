import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import { Sprout, Package, Search, Store, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) =>
    `px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
      isActive(path)
        ? 'bg-emerald-50 text-emerald-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 capitalize">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'dealer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 capitalize">
            <Store className="w-3 h-3" /> Dealer
          </span>
        );
      case 'farmer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
            <Sprout className="w-3 h-3" /> Farmer
          </span>
        );
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-emerald-600 group-hover:bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
              Kisan <span className="text-emerald-600">Netra</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase leading-none mt-0.5">
              Licensed Agri Platform
            </span>
          </div>
        </Link>

        {/* Nav Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link to="/catalog" className={linkStyle('/catalog')}>
                <Package className="w-4 h-4" />
                <span className="hidden md:inline">Product Catalog</span>
                <span className="md:hidden">Catalog</span>
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className={linkStyle('/admin')}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {user.role === 'dealer' && (
                <Link to="/dealers/dashboard" className={linkStyle('/dealers/dashboard')}>
                  <Store className="w-4 h-4" />
                  <span>My Store</span>
                </Link>
              )}

              {user.role === 'farmer' && (
                <>
                  <Link to="/farmer/dashboard" className={linkStyle('/farmer/dashboard')}>
                    <Package className="w-4 h-4" />
                    <span className="hidden md:inline">My Inventory</span>
                    <span className="md:hidden">Inventory</span>
                  </Link>
                  <Link to="/search-dealers" className={linkStyle('/search-dealers')}>
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Find Dealers</span>
                    <span className="md:hidden">Dealers</span>
                  </Link>
                </>
              )}

              {/* User Info Pill */}
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                  {user.name}
                </span>
                {getRoleBadge(user.role)}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="ml-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 hover:border-red-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}