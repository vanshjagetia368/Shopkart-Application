import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import { getMyProfile } from './services/api';

// ─────────────────────────────────────────────────────────────
// ProtectedRoute — verifies HttpOnly cookie is valid.
// Redirects to /login if not authenticated.
// ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');
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
      {/* CartProvider wraps entire app so Navbar + all pages share one cart state */}
      <CartProvider>
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

                  {/* Protected routes */}
                  <Route path="/home"     element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />

                  {/* Public — product browsing */}
                  <Route path="/products"     element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
