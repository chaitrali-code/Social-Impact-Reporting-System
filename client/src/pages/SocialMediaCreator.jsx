import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProjects, generateSocialMedia } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MdShare, MdContentCopy, MdRefresh } from 'react-icons/md';
import { FaInstagram, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import './SocialMediaCreator.css';
import jsPDF from 'jspdf';
import { FaWhatsapp } from 'react-icons/fa';

const SocialMediaCreator = () => {
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(preselectedProject || '');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
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
  setContent(null);

  try {
    const { data } = await generateSocialMedia(selectedProject);

    console.log('Social Media API Response:', data);

    const captions =
      data?.captions ||
      data?.content ||
      data?.socialMediaCaptions ||
      {};

    setContent({
      instagram: captions.instagram || '',
      twitter: captions.twitter || '',
      linkedin: captions.linkedin || '',
      whatsapp: captions.whatsapp || ''
    });

    toast.success('Social media content generated! 🎨');
  } catch (error) {
    console.error(error);

    const project = projects.find(
      p => (p._id || p.id) === selectedProject
    );

    setContent({
      instagram: `🌟 ${project?.title || 'Community Project'}

${project?.description || ''}

#SocialImpact #Rotaract #CommunityService`,

      twitter: `${project?.title || 'Community Project'} | ${
        project?.description || ''
      }`,

      linkedin: `${project?.title || 'Community Project'}

${project?.description || ''}

Impact:
• Beneficiaries: ${project?.beneficiaries || 0}
• Volunteers: ${project?.volunteers || 0}

#SocialImpact #CommunityDevelopment`,

      whatsapp: `*${project?.title || 'Community Project'}*

${project?.description || ''}

👥 Beneficiaries: ${project?.beneficiaries || 0}
🙌 Volunteers: ${project?.volunteers || 0}`
    });

    toast.success('Fallback content generated!');
  } finally {
    setLoading(false);
  }
};
  const copyToClipboard = (text, platform) => {
    navigator.clipboard.writeText(text);
    toast.success(`${platform} content copied!`);
  };

  const downloadKit = () => {
  if (!content) return;

  const doc = new jsPDF();

  let y = 15;

  doc.setFontSize(18);
  doc.text('Social Media Content Kit', 10, y);

  y += 15;

  const addSection = (title, text) => {
    doc.setFontSize(14);
    doc.text(title, 10, y);

    y += 8;

    doc.setFontSize(11);

    const lines = doc.splitTextToSize(text || '', 180);

    doc.text(lines, 10, y);

    y += lines.length * 6 + 15;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  };

  addSection('Instagram', content.instagram);
  addSection('Twitter/X', content.twitter);
  addSection('LinkedIn', content.linkedin);

  if (content.whatsapp) {
    addSection('WhatsApp', content.whatsapp);
  }

  doc.save('social-media-kit.pdf');
};

const shareWhatsApp = () => {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(
      content.whatsapp || content.instagram
    )}`
  );
};

  return (
    <div className="social-page">
      <div className="social-page-header">
        <h1 className="page-title">Social Media Creator</h1>
        <p className="page-subtitle">Generate engaging social media posts from your projects</p>
      </div>

      {/* Controls */}
      <div className="social-controls">
        <div className="social-select-group">
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

        <div className="social-actions">
          <button className="btn-generate" onClick={handleGenerate} disabled={loading || !selectedProject}>
            {loading ? <><span className="btn-loader" /> Generating...</> : <><MdShare /> Generate Content</>}
          </button>
          {content && (
            <button className="btn-regenerate" onClick={handleGenerate} disabled={loading}>
              <MdRefresh /> Regenerate
            </button>
          )}
        </div>
      </div>

      {content && !loading && (
  <>
    <div
      style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}
    >
      <button
        className="btn-regenerate"
        onClick={downloadKit}
      >
        Download PDF
      </button>

      <button
        className="btn-regenerate"
        onClick={shareWhatsApp}
      >
        Share on WhatsApp
      </button>
    </div>

    <div className="social-cards">

      {/* Instagram */}
      <div className="social-card instagram-card">
        <div className="social-card-header">
          <FaInstagram className="social-platform-icon" />

          <span className="social-platform-name">
            Instagram
          </span>

          <span className="char-count">
            {content.instagram?.length || 0}/2200
          </span>

          <button
            className="copy-btn"
            onClick={() =>
              copyToClipboard(
                content.instagram,
                'Instagram'
              )
            }
          >
            <MdContentCopy /> Copy
          </button>
        </div>

        <div className="social-card-content">
          <pre className="social-text">
            {content.instagram}
          </pre>
        </div>
      </div>

      {/* Twitter */}
      <div className="social-card twitter-card">
        <div className="social-card-header">
          <FaXTwitter className="social-platform-icon" />

          <span className="social-platform-name">
            X (Twitter)
          </span>

          <span className="char-count">
            {content.twitter?.length || 0}/280
          </span>

          <button
            className="copy-btn"
            onClick={() =>
              copyToClipboard(
                content.twitter,
                'Twitter'
              )
            }
          >
            <MdContentCopy /> Copy
          </button>
        </div>

        <div className="social-card-content">
          <pre className="social-text">
            {content.twitter}
          </pre>
        </div>
      </div>

      {/* LinkedIn */}
      <div className="social-card linkedin-card">
        <div className="social-card-header">
          <FaLinkedin className="social-platform-icon" />

          <span className="social-platform-name">
            LinkedIn
          </span>

          <span className="char-count">
            {content.linkedin?.length || 0}/3000
          </span>

          <button
            className="copy-btn"
            onClick={() =>
              copyToClipboard(
                content.linkedin,
                'LinkedIn'
              )
            }
          >
            <MdContentCopy /> Copy
          </button>
        </div>

        <div className="social-card-content">
          <pre className="social-text">
            {content.linkedin}
          </pre>
        </div>
      </div>

      {/* WhatsApp */}
      {content.whatsapp && (
        <div className="social-card whatsapp-card">
          <div className="social-card-header">
            <FaWhatsapp className="social-platform-icon" />

            <span className="social-platform-name">
              WhatsApp
            </span>

            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(
                  content.whatsapp,
                  'WhatsApp'
                )
              }
            >
              <MdContentCopy /> Copy
            </button>
          </div>

          <div className="social-card-content">
            <pre className="social-text">
              {content.whatsapp}
            </pre>
          </div>
        </div>
      )}

    </div>
  </>
)}

      {/* Social Media Cards */}
      {content && !loading && (
        <div className="social-cards">
          {/* Instagram */}
          <div className="social-card instagram-card">
            <div className="social-card-header">
              <FaInstagram className="social-platform-icon" />
              <span className="social-platform-name">Instagram</span>
              <button className="copy-btn" onClick={() => copyToClipboard(content.instagram, 'Instagram')}>
                <MdContentCopy /> Copy
              </button>
            </div>
            <div className="social-card-content">
              <pre className="social-text">{content.instagram}</pre>
            </div>
          </div>

          {/* Twitter/X */}
          <div className="social-card twitter-card">
            <div className="social-card-header">
              <FaXTwitter className="social-platform-icon" />
              <span className="social-platform-name">X (Twitter)</span>
              <span className="char-count">{content.twitter?.length || 0}/280</span>
              <button className="copy-btn" onClick={() => copyToClipboard(content.twitter, 'Twitter')}>
                <MdContentCopy /> Copy
              </button>
            </div>
            <div className="social-card-content">
              <pre className="social-text">{content.twitter}</pre>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="social-card linkedin-card">
            <div className="social-card-header">
              <FaLinkedin className="social-platform-icon" />
              <span className="social-platform-name">LinkedIn</span>
              <button className="copy-btn" onClick={() => copyToClipboard(content.linkedin, 'LinkedIn')}>
                <MdContentCopy /> Copy
              </button>
            </div>
            <div className="social-card-content">
              <pre className="social-text">{content.linkedin}</pre>
            </div>
          </div>

          
        </div>
      )}
    </div>
  );
};

export default SocialMediaCreator;
