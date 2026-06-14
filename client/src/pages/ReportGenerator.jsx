import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProjects, generateReport, estimateAttendance } from '../services/api';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

import {
  MdAutoAwesome,
  MdContentCopy,
  MdPeople,
  MdDownload,
  MdPictureAsPdf
} from 'react-icons/md';

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
      } catch (error) {
        console.error(error);
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

      console.log('Report API Response:', data);

      const reportContent =
        data?.report?.generatedContent ||
        data?.generatedContent ||
        data?.content ||
        '';

      if (!reportContent) {
        toast.error('No report content found');
        return;
      }

      setReport(reportContent);

      toast.success('Report generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleEstimateAttendance = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    setEstimating(true);

    try {
      const project = projects.find(
        p => (p._id || p.id) === selectedProject
      );

      if (!project?.photos?.length) {
        toast.error('No photos available');
        return;
      }

      const fd = new FormData();
      fd.append('projectId', selectedProject);

      const { data } = await estimateAttendance(fd);

      setAttendance(data);

      toast.success('Attendance estimated!');
    } catch (error) {
      console.error(error);
      toast.error('Attendance estimation failed');
    } finally {
      setEstimating(false);
    }
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);

      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const downloadMarkdown = () => {
    if (!report) {
      toast.error('No report available');
      return;
    }

    const blob = new Blob([report], {
      type: 'text/markdown;charset=utf-8'
    });

    saveAs(blob, 'Social-Impact-Report.md');

    toast.success('Markdown downloaded!');
  };

  const downloadPDF = () => {
    if (!report) {
      toast.error('No report available');
      return;
    }

    const doc = new jsPDF();

    const lines = doc.splitTextToSize(report, 180);

    doc.setFontSize(12);
    doc.text(lines, 10, 10);

    doc.save('Social-Impact-Report.pdf');

    toast.success('PDF downloaded!');
  };

  return (
    <div className="report-page">

      <div className="report-page-header">
        <h1 className="page-title">
          AI Report Generator
        </h1>

        <p className="page-subtitle">
          Generate comprehensive impact reports powered by AI
        </p>
      </div>

      <div className="report-controls">
        <div className="report-select-group">
          <label>Select Project</label>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={fetchingProjects}
          >
            <option value="">
              -- Choose a project --
            </option>

            {projects.map((project) => (
              <option
                key={project._id || project.id}
                value={project._id || project.id}
              >
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div className="report-actions">

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={loading || !selectedProject}
          >
            <MdAutoAwesome />

            {loading
              ? 'Generating...'
              : 'Generate Report'}
          </button>

          <button
            className="btn-estimate"
            onClick={handleEstimateAttendance}
            disabled={estimating || !selectedProject}
          >
            <MdPeople />

            {estimating
              ? 'Estimating...'
              : 'Estimate Attendance'}
          </button>

        </div>
      </div>

      {loading && (
        <div className="report-loading">
          <p>
            AI is generating your report...
          </p>
        </div>
      )}

      {attendance && (
        <div className="attendance-card">
          <MdPeople size={30} />

          <div>
            <h4>Estimated Attendance</h4>

            <p>
              {attendance.estimated ||
                attendance.count ||
                'N/A'}{' '}
              people
            </p>

            {attendance.confidence && (
              <p>
                Confidence: {attendance.confidence}
              </p>
            )}
          </div>
        </div>
      )}

      {report && !loading && (
        <div className="report-output">

          <div className="report-output-header">

            <h3>
              <MdAutoAwesome />
              Generated Report
            </h3>

            <div
              style={{
                display: 'flex',
                gap: '10px'
              }}
            >

              <button
                className="copy-btn"
                onClick={copyReport}
              >
                <MdContentCopy />
                Copy
              </button>

              <button
                className="copy-btn"
                onClick={downloadMarkdown}
              >
                <MdDownload />
                Download MD
              </button>

              <button
                className="copy-btn"
                onClick={downloadPDF}
              >
                <MdPictureAsPdf />
                Download PDF
              </button>

            </div>

          </div>

          <div className="report-output-content markdown-content">

            <ReactMarkdown>
              {typeof report === 'string'
                ? report
                : JSON.stringify(report, null, 2)}
            </ReactMarkdown>

          </div>

        </div>
      )}

    </div>
  );
};

export default ReportGenerator;