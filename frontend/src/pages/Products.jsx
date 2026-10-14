import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync initial state from URL query params
  const [search,   setSearch]   = useState(searchParams.get('search')   ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sort,     setSort]     = useState(searchParams.get('sort')     ?? '');

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Debounced search timer
  const [debTimer, setDebTimer] = useState(null);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async (s, c, so) => {
    setLoading(true); setError('');
    try {
      const res = await getProducts({ search: s, category: c, sort: so });
      setProducts(res.data.products);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories once on mount
  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  // Debounce search, instant for category/sort
  const handleChange = ({ search: s, category: c, sort: so }) => {
    const newSearch   = s  !== undefined ? s  : search;
    const newCategory = c  !== undefined ? c  : category;
    const newSort     = so !== undefined ? so : sort;

    setSearch(newSearch);
    setCategory(newCategory);
    setSort(newSort);

    // Update URL params
    const params = {};
    if (newSearch)   params.search   = newSearch;
    if (newCategory) params.category = newCategory;
    if (newSort)     params.sort     = newSort;
    setSearchParams(params, { replace: true });

    // Debounce only search; category/sort fire instantly
    if (s !== undefined) {
      clearTimeout(debTimer);
      setDebTimer(setTimeout(() => fetchProducts(newSearch, newCategory, newSort), 380));
    } else {
      fetchProducts(newSearch, newCategory, newSort);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(search, category, sort);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="products-page">

      {/* Page header */}
      <div className="products-page-header anim-fade-up">
        <h1 className="products-page-title">All Products</h1>
        <p className="products-page-sub">Discover thousands of curated products across every category</p>
      </div>

      {/* Search & Filter */}
      <div className="anim-fade-up" style={{ animationDelay: '0.05s' }}>
        <SearchBar
          search={search}
          category={category}
          sort={sort}
          categories={categories}
          onChange={handleChange}
        />
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="results-count anim-fade-in">
          Showing <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
          {category ? ` in ${category}` : ''}
          {search ? ` matching "${search}"` : ''}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-subtitle">Loading products...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="state-screen">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Something went wrong</h2>
          <p className="state-subtitle">{error}</p>
          <button
            id="retry-btn"
            className="btn btn-primary"
            onClick={() => fetchProducts(search, category, sort)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="state-screen">
          <div className="state-icon">🔍</div>
          <h2 className="state-title">No products found</h2>
          <p className="state-subtitle">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            id="clear-filters-btn"
            className="btn btn-outline"
            onClick={() => handleChange({ search: '', category: '', sort: '' })}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid" id="products-grid">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
