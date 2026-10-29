import { categories } from "../data/mockData.js";

function FilterBar({ search, onSearchChange, category, onCategoryChange, inStockOnly, onInStockChange }) {
  return (
    <div className="filter-bar" aria-label="Filter maintenance supplies">
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">Search supplies</span>
        <input
          type="search"
          placeholder="Search supplies..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <label className="select-field">
        <span className="visually-hidden">Choose a category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="stock-toggle">
        <input type="checkbox" checked={inStockOnly} onChange={(event) => onInStockChange(event.target.checked)} />
        <span className="toggle-track" aria-hidden="true"><span /></span>
        <span>In stock only</span>
      </label>
    </div>
  );
}

export default FilterBar;
