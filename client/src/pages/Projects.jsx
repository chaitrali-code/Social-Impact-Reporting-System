import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { MdSearch, MdFilterList, MdAdd, MdFolderOff } from 'react-icons/md';
import './Projects.css';

const categories = ['All', 'Education', 'Health', 'Environment', 'Community', 'Technology', 'Arts', 'Sports'];

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sdgFilter, setSdgFilter] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        if (sdgFilter) params.sdg = sdgFilter;
        const { data } = await getProjects(params);
        setProjects(data.projects || data || []);
      } catch {
        // Use demo data
        setProjects([
          { _id: '1', title: 'Beach Cleanup Drive', club: 'Eco Warriors', category: 'Environment', date: '2025-06-01', beneficiaries: 500, sdgGoals: [14, 15, 13], photos: [] },
          { _id: '2', title: 'Code for Good Hackathon', club: 'Tech Club', category: 'Education', date: '2025-05-15', beneficiaries: 200, sdgGoals: [4, 9, 17], photos: [] },
          { _id: '3', title: 'Blood Donation Camp', club: 'Health Society', category: 'Health', date: '2025-04-20', beneficiaries: 350, sdgGoals: [3], photos: [] },
          { _id: '4', title: 'Tree Plantation Drive', club: 'Green Earth', category: 'Environment', date: '2025-03-10', beneficiaries: 800, sdgGoals: [13, 15], photos: [] },
          { _id: '5', title: 'Women Empowerment Workshop', club: 'Social Club', category: 'Community', date: '2025-02-14', beneficiaries: 150, sdgGoals: [5, 10, 4], photos: [] },
          { _id: '6', title: 'Digital Literacy Camp', club: 'Tech Club', category: 'Technology', date: '2025-01-20', beneficiaries: 120, sdgGoals: [4, 9], photos: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [search, category, sdgFilter]);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return <div className="page-loading"><LoadingSpinner size="lg" text="Loading projects..." /></div>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Browse and manage all social impact projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="search-box">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <MdFilterList />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select value={sdgFilter} onChange={e => setSdgFilter(e.target.value)}>
            <option value="">All SDGs</option>
            {Array.from({ length: 17 }, (_, i) => (
              <option key={i + 1} value={i + 1}>SDG {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="projects-grid">
          {filtered.map((project, i) => (
            <ProjectCard key={project._id || i} project={project} delay={i * 80} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <MdFolderOff className="empty-icon" />
          <h3>No projects found</h3>
          <p>Try adjusting your search or filters, or create a new project.</p>
          <button className="btn-primary" onClick={() => navigate('/projects/new')}>
            <MdAdd /> Create Project
          </button>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/projects/new')} title="Add New Project">
        <MdAdd />
      </button>
    </div>
  );
};

export default Projects;
