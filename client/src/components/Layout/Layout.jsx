import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import './Layout.css';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileShow, setSidebarMobileShow] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setSidebarMobileShow(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <div className="layout">
      <Navbar onToggleSidebar={toggleSidebar} />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />
      {sidebarMobileShow && (
        <div className="sidebar-backdrop" onClick={() => setSidebarMobileShow(false)} />
      )}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(30, 30, 50, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body)',
          },
          success: {
            iconTheme: { primary: '#14b8a6', secondary: '#f1f5f9' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
          },
        }}
      />
    </div>
  );
};

export default Layout;
