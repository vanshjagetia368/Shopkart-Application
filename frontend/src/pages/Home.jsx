import { Link, useNavigate } from 'react-router-dom';

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

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-tag">
          <span>✨</span> New arrivals every week
        </div>
        <h1 className="hero-title">
          Discover Products<br />
          You'll <span className="gradient-text">Absolutely Love</span>
        </h1>
        <p className="hero-subtitle">
          Explore thousands of curated products across electronics, fashion, home essentials and more.
        </p>
        <div className="hero-cta">
          <button
            id="hero-shop-btn"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/products')}
          >
            🛍️ Shop Now
          </button>
          <Link to="/register" className="btn btn-outline btn-lg" id="hero-join-btn">
            Join Free
          </Link>
        </div>
      </section>

      {/* ── Feature Strip ─────────────────────────────────── */}
      <div className="features-strip">
        <div className="feature-item"><span className="feature-icon">🚚</span> Free Shipping over ₹999</div>
        <div className="feature-item"><span className="feature-icon">🔒</span> Secure Checkout</div>
        <div className="feature-item"><span className="feature-icon">↩️</span> Easy 30-Day Returns</div>
        <div className="feature-item"><span className="feature-icon">🎧</span> 24/7 Customer Support</div>
      </div>

      {/* ── Categories ────────────────────────────────────── */}
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

      {/* ── CTA Banner ────────────────────────────────────── */}
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
