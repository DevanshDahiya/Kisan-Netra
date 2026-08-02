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
import SearchDealers  from './pages/SearchDealers' ;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;


