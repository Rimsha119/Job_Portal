import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LocationIcon, MoneyIcon, ResumeIcon } from '../components/icons/SvgIcons';

const JOB_TYPES = ['', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
const QUICK_LOCATIONS = ['New York', 'Remote', 'London'];
const QUICK_TYPES = ['Full-time', 'Contract', 'Part-time'];

const JobFeed = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    minSalary: '',
    maxSalary: '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await axios.get('/jobs', { params });
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(fetchJobs, 400);
    return () => clearTimeout(debounce);
  }, [fetchJobs]);

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const setLocationFilter = (location) => {
    setFilters({ ...filters, location });
  };

  const setTypeFilter = (type) => {
    setFilters({ ...filters, type });
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', minSalary: '', maxSalary: '' });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page-container feed-layout">
      <div className="feed-hero">
        <h1>Find Your Next Opportunity</h1>
        <p>{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} currently available</p>
      </div>

      <div className="feed-panel">
        <aside className="filter-sidebar">
          <div className="filter-panel">
            <h2>Search & Filters</h2>
            <p className="filter-subtitle">Refine your search across location, type, and salary.</p>

            <div className="filter-group">
              <label>Keywords</label>
              <input
                type="text"
                name="search"
                placeholder="Search title, company, keywords..."
                value={filters.search}
                onChange={handleFilter}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="City or remote"
                value={filters.location}
                onChange={handleFilter}
                className="filter-input"
              />
              <div className="chip-group"> 
                {QUICK_LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    className={`chip-button ${filters.location === loc ? 'selected' : ''}`}
                    onClick={() => setLocationFilter(filters.location === loc ? '' : loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Job Type</label>
              <div className="chip-group">
                {QUICK_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`chip-button ${filters.type === type ? 'selected' : ''}`}
                    onClick={() => setTypeFilter(filters.type === type ? '' : type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <select name="type" value={filters.type} onChange={handleFilter} className="filter-select">
                {JOB_TYPES.map(t => (
                  <option key={t} value={t}>{t || 'All Types'}</option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Min Salary</label>
                <input
                  type="number"
                  name="minSalary"
                  placeholder="50,000"
                  value={filters.minSalary}
                  onChange={handleFilter}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Max Salary</label>
                <input
                  type="number"
                  name="maxSalary"
                  placeholder="150,000"
                  value={filters.maxSalary}
                  onChange={handleFilter}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn-clear" disabled={!hasFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        <section className="job-stream">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loader-wrap"><div className="loader" /></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><ResumeIcon /></span>
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="job-grid">
              {jobs.map(job => (
                <Link to={`/jobs/${job._id}`} key={job._id} className="job-card">
                  <div className="job-card-top">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.companyName}</p>
                    </div>
                    <span className={`job-type-badge type-${job.type.replace(/\s+/g, '-').toLowerCase()}`}>
                      {job.type}
                    </span>
                  </div>
                  <div className="job-card-meta">
                    <span className="meta-item"><LocationIcon /> {job.location}</span>
                    <span className="meta-item"><MoneyIcon /> ${job.salary.toLocaleString()}/yr</span>
                  </div>
                  <p className="job-excerpt">
                    {job.description.length > 120
                      ? job.description.slice(0, 120) + '...'
                      : job.description}
                  </p>
                  <div className="job-card-footer">
                    <span className="job-date">
                      {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="view-link">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default JobFeed;
