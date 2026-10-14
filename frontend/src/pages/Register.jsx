import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess]  = useState('');
  const [loading, setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
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
    <main className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">ShopKart</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join thousands of happy shoppers</p>

        {error   && <div className="auth-alert" role="alert">{error}</div>}
        {success && <div className="auth-alert success" role="status">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-fullname">Full Name</label>
            <input
              id="reg-fullname"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              required autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
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
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
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
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
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
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?&nbsp;
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
