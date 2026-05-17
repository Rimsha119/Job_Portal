import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BrandIcon, UserIcon, CompanyIcon } from '../components/icons/SvgIcons';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
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
      const { data } = await axios.post('/auth/register', form);
      login(data.token, data.user);
      navigate(data.user.role === 'company' ? '/dashboard' : '/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              <p className="eyebrow">Start hiring with confidence</p>
              <h1>Set up your WorkBoard employer or candidate account.</h1>
              <p>Choose the right role, upload resumes securely, and grow your talent pipeline with a polished interface.</p>
            </div>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <strong>Fast onboarding</strong> for companies and candidates with role-specific experiences.
            </div>
            <div className="feature-item">
              <strong>Upload resume PDFs</strong> and make candidate profiles instantly accessible.
            </div>
            <div className="feature-item">
              <strong>Professional company pages</strong> with clearer job posting workflows.
            </div>
          </div>
        </section>

        <div className="auth-card">
          <div className="auth-header">
            <BrandIcon className="auth-icon" />
            <h1>Create Account</h1>
            <p>Join WorkBoard today</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>I am a...</label>
              <div className="role-selector">
                <label className={`role-option ${form.role === 'candidate' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="candidate"
                    checked={form.role === 'candidate'}
                    onChange={handleChange}
                  />
                  <span className="role-icon"><UserIcon /></span>
                  <span className="role-label">Job Seeker</span>
                  <span className="role-sub">Candidate</span>
                </label>
                <label className={`role-option ${form.role === 'company' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="company"
                    checked={form.role === 'company'}
                    onChange={handleChange}
                  />
                  <span className="role-icon"><CompanyIcon /></span>
                  <span className="role-label">Employer</span>
                  <span className="role-sub">Company</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
