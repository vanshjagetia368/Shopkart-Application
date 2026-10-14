import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [added,    setAdded]    = useState(false);

  useEffect(() => {
    setLoading(true); setError('');
    getProductById(id)
      .then(res => setProduct(res.data.product))
      .catch(err => {
        const status = err.response?.status;
        if (status === 404) setError('Product not found.');
        else if (status === 400) setError('Invalid product ID.');
        else setError('Failed to load product. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const stockStatus =
    !product      ? ''          :
    product.stock === 0  ? 'out-stock'  :
    product.stock <= 5   ? 'low-stock'  : 'in-stock';

  const stockLabel =
    !product      ? ''               :
    product.stock === 0  ? 'Out of Stock'  :
    product.stock <= 5   ? `Only ${product.stock} left` : `${product.stock} In Stock`;

  const formattedPrice = product
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
      }).format(product.price)
    : '';

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="details-page">
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-subtitle">Loading product...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="details-page">
        <div className="state-screen">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Oops!</h2>
          <p className="state-subtitle">{error}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button id="back-from-error" className="btn btn-outline" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Product ── */
  return (
    <div className="details-page anim-fade-in">

      {/* Back button */}
      <button
        id="back-btn"
        className="details-back"
        onClick={() => navigate(-1)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Products
      </button>

      <div className="details-grid">

        {/* ── Left: Image ── */}
        <div className="details-img-col anim-fade-up">
          <div className="details-img-frame">
            <img
              src={product.image}
              alt={product.name}
              onError={e => {
                e.target.src = `https://placehold.co/600x600/F1F3FB/5B5BF6?text=${encodeURIComponent(product.name.slice(0, 8))}`;
              }}
            />
          </div>
        </div>

        {/* ── Right: Info ── */}
        <div className="details-info anim-fade-up" style={{ animationDelay: '0.08s' }}>

          {/* Category + stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="details-cat-badge">📦 {product.category}</span>
            <span className={`badge ${
              stockStatus === 'in-stock'  ? 'badge-success' :
              stockStatus === 'low-stock' ? 'badge-warning'  : 'badge-danger'
            }`}>
              {stockLabel}
            </span>
          </div>

          {/* Name */}
          <h1 className="details-name">{product.name}</h1>

          {/* Price */}
          <div>
            <div className="details-price">{formattedPrice}</div>
            <div className="details-price-caption">Inclusive of all taxes</div>
          </div>

          {/* Description */}
          <p className="details-desc">{product.description}</p>

          {/* Meta cards */}
          <div className="details-meta">
            <div className="details-meta-card">
              <div className="details-meta-label">Category</div>
              <div className="details-meta-value">{product.category}</div>
            </div>
            <div className="details-meta-card">
              <div className="details-meta-label">Stock</div>
              <div className="details-meta-value" style={{
                color: stockStatus === 'out-stock' ? 'var(--danger)' :
                       stockStatus === 'low-stock'  ? 'var(--warning)' : 'var(--success)'
              }}>
                {product.stock} units
              </div>
            </div>
            <div className="details-meta-card">
              <div className="details-meta-label">Product ID</div>
              <div className="details-meta-value" style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                {product._id}
              </div>
            </div>
            <div className="details-meta-card">
              <div className="details-meta-label">Listed On</div>
              <div className="details-meta-value">
                {new Date(product.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            id="add-cart-btn"
            className={`add-cart-btn${added ? ' added' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? (
              '❌ Out of Stock'
            ) : added ? (
              '✅ Added to Cart!'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1h2.5l1.8 9h8.9l1.5-6H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7.5" cy="15" r="1.2" fill="currentColor"/>
                  <circle cx="13" cy="15" r="1.2" fill="currentColor"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
