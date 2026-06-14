import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProjects, generateSocialMedia } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MdShare, MdContentCopy, MdRefresh } from 'react-icons/md';
import { FaInstagram, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import './SocialMediaCreator.css';

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
      setContent(data);
      toast.success('Social media content created! 🎨');
    } catch {
      // Demo content
      const project = projects.find(p => (p._id || p.id) === selectedProject);
      setContent({
        instagram: `🌟 Impact Alert! 🌟\n\n${project?.title || 'Our Project'} reached ${project?.beneficiaries || '500'}+ people in our community!\n\n💡 Together, we're making a difference one step at a time.\n\n#SocialImpact #SDGs #Community #MakingADifference #${project?.category || 'Impact'}`,
        twitter: `🚀 Proud to share: ${project?.title || 'Our latest project'} has positively impacted ${project?.beneficiaries || '500'}+ lives!\n\nSmall actions, big changes. 🌍\n\n#SocialImpact #SDGs #Community`,
        linkedin: `I'm thrilled to share the results of our recent initiative: "${project?.title || 'Our Project'}"\n\n📊 Key Highlights:\n• ${project?.beneficiaries || '500'}+ beneficiaries reached\n• ${project?.volunteers || '50'}+ dedicated volunteers\n• Contributing to UN SDG goals\n\nThis project demonstrates the power of collective action in driving meaningful social change.\n\n#SocialImpact #CommunityDevelopment #SDGs #Leadership`,
      });
      toast.success('Demo content generated! 🎨');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, platform) => {
    navigator.clipboard.writeText(text);
    toast.success(`${platform} content copied!`);
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

      {/* Loading */}
      {loading && (
        <div className="page-loading" style={{ minHeight: '30vh' }}>
          <LoadingSpinner size="lg" text="Creating social media content..." />
        </div>
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
