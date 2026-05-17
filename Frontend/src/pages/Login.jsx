import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from '../components/icons/SvgIcons';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/auth/login', form);
      login(data.token, data.user);
      navigate(data.user.role === 'company' ? '/dashboard' : '/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-panel">
          <div className="auth-panel-brand">
            <BrandIcon className="brand-mark" />
            <div>
              <p className="eyebrow">Ready for your next move?</p>
              <h1>Join the best talent marketplace.</h1>
              <p>Sign in to manage your candidate pipeline, review applications, and keep hiring fast.</p>
            </div>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <strong>Professional resume uploads</strong> with secure PDF delivery for every applicant.
            </div>
            <div className="feature-item">
              <strong>Clean applicant dashboards</strong> for company teams who want clarity and speed.
            </div>
            <div className="feature-item">
              <strong>Smart candidate matching</strong> through modern posting and filtering tools.
            </div>
          </div>
        </section>

        <div className="auth-card">
          <div className="auth-header">
            <BrandIcon className="auth-icon" />
            <h1>Welcome back</h1>
            <p>Sign in to your WorkBoard account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
