import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toggleWishlist } from '../services/api';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { add, cartItems } = useCart();

  // Wishlist states: 'default' | 'loading' | 'saved' | 'error'
  const [wishState,  setWishState]  = useState('default');
  // Cart states: 'idle' | 'adding'
  const [cartState,  setCartState]  = useState('idle');
  const [cartError,  setCartError]  = useState('');

  // Check if product is already in cart
  const inCart = cartItems.some(item => item.product._id === product._id);

  const stockStatus =
    product.stock === 0 ? 'out-stock' :
    product.stock <= 5  ? 'low-stock'  : 'in-stock';

  const stockLabel =
    product.stock === 0 ? 'Out of Stock' :
    product.stock <= 5  ? `Only ${product.stock} left` : 'In Stock';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(product.price);

  // ── Wishlist toggle (Bonus) ──────────────────────────────
  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (wishState === 'loading') return;
    setWishState('loading');
    try {
      const res = await toggleWishlist(product._id);
      setWishState(res.data.saved ? 'saved' : 'default');
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else {
        setWishState('error');
        setTimeout(() => setWishState('default'), 3000);
      }
    }
  };

  // ── Add to Cart ──────────────────────────────────────────
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (cartState === 'adding') return;
    setCartState('adding'); setCartError('');
    try {
      await add(product._id); // updates global cart context
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else {
        setCartError(err.response?.data?.message || 'Could not add to cart.');
        setTimeout(() => setCartError(''), 3000);
      }
    } finally {
      setCartState('idle');
    }
  };

  const cartBtnLabel =
    cartState === 'adding' ? '⏳ Adding...' :
    inCart                 ? '🛒 Add Another' :
                             '🛒 Add to Cart';

  return (
    <article
      className="product-card"
      id={`card-${product._id}`}
      onClick={() => navigate(`/products/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/products/${product._id}`)}
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="product-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={e => {
            e.target.src = `https://placehold.co/400x400/F1F3FB/5B5BF6?text=${encodeURIComponent(product.name.slice(0, 8))}`;
          }}
        />
        <span className="product-cat-tag">{product.category}</span>
        <span className={`product-stock-tag ${stockStatus}`}>{stockLabel}</span>

        {/* Wishlist heart button */}
        <button
          id={`wish-btn-${product._id}`}
          onClick={handleWishlist}
          disabled={wishState === 'loading'}
          aria-label={wishState === 'saved' ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 36, height: 36, borderRadius: '50%',
            background: wishState === 'saved' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.92)',
            border: wishState === 'saved' ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
            color: wishState === 'saved' ? 'var(--danger)' : 'var(--text-secondary)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {wishState === 'loading' ? '⏳' : wishState === 'saved' ? '♥' : '♡'}
        </button>

        {/* Cart badge on image */}
        {inCart && (
          <span style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'var(--primary)', color: 'white',
            fontSize: 10, fontWeight: 800, padding: '3px 8px',
            borderRadius: 'var(--r-full)', letterSpacing: '0.04em',
            animation: 'scaleIn 0.2s ease',
          }}>
            IN CART
          </span>
        )}
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className="product-price">{formattedPrice}</span>
          <span className="product-price-unit">/ unit</span>
        </div>
        <p className="product-stock-label">{product.stock} units available</p>

        {(wishState === 'error' || cartError) && (
          <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
            {cartError || 'Unable to save. Try again.'}
          </p>
        )}

        <div className="product-card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* View Details */}
          <button
            id={`view-btn-${product._id}`}
            className="product-view-btn"
            onClick={e => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
          >
            View Details
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Add to Cart */}
          <button
            id={`cart-btn-${product._id}`}
            onClick={handleAddToCart}
            disabled={cartState === 'adding' || product.stock === 0}
            style={{
              width: '100%', padding: '10px 14px',
              background: product.stock === 0 ? 'var(--bg-subtle)' : inCart ? 'var(--primary-ghost)' : 'var(--primary)',
              border: product.stock === 0
                ? '1.5px solid var(--border)'
                : inCart ? '1.5px solid var(--border-hover)' : '1.5px solid var(--primary)',
              borderRadius: 'var(--r-md)',
              color: product.stock === 0 ? 'var(--text-muted)' : inCart ? 'var(--primary)' : 'white',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
              cursor: (cartState === 'adding' || product.stock === 0) ? 'not-allowed' : 'pointer',
              transition: 'var(--t-spring)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: cartState === 'adding' ? 0.7 : 1,
            }}
          >
            {product.stock === 0 ? '❌ Out of Stock' : cartBtnLabel}
          </button>

          {/* Wishlist toggle button */}
          <button
            id={`wishlist-btn-${product._id}`}
            onClick={handleWishlist}
            disabled={wishState === 'loading'}
            style={{
              width: '100%', padding: '10px 14px',
              background: wishState === 'saved' ? 'rgba(239,68,68,0.08)' : 'var(--bg-subtle)',
              border: wishState === 'saved' ? '1.5px solid rgba(239,68,68,0.25)' : '1.5px solid var(--border)',
              borderRadius: 'var(--r-md)',
              color: wishState === 'saved' ? 'var(--danger)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
              cursor: wishState === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'var(--t-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: wishState === 'loading' ? 0.65 : 1,
            }}
          >
            {wishState === 'loading' ? '⏳ Saving...' :
             wishState === 'saved'   ? '♥ Saved to Wishlist' :
             wishState === 'error'   ? '⚠ Try again' :
             '♡ Wishlist'}
          </button>
        </div>
      </div>
    </article>
  );
}
