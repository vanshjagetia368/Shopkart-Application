import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
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
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className="product-price">{formattedPrice}</span>
          <span className="product-price-unit">/ unit</span>
        </div>
        <p className="product-stock-label">{product.stock} units available</p>
        <div className="product-card-footer">
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
        </div>
      </div>
    </article>
  );
}
