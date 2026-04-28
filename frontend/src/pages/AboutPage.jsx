import React from 'react';

/*
 * PURPOSE: About / brand story page.
 */
export default function AboutPage() {
  return (
    <div className="about-container">
      <h1>Our Story</h1>
      <p className="about-lead">Bringing India&apos;s finest teas to your doorstep.</p>

      <div className="about-grid">
        <div className="about-card">
          <h2>Where We Begin</h2>
          <p>
            Chai &amp; Leaf started with a simple idea — India grows some of the best teas
            in the world, yet most tea lovers never taste them at their freshest. We source
            directly from estates in Darjeeling, Nilgiri, Assam, and Kangra, ensuring every
            cup reflects the garden it comes from.
          </p>
        </div>
        <div className="about-card">
          <h2>Our Process</h2>
          <p>
            We work with estate growers who hand-pluck the finest leaves during peak
            harvest windows. Our teas are processed in small batches, packed fresh,
            and shipped quickly — so what reaches you is as close to the garden as possible.
          </p>
        </div>
        <div className="about-card">
          <h2>Our Promise</h2>
          <p>
            We believe in quality you can taste, transparent sourcing, and eco-friendly
            packaging. Every order is sealed in compostable material and shipped with
            care. No middlemen, no stale stock — just great tea, delivered fresh.
          </p>
        </div>
        <div className="about-card">
          <h2>The Team</h2>
          <p>
            <strong>Ananya Rao</strong> — Co-founder &amp; Head of Sourcing
            <br />
            A tea sommelier from Kerala who spent years travelling India&apos;s tea estates
            before starting Chai &amp; Leaf. She personally selects every tea in our collection.
          </p>
        </div>
      </div>
    </div>
  );
}
