import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import FilterBar from '../components/FilterBar';
import api from '../api/axios';

/*
 * PURPOSE: Full product catalog page with category filtering and product modal.
 */
export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      <div className="shop-header">
        <h1>Explore Our Collection</h1>
        <p>Handpicked teas from India&apos;s finest gardens.</p>
      </div>

      <FilterBar activeCategory={activeCategory} onChange={setActiveCategory} />

      {filtered.length === 0 ? (
        <div className="loading">No teas found in this category.</div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
          ))}
        </div>
      )}

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
