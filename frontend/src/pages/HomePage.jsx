import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import api from '../api/axios';

/*
 * PURPOSE: Landing page — first impression for visitors.
 */
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => {
        const featuredIds = [1, 7, 3];
        setFeatured(res.data.filter((p) => featuredIds.includes(p.id)));
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div style={{ maxWidth: 700 }}>
          <h1 className="hero-title">
            Discover the Finest <em>Indian Teas</em>
          </h1>
          <p className="hero-sub">
            From the misty hills of <strong>Darjeeling</strong>, the lush valleys of <strong>Nilgiri</strong>,
            and the ancient estates of <strong>Assam</strong> — straight to your cup.
          </p>
          <Link className="btn-cta" to="/shop">
            Shop Now &rarr;
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 className="section-title">Our Favourites</h2>
        <p className="section-subtitle">
          Handpicked teas loved by our customers
        </p>
        {featured.length === 0 ? (
          <div className="loading">Loading fine teas...</div>
        ) : (
          <div className="product-row">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHAI & LEAF */}
      <section className="pillars">
        <div className="pillar">
          <span className="pillar-icon">&#127793;</span>
          <h3>Sourced Directly from Estates</h3>
          <p>
            We work directly with tea estates in Darjeeling, Nilgiri, Assam, and beyond
            to bring you fresh, authentic teas — straight from the garden.
          </p>
        </div>
        <div className="pillar">
          <span className="pillar-icon">&#9749;</span>
          <h3>Freshly Packed to Order</h3>
          <p>
            Every order is sealed fresh in airtight packaging to preserve flavour,
            aroma, and the natural goodness of every leaf.
          </p>
        </div>
        <div className="pillar">
          <span className="pillar-icon">&#128666;</span>
          <h3>Free Delivery Across India</h3>
          <p>
            Enjoy fast, free shipping on every order, wherever you are in India.
            Most orders delivered within 3 to 7 working days.
          </p>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <h2>Start Your Tea Journey</h2>
        <p>Every cup tells a story.</p>
        <Link className="btn-cta" to="/shop">
          Explore Our Teas
        </Link>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
