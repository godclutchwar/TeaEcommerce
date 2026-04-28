import React, { useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';

/*
 * PURPOSE: Modal overlay showing full product details.
 */
export default function ProductModal({ product, onClose }) {
  const { cartItems, addToCart, updateQty } = useCart();

  const handleEsc = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!product) return;
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [product, handleEsc]);

  if (!product) return null;

  const cartItem = cartItems.find((item) => item.product?.id === product.id);

  return (
    <div
      className={`modal-overlay ${product ? 'open' : ''}`}
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className={`modal-icon cat-${product.category}`}>
          {product.iconUnicode}
        </div>

        <div className="modal-info">
          <div className="card-category">
            {product.category === 'blend'
              ? 'Blended Tea'
              : `${product.category.charAt(0).toUpperCase() + product.category.slice(1)} Tea`}
          </div>
          <div className="card-name" style={{ fontSize: '1.6rem' }}>
            {product.name}
          </div>
          <p style={{ marginBottom: '1rem', lineHeight: 1.7, color: '#555' }}>
            {product.fullDescription}
          </p>

          <div className="modal-details">
            <span>Origin:</span>
            <span>{product.origin}</span>
            <span>Strength:</span>
            <span>{product.strength}</span>
            <span>Caffeine:</span>
            <span>{product.caffeine}</span>
            <span>Best Time:</span>
            <span>{product.bestTime}</span>
          </div>

          <div className="modal-bottom">
            <span className="card-price" style={{ fontSize: '1.4rem' }}>
              {product.priceDisplay}
            </span>
            {cartItem ? (
              <div className="qty-controls">
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
              <button
                className="add-to-cart-lg"
                onClick={() => addToCart(product.id)}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
