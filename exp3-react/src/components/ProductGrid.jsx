import ProductCard from "./ProductCard.jsx";

function ProductGrid({ products, onAddToCart }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">🔎</span>
        <h3>No supplies found</h3>
        <p>Try another search or change the filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}

export default ProductGrid;
