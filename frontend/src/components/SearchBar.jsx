export default function SearchBar({ search, category, sort, categories, onChange }) {
  return (
    <div className="filter-bar">

      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon-wrap">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          id="product-search"
          type="text"
          className="search-field"
          placeholder="Search products..."
          value={search}
          onChange={e => onChange({ search: e.target.value })}
          aria-label="Search products"
        />
      </div>

      {/* Category */}
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
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>

    </div>
  );
}
