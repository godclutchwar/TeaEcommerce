import React from 'react';
import { Link } from 'react-router-dom';

/* PURPOSE: Static footer — visible on all pages (hidden on confirm page). */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-section">
          <div className="footer-brand-name">
            <span style={{ fontFamily: "var(--font-display)" }}>Chai &amp; Leaf</span>
          </div>
          <p className="footer-tagline">Handcrafted Indian teas, delivered to your door.</p>
          <p className="footer-contact">
            <a href="mailto:hello@chaiandleaf.in">hello@chaiandleaf.in</a>
            {" | "}
            <a href="tel:+911234567890">+91 12345 67890</a>
          </p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/checkout">Contact</Link>
        </div>
        <p className="footer-copy">&copy; 2026 Chai &amp; Leaf. All rights reserved.</p>
      </div>
    </footer>
  );
}
