function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className={`product-art ${product.color}`} aria-hidden="true">
        <span className="product-icon">{product.icon}</span>
        <span className={`stock-badge ${product.inStock ? "available" : "unavailable"}`}>
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
      <div className="product-info">
        <div className="product-meta"><span>{product.category}</span><span>★ {product.rating.toFixed(1)}</span></div>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-bottom">
          <strong className="price">₹{product.price.toLocaleString("en-IN")}</strong>
          {product.inStock ? (
            <button className="add-button" onClick={onAddToCart}>Add to Cart <span aria-hidden="true">+</span></button>
          ) : (
            <button className="add-button sold-out" disabled>Out of Stock</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
