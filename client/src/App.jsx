import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContent";
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
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
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
          
          {/* Professional Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 mt-16 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Kisan Netra</span>
                <span>•</span>
                <span>Licensed Agri-Input Tracking & Verification</span>
              </div>
              <p>© {new Date().getFullYear()} Kisan Netra. Empowering Farmers & Verified Agri-Dealers.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
