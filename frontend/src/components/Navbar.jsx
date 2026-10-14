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
        <Link to="/home" className="navbar-logo">
          Shop<span>Kart</span>
        </Link>

        {/* Navigation links */}
        <div className="navbar-links">
          <NavLink
            to="/home"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
          >
            Products
          </NavLink>
        </div>

        {/* User section */}
        <div className="navbar-user">
          {user ? (
            <>
              <div className="navbar-avatar" title={user.fullName}>{initials}</div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14 }}>
                {user.fullName.split(' ')[0]}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                id="logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
