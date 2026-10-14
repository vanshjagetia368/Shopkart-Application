import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginCustomer } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]  = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return setError('Please fill in all fields.');
    }
    setLoading(true);
    try {
      await loginCustomer(form);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
            Your favourite products, delivered with care.
          </p>
          <ul className="auth-features">
            <li>
              <div className="auth-feature-icon">🔒</div>
              Secure HttpOnly cookie auth
            </li>
            <li>
              <div className="auth-feature-icon">⚡</div>
              Instant access to thousands of products
            </li>
            <li>
              <div className="auth-feature-icon">🚚</div>
              Free shipping on orders above ₹999
            </li>
            <li>
              <div className="auth-feature-icon">🎧</div>
              24/7 customer support
            </li>
          </ul>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-panel-right">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-logo-sm">🛒 ShopKart</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your account to continue shopping.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form" noValidate>

            {error && (
              <div className="auth-alert" role="alert">{error}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="pw-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
              id="login-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Signing in...</>
              ) : (
                'Sign In →'
              )}
            </button>

          </form>

          <div className="auth-footer">
            Don't have an account?&nbsp;
            <Link to="/register" id="goto-register">Create one free</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
