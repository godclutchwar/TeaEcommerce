import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import axios from 'axios';

const CATEGORIES = ['black', 'green', 'white', 'herbal', 'oolong', 'blend'];

const EMPTY_FORM = {
  name: '', category: 'black', description: '', fullDescription: '',
  origin: '', strength: '', caffeine: '', bestTime: '', iconUnicode: '',
  stockQuantity: 0, imageUrl: null, logoUrl: null, priceValue: '',
};

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageUploading, setImageUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  const refresh = () => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => {});
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditing(product.id);
      setForm({
        name: product.name,
        category: product.category,
        description: product.description,
        fullDescription: product.fullDescription,
        origin: product.origin,
        strength: product.strength,
        caffeine: product.caffeine,
        bestTime: product.bestTime,
        iconUnicode: product.iconUnicode,
        stockQuantity: product.stockQuantity ?? 0,
        imageUrl: product.imageUrl || null,
        logoUrl: product.logoUrl || null,
        priceValue: product.priceDisplay.replace('₹', ''),
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.priceValue) return alert('Name and price are required.');
    const dto = {
      name: form.name,
      category: form.category,
      description: form.description,
      fullDescription: form.fullDescription,
      priceDisplay: `₹${form.priceValue}`,
      origin: form.origin,
      strength: form.strength,
      caffeine: form.caffeine,
      bestTime: form.bestTime,
      iconUnicode: form.iconUnicode || '🍵',
      stockQuantity: form.stockQuantity,
      imageUrl: form.imageUrl,
      logoUrl: form.logoUrl,
    };
    try {
      if (editing != null) {
        await api.put(`/products/${editing}`, dto);
      } else {
        await api.post('/products', dto);
      }
      setOpen(false);
      refresh();
    } catch (e) {
      alert('Failed to save: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      refresh();
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const setUploading = field === 'imageUrl' ? setImageUploading : setLogoUploading;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${'/api'}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, [field]: res.data.url }));
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
    setUploading(false);
  };

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <button className="btn-inv-add" onClick={() => handleOpen()}>+ Add Product</button>
      </div>

      <div className="table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Img</th>
              <th>Logo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Origin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="inv-cell-thumb">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="inv-thumb" /> : <span>{p.iconUnicode || '🍵'}</span>}
                </td>
                <td className="inv-cell-thumb">
                  {p.logoUrl ? <img src={p.logoUrl} alt="logo" className="inv-thumb" /> : '—'}
                </td>
                <td className="inv-cell-name">{p.name}</td>
                <td>{p.category}</td>
                <td className={((p.stockQuantity ?? 0) === 0) ? 'inv-stock-zero' : ''}>{p.stockQuantity ?? 0}</td>
                <td>{p.priceDisplay}</td>
                <td>{p.origin}</td>
                <td className="inv-cell-actions">
                  <button className="inv-btn-edit" onClick={() => handleOpen(p)}>Edit</button>
                  <button className="inv-btn-del" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="8" className="inv-empty">No products. Click "Add Product" to create one.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="inv-overlay" onClick={() => setOpen(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing != null ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="inv-form-grid">
              <label>Name <input value={form.name} onChange={(e) => change('name', e.target.value)} required /></label>
              <label>Category
                <select value={form.category} onChange={(e) => change('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>Price (₹) <input type="number" step="0.01" min="0" value={form.priceValue} onChange={(e) => change('priceValue', e.target.value)} /></label>
              <label>Stock Qty <input type="number" min="0" value={form.stockQuantity} onChange={(e) => change('stockQuantity', Number(e.target.value))} /></label>
              <label>Description <input value={form.description} onChange={(e) => change('description', e.target.value)} /></label>
              <label>Full Description <textarea value={form.fullDescription} onChange={(e) => change('fullDescription', e.target.value)} rows={3} /></label>
              <label>Origin <input value={form.origin} onChange={(e) => change('origin', e.target.value)} /></label>
              <label>Strength <input value={form.strength} onChange={(e) => change('strength', e.target.value)} /></label>
              <label>Caffeine <input value={form.caffeine} onChange={(e) => change('caffeine', e.target.value)} /></label>
              <label>Best Time <input value={form.bestTime} onChange={(e) => change('bestTime', e.target.value)} /></label>
              <label className="inv-upload-label">
                Product Image
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl')} />
                {imageUploading && <span className="inv-uploading"> Uploading…</span>}
                {form.imageUrl && !imageUploading && <span className="inv-upload-ok"> ✔ Uploaded</span>}
              </label>
              <label className="inv-upload-label">
                Logo
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                {logoUploading && <span className="inv-uploading"> Uploading…</span>}
                {form.logoUrl && !logoUploading && <span className="inv-upload-ok"> ✔ Uploaded</span>}
              </label>
              <label>Icon Unicode <input value={form.iconUnicode} onChange={(e) => change('iconUnicode', e.target.value)} /></label>
            </div>
            <div className="inv-modal-actions">
              <button className="inv-btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
              <button className="inv-btn-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
