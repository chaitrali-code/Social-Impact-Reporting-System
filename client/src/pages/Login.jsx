import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-hero-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>
          <h1 className="auth-hero-title">
            <span className="logo-icon">✦</span> ImpactFlow
          </h1>
          <p className="auth-hero-subtitle">
            Smart Social Impact Reporting System
          </p>
          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-dot" />
              AI-Powered Report Generation
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              SDG Goal Mapping & Analysis
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              Beautiful Impact Visualizations
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <div className="input-icon"><MdEmail /></div>
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <label>Email Address</label>
            </div>

            <div className="input-group">
              <div className="input-icon"><MdLock /></div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <label>Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
