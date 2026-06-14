import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdFolder, MdCloudUpload, MdAutoAwesome,
  MdShare, MdPublic, MdInsights, MdChevronLeft
} from 'react-icons/md';
import './Sidebar.css';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { to: '/projects', label: 'Projects', icon: MdFolder },
  { to: '/projects/new', label: 'Upload Project', icon: MdCloudUpload },
  { to: '/reports', label: 'AI Reports', icon: MdAutoAwesome },
  { to: '/social-media', label: 'Social Media', icon: MdShare },
  { to: '/sdg-mapping', label: 'SDG Mapping', icon: MdPublic },
  { to: '/impact', label: 'Impact', icon: MdInsights },
];

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-link-icon">
                <item.icon />
              </span>
              <span className="sidebar-link-label">{item.label}</span>
              {/* Active indicator bar */}
              <span className="sidebar-link-indicator" />
            </NavLink>
          ))}
        </nav>
      </div>
      <button className="sidebar-collapse-btn" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
        <MdChevronLeft />
      </button>
    </aside>
  );
};

export default Sidebar;
