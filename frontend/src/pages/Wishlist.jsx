import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchWishlist = async () => {
    setLoading(true); setError('');
    try {
      const res = await getWishlist();
      setWishlist(res.data.wishlist);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate('/login', { replace: true });
      } else {
        setError("We couldn't load your wishlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  // Called by WishlistCard after a successful remove
  const handleRemoved = (productId) => {
    setWishlist(prev => prev.filter(p => p._id !== productId));
  };

  return (
    <div className="products-page" id="wishlist-page">

      {/* Page Header */}
      <div className="products-page-header anim-fade-up">
        <h1 className="products-page-title">
          My Wishlist&nbsp;
          {!loading && !error && (
            <span style={{
              fontSize: 20, fontWeight: 700, color: 'var(--danger)',
              background: 'rgba(239,68,68,0.1)', padding: '2px 12px',
              borderRadius: 'var(--r-full)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              ♥ {wishlist.length}
            </span>
          )}
        </h1>
        <p className="products-page-sub">
          {!loading && !error && wishlist.length > 0
            ? `${wishlist.length} product${wishlist.length !== 1 ? 's' : ''} saved for later`
            : 'Save products you love and find them here later'}
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-subtitle">Loading your wishlist...</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="state-screen">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Something went wrong</h2>
          <p className="state-subtitle">{error}</p>
          <button id="retry-wishlist-btn" className="btn btn-primary" onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && wishlist.length === 0 && (
        <div className="state-screen">
          <div className="state-icon" style={{ fontSize: 64 }}>❤️</div>
          <h2 className="state-title">Your wishlist is empty</h2>
          <p className="state-subtitle">
            Save products you love and find them all here, ready for when you are.
          </p>
          <button
            id="browse-from-wishlist-btn"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      )}

      {/* ── Wishlist Grid ── */}
      {!loading && !error && wishlist.length > 0 && (
        <>
          <div className="products-grid" id="wishlist-grid">
            {wishlist.map(product => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemoved={handleRemoved}
              />
            ))}
          </div>

          {/* Continue Shopping */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              id="continue-shopping-btn"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/products')}
            >
              ← Continue Shopping
            </button>
          </div>
        </>
      )}

    </div>
  );
}
