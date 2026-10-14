import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile, logoutCustomer } from '../services/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/home" className="navbar-logo" id="nav-logo">
          ShopKart
          <span className="navbar-logo-dot" />
        </Link>

        {/* Centre Links */}
        <div className="navbar-links">
          <NavLink
            to="/home"
            id="nav-home-link"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            id="nav-products-link"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
          >
            Products
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <div className="navbar-user-chip">
                <div className="navbar-avatar">{initials}</div>
                <span className="navbar-user-name">{user.fullName.split(' ')[0]}</span>
              </div>
              <button
                id="logout-btn"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" id="nav-login-btn" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" id="nav-register-btn" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
