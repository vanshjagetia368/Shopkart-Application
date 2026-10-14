/**
 * SearchBar — controlled search input + category select + sort
 * All state is lifted up to the Products page.
 */
export default function SearchBar({ search, category, sort, categories, onChange }) {
  return (
    <div className="search-filter-bar">
      {/* Search Input */}
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          id="product-search-input"
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={e => onChange({ search: e.target.value })}
          aria-label="Search products"
        />
      </div>

      {/* Category Filter */}
      <select
        id="category-filter"
        className="filter-select"
        value={category}
        onChange={e => onChange({ category: e.target.value })}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Sort — Bonus */}
      <select
        id="sort-filter"
        className="filter-select"
        value={sort}
        onChange={e => onChange({ sort: e.target.value })}
        aria-label="Sort products"
      >
        <option value="">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
