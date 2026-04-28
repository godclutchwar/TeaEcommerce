import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/*
 * PURPOSE: Shopping cart page — displays items, quantity controls, and total.
 */
export default function CartPage() {
  const { cartItems, updateQty, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        <p className="cart-lead">Review your items before checkout.</p>
        <div className="cart-empty">
          <p style={{ fontSize: '3rem' }}>🛒</p>
          <h2>Your cart is empty</h2>
          <Link className="btn-cta" to="/shop">Browse our teas</Link>
        </div>
      </div>
    );
  }

  const subtotalCents = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotalCents >= 50000 ? 0 : 0; // free shipping always
  const total = subtotalCents + shipping;

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      <p className="cart-lead">
        Review your items before checkout.
      </p>

      {cartItems.map((item) => {
        const p = item.product;
        if (!p) return null;
        return (
          <div className="cart-item" key={item.id}>
            <div
              className={`cart-item-icon cat-${p.category}`}
            >
              {p.iconUnicode}
            </div>
            <div className="cart-item-info">
              <div className="cart-item-name">{p.name}</div>
              <div className="cart-item-price">
                ₹{(p.price / 100).toFixed(2)} &times; {item.quantity} = ₹
                {((p.price * item.quantity) / 100).toFixed(2)}
              </div>
            </div>
            <div className="qty-controls">
              <button
                className="qty-btn"
                onClick={() => updateQty(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="qty-num">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQty(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              className="cart-remove-btn"
              onClick={() => removeFromCart(item.id)}
            >
              ✕
            </button>
          </div>
        );
      })}

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{(subtotalCents / 100).toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Free</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>₹{(total / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="checkout-btn-wrap">
        <Link className="btn-cta" to="/checkout">
          Proceed to Checkout &rarr;
        </Link>
      </div>
    </div>
  );
}
