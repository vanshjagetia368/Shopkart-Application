import { useNavigate } from 'react-router-dom';

/**
 * ProductCard — renders a single product in the grid.
 * Clicking anywhere navigates to /products/:id
 */
export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const stockStatus =
    product.stock === 0 ? 'out-of-stock' :
    product.stock <= 5  ? 'low-stock'    : 'in-stock';

  const stockLabel =
    product.stock === 0 ? 'Out of Stock' :
    product.stock <= 5  ? `Only ${product.stock} left` : 'In Stock';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <article
      className="product-card animate-fade-up"
      id={`product-card-${product._id}`}
      onClick={() => navigate(`/products/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/products/${product._id}`)}
      aria-label={`View details for ${product.name}`}
    >
      {/* Image */}
      <div className="product-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={e => {
            e.target.src = `https://placehold.co/400x400/1a1a26/6c63ff?text=${encodeURIComponent(product.name.slice(0,8))}`;
          }}
        />
        <div className="product-img-overlay" />
        <span className="product-category-badge">{product.category}</span>
        <span className={`stock-badge ${stockStatus}`}>{stockLabel}</span>
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <div>
          <div className="product-price">
            {formattedPrice}
            <span className="product-price-tag"> /item</span>
          </div>
        </div>
        <div className="product-card-footer">
          <button
            className="btn btn-primary btn-full btn-sm"
            id={`view-btn-${product._id}`}
            onClick={e => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
          >
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
}
