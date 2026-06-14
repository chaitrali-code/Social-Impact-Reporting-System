import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSDGDistribution, getProjects, getSDGMapping } from '../services/api';
import { sdgGoals } from '../utils/sdgData';
import SDGBadge from '../components/SDGBadge';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MdAutoAwesome, MdFilterList } from 'react-icons/md';
import './SDGMapping.css';

const SDGMapping = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProject = searchParams.get('project');
  const [sdgCounts, setSdgCounts] = useState({});
  const [selectedSDG, setSelectedSDG] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distRes, projRes] = await Promise.allSettled([
          getSDGDistribution(),
          getProjects(),
        ]);

        if (distRes.status === 'fulfilled') {
          const dist = distRes.value.data;
          const counts = {};
          if (Array.isArray(dist)) {
            dist.forEach(d => { counts[d.sdg || d.number] = d.count; });
          }
          setSdgCounts(counts);
        }

        if (projRes.status === 'fulfilled') {
          setProjects(projRes.value.data.projects || projRes.value.data || []);
        }
      } catch {
        // Demo data
        const demoCounts = {};
        sdgGoals.forEach(s => { demoCounts[s.number] = Math.floor(Math.random() * 12); });
        setSdgCounts(demoCounts);
        setProjects([
          { _id: '1', title: 'Beach Cleanup Drive', club: 'Eco Warriors', category: 'Environment', sdgGoals: [14, 15, 13], beneficiaries: 500, photos: [] },
          { _id: '2', title: 'Code for Good Hackathon', club: 'Tech Club', category: 'Education', sdgGoals: [4, 9, 17], beneficiaries: 200, photos: [] },
          { _id: '3', title: 'Blood Donation Camp', club: 'Health Society', category: 'Health', sdgGoals: [3], beneficiaries: 350, photos: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSDG) {
      const filtered = projects.filter(p => {
        const sdgs = p.sdgGoals || p.sdgs || [];
        return sdgs.includes(selectedSDG);
      });
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [selectedSDG, projects]);

  const handleSDGClick = (num) => {
    setSelectedSDG(prev => prev === num ? null : num);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!preselectedProject) {
      toast.error('Select a project from the Projects page first');
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await getSDGMapping(preselectedProject);
      setAnalysis(data);
      toast.success('SDG analysis complete! ✨');
    } catch {
      toast.error('SDG analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><LoadingSpinner size="lg" text="Loading SDG data..." /></div>;
  }

  return (
    <div className="sdg-page">
      <div className="sdg-page-header">
        <div>
          <h1 className="page-title">SDG Mapping</h1>
          <p className="page-subtitle">Visualize how your projects align with UN Sustainable Development Goals</p>
        </div>
        {preselectedProject && (
          <button className="btn-primary" onClick={handleAnalyze} disabled={analyzing}>
            <MdAutoAwesome />
            {analyzing ? 'Analyzing...' : 'Analyze SDG Alignment'}
          </button>
        )}
      </div>

      {/* SDG Grid */}
      <div className="sdg-map-grid">
        {sdgGoals.map(sdg => {
          const count = sdgCounts[sdg.number] || 0;
          const isSelected = selectedSDG === sdg.number;
          return (
            <button
              key={sdg.number}
              className={`sdg-map-card ${isSelected ? 'selected' : ''}`}
              style={{ '--sdg-color': sdg.color }}
              onClick={() => handleSDGClick(sdg.number)}
            >
              <div className="sdg-map-number" style={{ background: sdg.color }}>
                {sdg.number}
              </div>
              <div className="sdg-map-info">
                <span className="sdg-map-name">{sdg.name}</span>
                <span className="sdg-map-count">{count} project{count !== 1 ? 's' : ''}</span>
              </div>
              {isSelected && <MdFilterList className="sdg-map-filter-icon" />}
            </button>
          );
        })}
      </div>

      {/* Filtered Projects */}
      {selectedSDG && (
        <div className="sdg-filtered-section">
          <h2 className="section-title">
            Projects contributing to SDG {selectedSDG}: {sdgGoals.find(s => s.number === selectedSDG)?.name}
          </h2>
          {filteredProjects.length > 0 ? (
            <div className="projects-grid">
              {filteredProjects.map((project, i) => (
                <ProjectCard key={project._id || i} project={project} delay={i * 80} />
              ))}
            </div>
          ) : (
            <p className="no-results">No projects found for this SDG.</p>
          )}
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="analysis-card">
          <h3><MdAutoAwesome /> AI SDG Analysis</h3>
          <div className="analysis-content">
            {typeof analysis === 'string' ? (
              <p>{analysis}</p>
            ) : (
              <pre>{JSON.stringify(analysis, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SDGMapping;
