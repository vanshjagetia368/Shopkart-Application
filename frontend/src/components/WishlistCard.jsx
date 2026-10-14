import { useNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../services/api';

export default function WishlistCard({ product, onRemoved }) {
  const navigate = useNavigate();

  const stockStatus =
    product.stock === 0 ? 'out-stock' :
    product.stock <= 5  ? 'low-stock'  : 'in-stock';

  const stockLabel =
    product.stock === 0 ? 'Out of Stock' :
    product.stock <= 5  ? `Only ${product.stock} left` : 'In Stock';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(product.price);

  const handleRemove = async () => {
    try {
      await removeFromWishlist(product._id);
      onRemoved(product._id); // notify parent to update list
    } catch (err) {
      console.error('Remove failed:', err);
      alert('Could not remove product. Please try again.');
    }
  };

  return (
    <article className="product-card" id={`wishlist-card-${product._id}`}>

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

        {/* Saved heart badge */}
        <span style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(239,68,68,0.12)', color: 'var(--danger)',
          borderRadius: '50%', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
          backdropFilter: 'blur(6px)', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          ♥
        </span>
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className="product-price">{formattedPrice}</span>
          <span className="product-price-unit">/ unit</span>
        </div>
        <p className="product-stock-label">{product.stock} units available</p>

        {/* Actions */}
        <div className="product-card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            id={`wishlist-view-${product._id}`}
            className="product-view-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            id={`wishlist-remove-${product._id}`}
            onClick={handleRemove}
            style={{
              width: '100%', padding: '10px 16px',
              background: 'rgba(239,68,68,0.06)',
              border: '1.5px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--r-md)',
              color: 'var(--danger)', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font)', cursor: 'pointer',
              transition: 'var(--t-spring)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--danger)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--danger)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
          >
            ♥ Remove from Wishlist
          </button>
        </div>
      </div>
    </article>
  );
}
