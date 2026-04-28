import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    api.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const toggleRole = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: res.data.role } : u))
      );
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Manage Users</h1>
      </div>

      <div className="table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="inv-cell-name">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.createdAt.split('T')[0]}</td>
                <td className="inv-cell-actions">
                  <button
                    className={`inv-btn-${u.role === 'ADMIN' ? 'del' : 'edit'}`}
                    onClick={() => toggleRole(u.id)}
                  >
                    {u.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" className="inv-empty">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
