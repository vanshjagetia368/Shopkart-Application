import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../services/api';

const CATEGORIES = [
  { label: 'Electronics', emoji: '💻' },
  { label: 'Fashion',     emoji: '👗' },
  { label: 'Books',       emoji: '📚' },
  { label: 'Home',        emoji: '🏠' },
  { label: 'Sports',      emoji: '⚽' },
  { label: 'Beauty',      emoji: '💄' },
];

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Fetch the authenticated customer's profile on mount
  useEffect(() => {
    getMyProfile()
      .then(res => setCustomer(res.data))
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const initials = customer?.fullName
    ? customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '..';
  const firstName = customer?.fullName?.split(' ')[0] ?? '';

  return (
    <main className="anim-fade-in">

      {/* ── Profile Hero (Task 3 — Lab 02) ──────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-inner">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0' }}>
              <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Loading your profile...</span>
            </div>
          ) : customer && (
            <>
              <div className="profile-greeting-row">
                <div>
                  <div className="profile-avatar-xl">{initials}</div>
                  <h1 className="profile-hero-greeting">
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="profile-hero-sub">Here's your ShopKart account overview</p>
                </div>
                <button
                  id="home-shop-btn"
                  className="home-cta-btn"
                  onClick={() => navigate('/products')}
                  style={{ alignSelf: 'flex-start' }}
                >
                  🛍️ Start Shopping
                </button>
              </div>

              {/* Profile Info Tiles */}
              <div className="profile-info-strip">
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">Full Name</div>
                  <div className="profile-info-tile-value" id="profile-fullname">{customer.fullName}</div>
                </div>
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">Email Address</div>
                  <div className="profile-info-tile-value" id="profile-email">{customer.email}</div>
                </div>
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">Phone Number</div>
                  <div className="profile-info-tile-value" id="profile-phone">{customer.phone}</div>
                </div>
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">Customer ID</div>
                  <div className="profile-info-tile-value" id="profile-id"
                    style={{ fontSize: 12, opacity: 0.8, wordBreak: 'break-all' }}>
                    {customer._id}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Feature Strip ───────────────────────────────── */}
      <div className="home-features">
        <div className="home-features-inner">
          {[
            ['🚚', 'Free Shipping over ₹999'],
            ['🔒', 'Secure Checkout'],
            ['↩️', 'Easy 30-Day Returns'],
            ['🎧', '24/7 Customer Support'],
          ].map(([icon, label]) => (
            <div className="home-feature-item" key={label}>
              <span className="home-feature-icon">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Browse by Category ──────────────────────────── */}
      <div className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Browse by Category</h2>
          <Link to="/products" className="home-section-link" id="view-all-link">View all →</Link>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              to={`/products?category=${cat.label}`}
              className="cat-chip"
              id={`category-${cat.label.toLowerCase()}`}
            >
              <span className="cat-chip-emoji">{cat.emoji}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        <div className="home-cta">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="home-cta-title">Ready to explore? 🚀</h2>
            <p className="home-cta-sub">Browse our full catalog and find your next favourite product.</p>
          </div>
          <button
            className="home-cta-btn"
            id="cta-browse-btn"
            onClick={() => navigate('/products')}
          >
            Browse Products →
          </button>
        </div>
      </div>

    </main>
  );
}
