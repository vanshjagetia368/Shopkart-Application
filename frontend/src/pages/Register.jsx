import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { fullName, email, password, phone } = form;
    if (!fullName || !email || !password || !phone) {
      return setError('All fields are required.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await registerCustomer(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left Brand Panel */}
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">ShopKart.</div>
          <p className="auth-brand-tagline">
            Join thousands of happy shoppers today.
          </p>
          <ul className="auth-features">
            <li>
              <div className="auth-feature-icon">✨</div>
              Curated products across 6+ categories
            </li>
            <li>
              <div className="auth-feature-icon">🔐</div>
              Your data is always private & secure
            </li>
            <li>
              <div className="auth-feature-icon">💳</div>
              Easy & transparent checkout process
            </li>
            <li>
              <div className="auth-feature-icon">📦</div>
              Real-time order tracking coming soon
            </li>
          </ul>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-panel-right">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-logo-sm">🛒 ShopKart</div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Start shopping in under a minute.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="register-form" noValidate>

            {error   && <div className="auth-alert"          role="alert">{error}</div>}
            {success && <div className="auth-alert success"  role="status">{success}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="fullName"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="pw-wrapper">
                <input
                  id="reg-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="register-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || !!success}
            >
              {loading ? (
                <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Creating account...</>
              ) : (
                'Create Account →'
              )}
            </button>

          </form>

          <div className="auth-footer">
            Already have an account?&nbsp;
            <Link to="/login" id="goto-login">Sign in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
