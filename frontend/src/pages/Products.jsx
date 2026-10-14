import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialise from URL query params so deep links work
  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort')     || '',
  });

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Fetch categories once on mount
  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.categories))
      .catch(() => {}); // non-critical
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build params — skip empty strings
      const params = {};
      if (filters.search)   params.search   = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.sort)     params.sort     = filters.sort;

      // Sync URL
      setSearchParams(params);

      const res = await getProducts(params);
      setProducts(res.data.products);
    } catch (err) {
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    // Debounce search input — only hit API 400ms after last keystroke
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Lifted state handler for SearchBar
  const handleFilterChange = updates => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // ── Render ──────────────────────────────────────────
  return (
    <main className="products-page">
      {/* Header */}
      <header className="products-header animate-fade-up">
        <h1 className="products-title">All Products</h1>
        <p className="products-subtitle">Discover something new today</p>
      </header>

      {/* Search + Filter Bar */}
      <SearchBar
        search={filters.search}
        category={filters.category}
        sort={filters.sort}
        categories={categories}
        onChange={handleFilterChange}
      />

      {/* Results Meta */}
      {!loading && !error && (
        <p className="results-meta" aria-live="polite">
          Showing <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
          {filters.search   ? ` for "${filters.search}"` : ''}
          {filters.category ? ` in ${filters.category}` : ''}
        </p>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="state-screen" aria-label="Loading products">
          <div className="spinner" />
          <p className="state-subtitle">Loading products...</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="state-screen" role="alert">
          <div className="state-icon">⚠️</div>
          <p className="state-title">Oops!</p>
          <p className="state-subtitle">{error}</p>
          <button className="btn btn-primary" onClick={fetchProducts} id="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && products.length === 0 && (
        <div className="state-screen">
          <div className="state-icon">🔍</div>
          <p className="state-title">No products found</p>
          <p className="state-subtitle">
            {filters.search || filters.category
              ? 'Try adjusting your search or category filter.'
              : 'No products have been added yet.'}
          </p>
          {(filters.search || filters.category) && (
            <button
              className="btn btn-outline"
              id="clear-filters-btn"
              onClick={() => setFilters({ search: '', category: '', sort: '' })}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Products Grid ── */}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid" role="list" aria-label="Products">
          {products.map(product => (
            <div key={product._id} role="listitem">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
