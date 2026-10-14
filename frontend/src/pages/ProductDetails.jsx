import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [added,   setAdded]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setProduct(null);

    getProductById(id)
      .then(res => setProduct(res.data.product))
      .catch(err => {
        if (err.response?.status === 404) setError('Product not found.');
        else if (err.response?.status === 400) setError('Invalid product ID.');
        else setError('Something went wrong while loading the product.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const formattedPrice = product
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
    : '';

  const stockStatus =
    !product ? '' :
    product.stock === 0 ? 'out-of-stock' :
    product.stock <= 5  ? 'low-stock'    : 'in-stock';

  const stockLabel =
    !product ? '' :
    product.stock === 0 ? 'Out of Stock' :
    product.stock <= 5  ? `Only ${product.stock} left!` : `${product.stock} units available`;

  // ── Render ──────────────────────────────────────────
  return (
    <main className="product-details-page">
      {/* Back Button */}
      <button
        id="back-btn"
        className="back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Products
      </button>

      {/* ── Loading State ── */}
      {loading && (
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-subtitle">Loading product...</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="state-screen" role="alert">
          <div className="state-icon">😕</div>
          <p className="state-title">Not Found</p>
          <p className="state-subtitle">{error}</p>
          <button className="btn btn-primary" id="go-products-btn" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      )}

      {/* ── Product Detail ── */}
      {!loading && product && (
        <div className="product-details-grid animate-fade-up" id={`product-detail-${product._id}`}>
          {/* Left — Image */}
          <div className="product-details-img-wrap">
            <img
              src={product.image}
              alt={product.name}
              onError={e => {
                e.target.src = `https://placehold.co/600x600/1a1a26/6c63ff?text=${encodeURIComponent(product.name.slice(0,10))}`;
              }}
            />
          </div>

          {/* Right — Info */}
          <div className="product-details-info">
            <span className="product-details-category">{product.category}</span>
            <h1 className="product-details-name">{product.name}</h1>
            <p className="product-details-price">{formattedPrice}</p>
            <p className="product-details-desc">{product.description}</p>

            {/* Meta grid */}
            <div className="product-meta-grid">
              <div className="product-meta-item">
                <div className="product-meta-label">Category</div>
                <div className="product-meta-value">{product.category}</div>
              </div>
              <div className="product-meta-item">
                <div className="product-meta-label">Availability</div>
                <div className="product-meta-value">
                  <span className={`badge badge-${stockStatus === 'in-stock' ? 'success' : stockStatus === 'low-stock' ? 'warning' : 'danger'}`}>
                    {stockLabel}
                  </span>
                </div>
              </div>
              <div className="product-meta-item">
                <div className="product-meta-label">Stock</div>
                <div className="product-meta-value">{product.stock} units</div>
              </div>
              <div className="product-meta-item">
                <div className="product-meta-label">ID</div>
                <div className="product-meta-value" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {product._id}
                </div>
              </div>
            </div>

            {/* Add to Cart — UI only */}
            <button
              id="add-to-cart-btn"
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label="Add to cart"
            >
              {added ? '✅ Added to Cart!' : product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
            </button>

            {added && (
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--success)' }}>
                Cart functionality coming in Lab 04!
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
