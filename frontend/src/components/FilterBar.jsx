import React from 'react';

/*
 * PURPOSE: Category filter buttons on the ShopPage.
 */
const categories = [
  { key: 'all', label: 'All Teas' },
  { key: 'black', label: 'Black Tea' },
  { key: 'green', label: 'Green Tea' },
  { key: 'white', label: 'White Tea' },
  { key: 'oolong', label: 'Oolong' },
  { key: 'herbal', label: 'Herbal' },
  { key: 'blend', label: 'Blended' },
];

export default function FilterBar({ activeCategory, onChange }) {
  return (
    <div className="filter-bar">
      {categories.map((cat) => (
        <button
          key={cat.key}
          className={`filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
          onClick={() => onChange(cat.key)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
