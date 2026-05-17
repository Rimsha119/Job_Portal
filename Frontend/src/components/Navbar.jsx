import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandIcon, CompanyIcon, UserIcon } from './icons/SvgIcons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/jobs" className="navbar-brand">
        <BrandIcon className="brand-icon" />
        <span className="brand-text">WorkBoard</span>
      </Link>

      <div className="navbar-links">
        <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
          Browse Jobs
        </Link>

        {user ? (
          <>
            {user.role === 'company' && (
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
            )}
            <div className="nav-user">
              <span className="user-badge" data-role={user.role}>
                {user.role === 'company' ? <CompanyIcon /> : <UserIcon />} {user.name}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth">
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className="btn-register">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
