import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile, logoutCustomer, getWishlistCount } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [user,          setUser]          = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();
  const { totalItems, reset } = useCart(); // live cart count from global context

  useEffect(() => {
    getMyProfile()
      .then(res => {
        setUser(res.data);
        return getWishlistCount();
      })
      .then(res => setWishlistCount(res.data.count))
      .catch(() => { setUser(null); setWishlistCount(0); });
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      reset(); // clear global cart state
      setUser(null);
      setWishlistCount(0);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const Badge = ({ count, color = 'var(--primary)', bg = 'var(--primary-ghost)' }) =>
    count > 0 ? (
      <span style={{
        background: color === 'var(--danger)' ? 'var(--danger)' : 'var(--primary)',
        color: 'white', fontSize: 10, fontWeight: 800, lineHeight: 1,
        padding: '2px 6px', borderRadius: 'var(--r-full)',
        minWidth: 18, textAlign: 'center', animation: 'scaleIn 0.2s ease',
      }}>
        {count}
      </span>
    ) : null;

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
          <NavLink to="/home" id="nav-home-link"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>

          <NavLink to="/products" id="nav-products-link"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Products
          </NavLink>

          {/* Wishlist with count badge */}
          <NavLink to="/wishlist" id="nav-wishlist-link"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Wishlist
            <Badge count={wishlistCount} />
          </NavLink>

          {/* Cart with live count badge from CartContext */}
          <NavLink to="/cart" id="nav-cart-link"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Cart
            <Badge count={totalItems} />
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
              <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    id="nav-login-btn"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" id="nav-register-btn" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
