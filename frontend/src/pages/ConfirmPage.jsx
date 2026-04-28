import React from 'react';
import { Link, useParams } from 'react-router-dom';

/*
 * PURPOSE: Order confirmation page shown after successful payment.
 */
export default function ConfirmPage() {
  const { orderId } = useParams();

  const ref = `CL-${orderId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <div className="confirm-container">
      <div className="confirm-box">
        <h1>Order Confirmed!</h1>
        <p className="confirm-msg">
          Thank you for your order. Your teas will be delivered in 3&ndash;7 business days.
        </p>
        <p className="confirm-order">Order Ref: {ref}</p>
        <Link className="btn-cta" to="/">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
