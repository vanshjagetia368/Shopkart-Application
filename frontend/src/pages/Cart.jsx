import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const INR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, totalItems, subtotal, fetchCart, clear } = useCart();

  return (
    <div className="products-page" id="cart-page">

      {/* ── Page header ── */}
      <div className="products-page-header anim-fade-up">
        <h1 className="products-page-title">
          My Cart&nbsp;
          {!loading && !error && (
            <span style={{
              fontSize: 18, fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-ghost)', padding: '2px 12px',
              borderRadius: 'var(--r-full)',
              border: '1px solid var(--border-hover)',
            }}>
              🛒 {totalItems}
            </span>
          )}
        </h1>
        <p className="products-page-sub">
          {!loading && !error && cartItems.length > 0
            ? `${cartItems.length} product${cartItems.length !== 1 ? 's' : ''} · ${totalItems} total units`
            : 'Add products to get started'}
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-subtitle">Loading your cart...</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="state-screen">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Something went wrong</h2>
          <p className="state-subtitle">{error}</p>
          <button id="retry-cart-btn" className="btn btn-primary" onClick={fetchCart}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && cartItems.length === 0 && (
        <div className="state-screen">
          <div className="state-icon" style={{ fontSize: 64 }}>🛒</div>
          <h2 className="state-title">Your cart is empty</h2>
          <p className="state-subtitle">
            Looks like you haven't added anything yet. Browse products and add them to your cart.
          </p>
          <button
            id="browse-from-cart-btn"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      )}

      {/* ── Cart + Summary ── */}
      {!loading && !error && cartItems.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 28, alignItems: 'start',
        }}>

          {/* ── Cart Items ── */}
          <div style={{
            background: 'var(--bg-white)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 4,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}
              </p>
              <button
                id="clear-cart-btn"
                onClick={clear}
                style={{
                  background: 'none', border: 'none', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)',
                  transition: 'var(--t-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Clear All
              </button>
            </div>

            {cartItems.map(item => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div style={{
            position: 'sticky', top: 'calc(var(--nav-h) + 24px)',
            background: 'var(--bg-white)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 24,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
              Order Summary
            </h2>

            {/* Per-item rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {cartItems.map(item => (
                <div key={item.product._id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  <span style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {INR(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 20, fontWeight: 800, color: 'var(--text)',
              borderTop: '2px solid var(--border)',
              paddingTop: 14, marginBottom: 20,
            }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--primary)' }}>{INR(subtotal)}</span>
            </div>

            <button
              id="checkout-btn"
              className="btn btn-primary btn-full btn-lg"
              onClick={() => alert('Checkout coming in Lab-06! 🚀')}
            >
              Proceed to Checkout →
            </button>

            <button
              style={{ width: '100%', marginTop: 10 }}
              className="btn btn-ghost btn-full"
              onClick={() => navigate('/products')}
            >
              ← Continue Shopping
            </button>
          </div>

        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          #cart-page > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
