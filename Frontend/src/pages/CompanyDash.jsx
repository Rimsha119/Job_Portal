import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ResumeIcon } from '../components/icons/SvgIcons';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

const CompanyDash = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', salary: '', location: '', type: 'Full-time',
  });
  const [formError, setFormError] = useState('');
  const [posting, setPosting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get('/jobs/company/summary');
      setJobs(data.jobs);
      setApplications(data.applications);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const applicationsWithJobTitle = applications.map(app => ({
    ...app,
    jobTitle: jobs.find(job => job._id.toString() === app.jobId.toString())?.title || 'Unknown role',
  }));

  const filteredApplications = applicationsWithJobTitle.filter(app => {
    const searchTerm = searchQuery.trim().toLowerCase();
    const matchText = `${app.name} ${app.email} ${app.jobTitle}`.toLowerCase();
    const statusMatch = statusFilter === 'All' || (app.status ? app.status === statusFilter : statusFilter === 'All');
    return matchText.includes(searchTerm) && statusMatch;
  });

  const interviewCount = applicationsWithJobTitle.filter(app => app.status?.toLowerCase().includes('interview')).length;
  const totalApplicants = applicationsWithJobTitle.length;
  const activePostings = jobs.length;

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    setFormError('');
    try {
      await axios.post('/jobs', { ...form, salary: Number(form.salary) });
      setForm({ title: '', description: '', salary: '', location: '', type: 'Full-time' });
      setShowForm(false);
      await fetchSummary();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    setDeleteId(jobId);
    try {
      await axios.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch {
      alert('Failed to delete job.');
    } finally {
      setDeleteId(null);
    }
  };

  const metrics = [
    { title: 'Active Postings', value: activePostings, subtitle: 'Live roles on the board' },
    { title: 'Total Applicants', value: totalApplicants, subtitle: 'Across all active roles' },
    { title: 'Interviews Scheduled', value: interviewCount, subtitle: 'Next 7 days estimate' },
  ];

  return (
    <div className="page-container">
      <div className="dash-header">
        <div>
          <h1>Company Dashboard</h1>
          <p className="dash-subtitle">Welcome back, {user.name}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Post a Job'}
        </button>
      </div>

      {showForm && (
        <div className="post-job-form-wrap">
          <h2>New Job Posting</h2>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handlePost} className="post-job-form">
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Annual Salary ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 90000"
                  value={form.salary}
                  onChange={e => setForm({ ...form, salary: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={5}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={posting}>
              {posting ? <span className="spinner" /> : 'Post Job'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dash-overview">
        <div className="dash-metrics">
          {metrics.map(metric => (
            <div key={metric.title} className="overview-card">
              <span className="overview-label">{metric.title}</span>
              <span className="overview-value">{metric.value}</span>
              <span className="overview-note">{metric.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="submission-panel">
        <div className="submission-header">
          <div>
            <h2>Recent Submissions</h2>
            <p className="filter-subtitle">Track latest applicant activity and review resumes.</p>
          </div>
          <div className="submission-actions">
            <input
              type="search"
              placeholder="Search applicants or role"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {['All', 'New', 'Shortlisted', 'Interview', 'Declined'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="submission-table-wrap">
          <table className="submission-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Resume</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">No submissions match your filters.</td>
                </tr>
              ) : filteredApplications.map((app) => (
                <tr key={`${app.email}-${app.jobId}-${app.name}`}>
                  <td>{app.name}</td>
                  <td>{app.email}</td>
                  <td><span className={`status-badge status-${(app.status || 'New').toLowerCase()}`}>{app.status || 'New'}</span></td>
                  <td>
                    {app.resumeFileName ? (
                      <a href={`/uploads/${app.resumeFileName}`} target="_blank" rel="noreferrer" className="btn-resume">
                        View PDF
                      </a>
                    ) : 'No resume'}
                  </td>
                  <td>{app.jobTitle}</td>
                  <td><button className="btn-secondary" type="button">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="loader" /></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><ResumeIcon /></span>
          <h3>No jobs posted yet</h3>
          <p>Click "Post a Job" to get started.</p>
        </div>
      ) : (
        <div className="dash-job-list">
          {jobs.map(job => (
            <div key={job._id} className="dash-job-card">
              <div className="dash-job-info">
                <h3>{job.title}</h3>
                <div className="dash-job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 ${job.salary.toLocaleString()}/yr</span>
                  <span>{job.applicationsCount || 0} applicants</span>
                  <span className={`job-type-badge type-${job.type.replace(/\s+/g, '-').toLowerCase()}`}>
                    {job.type}
                  </span>
                  <span className="meta-date">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="dash-job-actions">
                <Link to={`/dashboard/jobs/${job._id}/applicants`} className="btn-secondary">
                  View Applicants
                </Link>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="btn-danger"
                  disabled={deleteId === job._id}
                >
                  {deleteId === job._id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDash;
