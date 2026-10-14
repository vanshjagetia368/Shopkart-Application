import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import { getMyProfile } from './services/api';

// ─────────────────────────────────────────────────────────────
// ProtectedRoute — wraps any route that requires authentication.
// 1. Calls GET /customers/me on mount (checks HttpOnly cookie).
// 2. Shows a spinner while the check is in progress.
// 3. If cookie is valid  → renders children (the page).
// 4. If 401 / no cookie  → redirects to /login.
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

                {/* Protected — requires login */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />

                {/* Public — products are viewable without login */}
                <Route path="/products"    element={<Products />} />
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
