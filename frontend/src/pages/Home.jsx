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
  const navigate  = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Fetch logged-in customer from the backend on every mount.
  // ProtectedRoute already verified the token; this call populates UI data.
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
    <main>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Customer Profile (Lab 02 Task 3)
          Fetched from GET /customers/me
      ══════════════════════════════════════════════════════ */}
      <section className="profile-section">
        <div className="profile-inner">
          {loading ? (
            <div className="state-screen" style={{ padding: '60px 0' }}>
              <div className="spinner" />
            </div>
          ) : customer && (
            <div className="profile-welcome animate-fade-up">

              {/* Greeting */}
              <div className="profile-greeting">
                <div className="profile-avatar-lg">{initials}</div>
                <div>
                  <h1 className="profile-name">
                    Welcome back, <span className="gradient-text">{firstName}!</span> 👋
                  </h1>
                  <p className="profile-tagline">Here's your ShopKart account overview</p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="profile-cards">
                <div className="profile-info-card">
                  <div className="profile-info-icon">👤</div>
                  <div>
                    <div className="profile-info-label">Full Name</div>
                    <div className="profile-info-value" id="profile-fullname">{customer.fullName}</div>
                  </div>
                </div>

                <div className="profile-info-card">
                  <div className="profile-info-icon">📧</div>
                  <div>
                    <div className="profile-info-label">Email Address</div>
                    <div className="profile-info-value" id="profile-email">{customer.email}</div>
                  </div>
                </div>

                <div className="profile-info-card">
                  <div className="profile-info-icon">📱</div>
                  <div>
                    <div className="profile-info-label">Phone Number</div>
                    <div className="profile-info-value" id="profile-phone">{customer.phone}</div>
                  </div>
                </div>

                <div className="profile-info-card">
                  <div className="profile-info-icon">🆔</div>
                  <div>
                    <div className="profile-info-label">Customer ID</div>
                    <div className="profile-info-value" id="profile-id"
                      style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--text-muted)' }}>
                      {customer._id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="profile-actions">
                <button
                  id="home-shop-btn"
                  className="btn btn-primary"
                  onClick={() => navigate('/products')}
                >
                  🛍️ Start Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Feature Strip
      ══════════════════════════════════════════════════════ */}
      <div className="features-strip">
        <div className="feature-item"><span className="feature-icon">🚚</span> Free Shipping over ₹999</div>
        <div className="feature-item"><span className="feature-icon">🔒</span> Secure Checkout</div>
        <div className="feature-item"><span className="feature-icon">↩️</span> Easy 30-Day Returns</div>
        <div className="feature-item"><span className="feature-icon">🎧</span> 24/7 Customer Support</div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — Browse by Category
      ══════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Browse by Category</h2>
          <Link to="/products" className="section-link">View all →</Link>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              to={`/products?category=${cat.label}`}
              className="category-chip"
              id={`category-${cat.label.toLowerCase()}`}
            >
              <span className="category-emoji">{cat.emoji}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — CTA Banner
      ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 40px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Ready to explore? 🚀
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Browse our full catalog and find your next favourite product.
            </p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            id="cta-browse-btn"
            onClick={() => navigate('/products')}
          >
            Browse Products →
          </button>
        </div>
      </section>

    </main>
  );
}
