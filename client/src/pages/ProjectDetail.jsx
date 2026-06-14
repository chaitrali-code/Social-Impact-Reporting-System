import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, deleteProject, generateReport } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SDGBadge from '../components/SDGBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import {
  MdPeople, MdVolunteerActivism, MdAccessTime, MdAttachMoney,
  MdCalendarToday, MdLocationOn, MdAutoAwesome, MdShare,
  MdPublic, MdEdit, MdDelete, MdArrowBack, MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await getProject(id);
        setProject(data.project || data);
        if (data.report || data.project?.report) {
          setReport(data.report || data.project.report);
        }
      } catch {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const { data } = await generateReport(id);
      setReport(data.report || data);
      toast.success('Report generated! ✨');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const nextPhoto = () => {
    if (!project?.photos?.length) return;
    setCurrentPhoto(prev => (prev + 1) % project.photos.length);
  };

  const prevPhoto = () => {
    if (!project?.photos?.length) return;
    setCurrentPhoto(prev => (prev - 1 + project.photos.length) % project.photos.length);
  };

  if (loading) {
    return <div className="page-loading"><LoadingSpinner size="lg" text="Loading project..." /></div>;
  }

  if (!project) return null;

  const photos = project.photos || [];
  const sdgs = project.sdgGoals || project.sdgs || [];
  const formattedDate = project.date
    ? new Date(project.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified';

  return (
    <div className="project-detail">
      <button className="back-btn" onClick={() => navigate('/projects')}>
        <MdArrowBack /> Back to Projects
      </button>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="photo-gallery">
          <img
            src={photos[currentPhoto]?.startsWith('http') ? photos[currentPhoto] : `/api/${photos[currentPhoto]}`}
            alt={project.title}
            className="gallery-image"
          />
          {photos.length > 1 && (
            <>
              <button className="gallery-nav gallery-prev" onClick={prevPhoto}><MdChevronLeft /></button>
              <button className="gallery-nav gallery-next" onClick={nextPhoto}><MdChevronRight /></button>
              <div className="gallery-dots">
                {photos.map((_, i) => (
                  <span key={i} className={`dot ${i === currentPhoto ? 'active' : ''}`} onClick={() => setCurrentPhoto(i)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-text">
          {project.category && <span className="detail-category">{project.category}</span>}
          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-club">{project.club || project.clubName || 'Community Project'}</p>
        </div>
        <div className="detail-actions">
          <button className="action-btn action-report" onClick={handleGenerateReport} disabled={generatingReport}>
            <MdAutoAwesome />
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </button>
          <button className="action-btn action-social" onClick={() => navigate(`/social-media?project=${id}`)}>
            <MdShare /> Social Media
          </button>
          <button className="action-btn action-sdg" onClick={() => navigate(`/sdg-mapping?project=${id}`)}>
            <MdPublic /> SDG Analysis
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="detail-card">
        <h3>About this Project</h3>
        <p className="detail-description">{project.description}</p>
        <div className="detail-meta">
          <span><MdCalendarToday /> {formattedDate}</span>
          {project.location && <span><MdLocationOn /> {project.location}</span>}
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="impact-metrics">
        {project.beneficiaries != null && (
          <div className="impact-card">
            <MdPeople className="impact-icon" style={{ color: '#7c3aed' }} />
            <div className="impact-value">{project.beneficiaries?.toLocaleString()}</div>
            <div className="impact-label">Beneficiaries</div>
          </div>
        )}
        {project.volunteers != null && (
          <div className="impact-card">
            <MdVolunteerActivism className="impact-icon" style={{ color: '#14b8a6' }} />
            <div className="impact-value">{project.volunteers?.toLocaleString()}</div>
            <div className="impact-label">Volunteers</div>
          </div>
        )}
        {project.duration && (
          <div className="impact-card">
            <MdAccessTime className="impact-icon" style={{ color: '#f97316' }} />
            <div className="impact-value">{project.duration}</div>
            <div className="impact-label">Duration</div>
          </div>
        )}
        {project.funding != null && (
          <div className="impact-card">
            <MdAttachMoney className="impact-icon" style={{ color: '#ec4899' }} />
            <div className="impact-value">₹{Number(project.funding).toLocaleString()}</div>
            <div className="impact-label">Funding</div>
          </div>
        )}
      </div>

      {/* SDG Goals */}
      {sdgs.length > 0 && (
        <div className="detail-card">
          <h3>SDG Contributions</h3>
          <div className="detail-sdgs">
            {sdgs.map(num => (
              <SDGBadge key={num} number={num} size="md" showName />
            ))}
          </div>
        </div>
      )}

      {/* Generated Report */}
      {report && (
        <div className="detail-card report-card">
          <div className="report-header">
            <h3><MdAutoAwesome /> AI Generated Report</h3>
            <button
              className="copy-btn"
              onClick={() => { navigator.clipboard.writeText(typeof report === 'string' ? report : report.content || ''); toast.success('Copied!'); }}
            >
              Copy
            </button>
          </div>
          <div className="report-content markdown-content">
            <ReactMarkdown>{typeof report === 'string' ? report : report.content || ''}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="detail-admin-actions">
        <button className="action-btn action-edit" onClick={() => navigate(`/projects/${id}/edit`)}>
          <MdEdit /> Edit Project
        </button>
        <button className="action-btn action-delete" onClick={handleDelete}>
          <MdDelete /> Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;
