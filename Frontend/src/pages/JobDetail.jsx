import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LocationIcon, MoneyIcon, CalendarIcon, CompanyIcon, AlertIcon } from '../components/icons/SvgIcons';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [applyForm, setApplyForm] = useState({ name: '', email: '', resumeFile: null });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(`/jobs/${id}`);
        setJob(data);
        if (user) setApplyForm(f => ({ ...f, name: user.name, email: user.email, resumeFile: null }));
      } catch {
        setError('Job not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError('');
    try {
      const formData = new FormData();
      formData.append('name', applyForm.name);
      formData.append('email', applyForm.email);
      if (applyForm.resumeFile) formData.append('resume', applyForm.resumeFile);

      await axios.post(`/jobs/${id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loader-wrap"><div className="loader" /></div>;
  if (error) return (
    <div className="page-container">
      <div className="empty-state">
        <span className="empty-icon"><AlertIcon /></span>
        <h3>{error}</h3>
        <button onClick={() => navigate('/jobs')} className="btn-primary">Browse Jobs</button>
      </div>
    </div>
  );

  return (
    <div className="page-container detail-layout">
      <div className="job-detail-main">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>

        <div className="detail-header">
          <div>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-company">{job.companyName}</p>
          </div>
          <span className={`job-type-badge type-${job.type.replace(/\s+/g, '-').toLowerCase()} badge-lg`}>
            {job.type}
          </span>
        </div>

        <div className="detail-meta-row">
          <div className="detail-meta-item">
            <span className="meta-icon"><LocationIcon /></span>
            <div>
              <p className="meta-label">Location</p>
              <p className="meta-value">{job.location}</p>
            </div>
          </div>
          <div className="detail-meta-item">
            <span className="meta-icon"><MoneyIcon /></span>
            <div>
              <p className="meta-label">Salary</p>
              <p className="meta-value">Rs {job.salary.toLocaleString()}/year</p>
            </div>
          </div>
          <div className="detail-meta-item">
            <span className="meta-icon"><CalendarIcon /></span>
            <div>
              <p className="meta-label">Posted</p>
              <p className="meta-value">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>About This Role</h2>
          <div className="detail-description">
            {job.description.split('\n').map((p, i) => p && <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>

      <div className="job-detail-sidebar">
        {!user && (
          <div className="apply-card">
            <h3>Interested in this role?</h3>
            <p>Sign in to apply for this position.</p>
            <button onClick={() => navigate('/login')} className="btn-primary btn-full">
              Sign In to Apply
            </button>
          </div>
        )}

        {user?.role === 'company' && (
          <div className="apply-card info-card">
            <span className="info-icon"><CompanyIcon /></span>
            <p>You're viewing this as a company account. Switch to a candidate account to apply.</p>
          </div>
        )}

        {user?.role === 'candidate' && !applySuccess && (
          <div className="apply-card">
            <h3>Apply Now</h3>
            <p className="apply-subtitle">Takes less than 2 minutes</p>

            {applyError && <div className="alert alert-error">{applyError}</div>}

            <form onSubmit={handleApply} className="apply-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={applyForm.name}
                  onChange={e => setApplyForm({ ...applyForm, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={applyForm.email}
                  onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Upload Resume (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setApplyForm({ ...applyForm, resumeFile: e.target.files[0] })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary btn-full" disabled={applying}>
                {applying ? <span className="spinner" /> : 'Submit Application'}
              </button>
            </form>
          </div>
        )}

        {applySuccess && (
          <div className="apply-card success-card">
            <span className="success-icon">✓</span>
            <h3>Application Sent!</h3>
            <p>Your application has been submitted successfully. Good luck!</p>
            <button onClick={() => navigate('/jobs')} className="btn-secondary btn-full">
              Browse More Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
