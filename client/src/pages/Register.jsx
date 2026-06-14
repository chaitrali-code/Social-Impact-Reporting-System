import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdGroup, MdBadge } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    club: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { confirmPassword, ...data } = formData;
    const result = await register(data);
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
            Join the movement to measure & amplify social impact
          </p>
          <div className="auth-hero-features">
            <div className="feature-item">
              <span className="feature-dot" />
              Track your club's social projects
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              Generate reports with AI
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              Visualize SDG contributions
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Get started with your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <div className="input-icon"><MdPerson /></div>
              <input
                type="text"
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label>Full Name</label>
            </div>

            <div className="input-group">
              <div className="input-icon"><MdEmail /></div>
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Email Address</label>
            </div>

            <div className="input-row">
              <div className="input-group">
                <div className="input-icon"><MdLock /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

              <div className="input-group">
                <div className="input-icon"><MdLock /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder=" "
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label>Confirm Password</label>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <div className="input-icon"><MdGroup /></div>
                <input
                  type="text"
                  name="club"
                  placeholder=" "
                  value={formData.club}
                  onChange={handleChange}
                />
                <label>Club Name</label>
              </div>

              <div className="input-group select-group">
                <div className="input-icon"><MdBadge /></div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Member</option>
                  <option value="club_admin">Club Admin</option>
                  <option value="admin">Administrator</option>
                </select>
                <label className="select-label">Role</label>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
