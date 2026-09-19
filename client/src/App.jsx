import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContent";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from './components/Navbar';
import ProtectedRoute from "./components/ProtectedRoute";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DealerDashboard from './pages/DealerDashboard';
import FarmerDashboard from "./pages/FarmerDashboard";
import SearchDealers from './pages/SearchDealers';
import ProductCatalog from "./pages/ProductCatalog";
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-neutral-50 dark:bg-darkSurface-base text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased selection:bg-primary-100 selection:text-primary-900 dark:selection:bg-primary-900 dark:selection:text-primary-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/dealers/dashboard"
                  element={
                    <ProtectedRoute roles={['dealer']}>
                      <DealerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/dashboard"
                  element={
                    <ProtectedRoute roles={['farmer']}>
                      <FarmerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search-dealers"
                  element={
                    <ProtectedRoute roles={['farmer']}>
                      <SearchDealers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/catalog"
                  element={
                    <ProtectedRoute>
                      <ProductCatalog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            
            {/* Elegant Agritech Footer */}
            <footer className="bg-white dark:bg-darkSurface-surface border-t border-neutral-200 dark:border-darkSurface-border py-8 mt-16 text-xs text-neutral-500 dark:text-neutral-400 transition-colors duration-200">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-neutral-900 dark:text-neutral-200 text-sm">Kisan Netra</span>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <span>Licensed Agri-Input Tracking & Geo-Verification</span>
                </div>
                
                {/* Developer Credits */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-600 dark:text-neutral-300 font-medium">
                  <span>Developed by <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">Devansh Dahiya</strong></span>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <a
                    href="https://github.com/DevanshDahiya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
                  >
                    GitHub
                  </a>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <a
                    href="https://www.linkedin.com/in/devansh-dahiya-4161101b9/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
                  >
                    LinkedIn
                  </a>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <a
                    href="mailto:devanshdahiya219@gmail.com"
                    className="hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
                  >
                    devanshdahiya219@gmail.com
                  </a>
                </div>

                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">© {new Date().getFullYear()} Kisan Netra. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
