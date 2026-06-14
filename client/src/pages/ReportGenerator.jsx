import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProjects, generateReport, estimateAttendance } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { MdAutoAwesome, MdContentCopy, MdPeople } from 'react-icons/md';
import './ReportGenerator.css';

const ReportGenerator = () => {
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(preselectedProject || '');
  const [report, setReport] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await getProjects();
        setProjects(data.projects || data || []);
      } catch {
        setProjects([]);
      } finally {
        setFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    setLoading(true);
    setReport('');
    try {
      const { data } = await generateReport(selectedProject);
      setReport(data.report || data.content || JSON.stringify(data, null, 2));
      toast.success('Report generated! ✨');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleEstimateAttendance = async () => {
    if (!selectedProject) return;
    setEstimating(true);
    try {
      const project = projects.find(p => (p._id || p.id) === selectedProject);
      if (project?.photos?.length > 0) {
        const fd = new FormData();
        fd.append('projectId', selectedProject);
        const { data } = await estimateAttendance(fd);
        setAttendance(data);
        toast.success('Attendance estimated!');
      } else {
        toast.error('No photos available for estimation');
      }
    } catch {
      toast.error('Attendance estimation failed');
    } finally {
      setEstimating(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report);
    toast.success('Report copied to clipboard!');
  };

  return (
    <div className="report-page">
      <div className="report-page-header">
        <h1 className="page-title">AI Report Generator</h1>
        <p className="page-subtitle">Generate comprehensive impact reports powered by AI</p>
      </div>

      {/* Controls */}
      <div className="report-controls">
        <div className="report-select-group">
          <label>Select Project</label>
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            disabled={fetchingProjects}
          >
            <option value="">-- Choose a project --</option>
            {projects.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="report-actions">
          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={loading || !selectedProject}
          >
            {loading ? (
              <>
                <span className="btn-loader" />
                Generating...
              </>
            ) : (
              <>
                <MdAutoAwesome className="sparkle" />
                Generate Report
              </>
            )}
          </button>

          <button
            className="btn-estimate"
            onClick={handleEstimateAttendance}
            disabled={estimating || !selectedProject}
          >
            <MdPeople />
            {estimating ? 'Estimating...' : 'Estimate Attendance'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="report-loading">
          <div className="ai-typing">
            <div className="typing-dots">
              <span /><span /><span />
            </div>
            <p>AI is analyzing your project and generating a report...</p>
          </div>
        </div>
      )}

      {/* Attendance Result */}
      {attendance && (
        <div className="attendance-card">
          <MdPeople className="attendance-icon" />
          <div>
            <h4>Estimated Attendance</h4>
            <p className="attendance-value">{attendance.estimated || attendance.count || 'N/A'} people</p>
            {attendance.confidence && <p className="attendance-confidence">Confidence: {attendance.confidence}</p>}
          </div>
        </div>
      )}

      {/* Report Output */}
      {report && !loading && (
        <div className="report-output">
          <div className="report-output-header">
            <h3><MdAutoAwesome /> Generated Report</h3>
            <button className="copy-btn" onClick={copyReport}>
              <MdContentCopy /> Copy
            </button>
          </div>
          <div className="report-output-content markdown-content">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
