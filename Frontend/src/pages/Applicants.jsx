import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ResumeIcon } from '../components/icons/SvgIcons';

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const { data: res } = await axios.get(`/jobs/${id}/applications`);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applicants.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [id]);

  if (loading) return <div className="loader-wrap"><div className="loader" /></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/dashboard')} className="btn-back">← Back to Dashboard</button>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <>
          <div className="applicants-header">
            <h1>{data.job.title}</h1>
            <p className="detail-company">{data.job.companyName} · {data.job.location}</p>
            <div className="applicants-count">
              <span className="count-badge">{data.applications.length}</span>
              <span>{data.applications.length === 1 ? 'Applicant' : 'Applicants'}</span>
            </div>
          </div>

          {data.applications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No applications yet</h3>
              <p>Share your job posting to attract candidates.</p>
            </div>
          ) : (
            <div className="applicants-grid">
              {data.applications.map((app, i) => (
                <div key={app._id} className="applicant-card">
                  <div className="applicant-avatar">
                    {app.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="applicant-info">
                    <h3>{app.name}</h3>
                    <a href={`mailto:${app.email}`} className="applicant-email">{app.email}</a>
                    <div className="applicant-meta">
                      <span className="applicant-date">
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                      <a
                        href={`/uploads/${app.resumeFileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-resume"
                      >
                        <ResumeIcon /> View Resume
                      </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Applicants;
