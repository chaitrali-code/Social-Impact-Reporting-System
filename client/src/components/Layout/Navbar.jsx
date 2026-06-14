import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdMenu, MdClose, MdLogout, MdDashboard, MdFolder, MdCloudUpload, MdAutoAwesome, MdShare, MdPublic, MdInsights } from 'react-icons/md';
import './Navbar.css';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { to: '/projects', label: 'Projects', icon: MdFolder },
  { to: '/projects/new', label: 'Upload', icon: MdCloudUpload },
  { to: '/reports', label: 'AI Reports', icon: MdAutoAwesome },
  { to: '/social-media', label: 'Social', icon: MdShare },
  { to: '/sdg-mapping', label: 'SDG Map', icon: MdPublic },
  { to: '/impact', label: 'Impact', icon: MdInsights },
];

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <MdMenu />
          </button>
          <Link to="/dashboard" className="navbar-logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">ImpactFlow</span>
          </Link>
        </div>

        <div className="navbar-center">
          {navLinks.slice(0, 4).map(link => (
            <Link key={link.to} to={link.to} className="navbar-link">
              <link.icon />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            <div className="user-avatar">{userInitial}</div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
          <button className="navbar-logout" onClick={handleLogout} title="Logout">
            <MdLogout />
          </button>
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <span className="logo-icon">✦</span>
            <span className="logo-text">ImpactFlow</span>
            <button onClick={() => setMobileMenuOpen(false)}><MdClose /></button>
          </div>
          <div className="mobile-menu-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="mobile-menu-footer">
            <div className="mobile-user-info">
              <div className="user-avatar">{userInitial}</div>
              <div>
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-email">{user?.email || ''}</p>
              </div>
            </div>
            <button className="mobile-logout" onClick={handleLogout}>
              <MdLogout />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
