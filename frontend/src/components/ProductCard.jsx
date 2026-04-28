import React from 'react';
import { useCart } from '../context/CartContext';
import { showToast } from './Toast';

/*
 * PURPOSE: Reusable product card used in HomePage and ShopPage.
 * PROPS: product (ProductDTO from backend), onClick (opens ProductModal)
 */
export default function ProductCard({ product, onClick }) {
  const { cartItems, addToCart, updateQty } = useCart();

  const handleAdd = async (e) => {
    e.stopPropagation();
    await addToCart(product.id);
    showToast(`${product.name} added to cart`);
  };

  const cartItem = cartItems.find((item) => item.product?.id === product.id);

  return (
    <div className="product-card" onClick={onClick}>
      <div className={`card-icon cat-${product.category}`}>
        {product.iconUnicode}
      </div>
      <div className="card-body">
        <div className="card-category">
          {product.category === 'blend'
            ? 'Blended Tea'
            : `${product.category.charAt(0).toUpperCase() + product.category.slice(1)} Tea`}
        </div>
        <div className="card-name">{product.name}</div>
        <div className="card-desc">{product.description}</div>
        <div className="card-bottom">
          <span className="card-price">{product.priceDisplay}</span>
          {cartItem ? (
            <div className="qty-controls" onClick={(e) => e.stopPropagation()}>
              <button
                className="qty-btn"
                onClick={() => updateQty(cartItem.id, cartItem.quantity - 1)}
              >
                −
              </button>
              <span className="qty-num">{cartItem.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQty(cartItem.id, cartItem.quantity + 1)}
              >
                +
              </button>
            </div>
          ) : (
            <button className="btn-cta-sm" onClick={handleAdd}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
