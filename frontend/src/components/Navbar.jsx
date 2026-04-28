import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { cartCount, clearCart } = useCart();
  const { user, logout: authLogout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    authLogout();
    clearCart();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link className="navbar-logo" to="/">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Chai &amp; Leaf</span>
        </Link>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">Our Story</Link></li>
          <li>
            <Link to="/cart">
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </li>
          {user ? (
            <>
              {isAdmin && (
                <li className="admin-dropdown">
                  <span className="admin-label">Admin ▾</span>
                  <div className="admin-dropdown-content">
                    <Link to="/admin/inventory">Inventory</Link>
                    <Link to="/admin/users">Manage Users</Link>
                  </div>
                </li>
              )}
              <li className="user-info">
                <span className="user-name">{user.name}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="login-link">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
