import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

/*
 * PURPOSE: Checkout page — shipping form + Stripe card payment.
 */
const stripePromise = loadStripe('pk_test_51TIWMmDZH5E0wbTRNUVWqRgHBIXATw0avTbb8EkkNvSzb1IcEIcmgnvHyPnVjz0Sjj4Dy9PJf4yO43z6HxqjbmEi00on85HIFq');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: '', email: '', address: '', city: '', zip: '', country: '',
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setPaymentError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!form.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.zip.trim()) newErrors.zip = 'PIN code is required';
    if (!form.country.trim()) newErrors.country = 'State is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setProcessing(true);
    setPaymentError('');

    try {
      const orderPayload = {
        ...form,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await api.post('/orders', orderPayload);
      const { orderId, clientSecret } = orderRes.data;

      if (!clientSecret) {
        setPaymentError('Failed to initiate payment. Please try again.');
        setProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: form.customerName,
            email: form.email,
          },
        },
      });

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      clearCart();
      navigate(`/confirm/${orderId}`);
    } catch (err) {
      setPaymentError(err.message || 'An error occurred during checkout');
    } finally {
      setProcessing(false);
    }
  };

  const subtotalCents = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotalCents + shipping;

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
        Shipping Details
      </h2>

      <div className="form-group">
        <label>Full Name</label>
        <input
          name="customerName"
          type="text"
          value={form.customerName}
          onChange={handleChange}
          placeholder="e.g., Priya Sharma"
        />
        {errors.customerName && <p className="form-error">{errors.customerName}</p>}
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="priya@example.com"
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label>Delivery Address</label>
        <input
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          placeholder="e.g., 42 MG Road, Koramangala"
        />
        {errors.address && <p className="form-error">{errors.address}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Bengaluru"
          />
          {errors.city && <p className="form-error">{errors.city}</p>}
        </div>
        <div className="form-group">
          <label>PIN Code</label>
          <input
            name="zip"
            value={form.zip}
            onChange={handleChange}
            placeholder="560034"
          />
          {errors.zip && <p className="form-error">{errors.zip}</p>}
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Karnataka"
          />
          {errors.country && <p className="form-error">{errors.country}</p>}
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--primary-dark)', margin: '2rem 0 1rem' }}>
        Payment
      </h2>

      <div className="form-group">
        <label>Card Number</label>
        <div className="card-element-wrapper">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2c2c2c',
                  '::placeholder': { color: '#aaa' },
                },
              },
            }}
          />
        </div>
      </div>

      {paymentError && (
        <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {paymentError}
        </p>
      )}

      <div className="checkout-summary-box">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div className="summary-row" key={item.id}>
            <span>
              {item.product?.name} &times; {item.quantity}
            </span>
            <span>
              ₹{(((item.product?.price || 0) * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="summary-row">
          <span>Shipping</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Free</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>₹{(total / 100).toFixed(2)}</span>
        </div>
      </div>

      <button type="submit" className="pay-btn" disabled={!stripe || processing}>
        {processing ? 'Processing...' : 'Place Order & Pay'}
      </button>
      <p className="pay-note">
        Secured by Stripe
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { cartItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="confirm-container">
        <div className="confirm-box">
          <h2>Your cart is empty</h2>
          <p className="confirm-msg">Browse our teas before proceeding to checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <p className="checkout-lead">Complete your order and we&apos;ll deliver to your door.</p>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
