import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import { getMyProfile } from './services/api';

// ─────────────────────────────────────────────────────────────
// ProtectedRoute — wraps any route that requires authentication.
// Calls GET /customers/me to verify HttpOnly cookie is valid.
// Redirects to /login if not authenticated.
// ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then(() => setStatus('auth'))
      .catch(() => {
        setStatus('unauth');
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="state-screen">
        <div className="spinner" />
        <p className="state-subtitle">Checking authentication...</p>
      </div>
    );
  }

  return status === 'auth' ? children : null;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes (no navbar) ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── App Routes (with navbar) ── */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Protected routes — require valid JWT cookie */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />

                {/* Public — product browsing does not require login */}
                <Route path="/products"     element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
