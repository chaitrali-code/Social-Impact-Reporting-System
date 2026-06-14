import { useNavigate } from 'react-router-dom';
import SDGBadge from './SDGBadge';
import { MdPeople, MdCalendarToday, MdLocationOn } from 'react-icons/md';
import './ProjectCard.css';

const ProjectCard = ({ project, delay = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project._id || project.id}`);
  };

  const thumbnail = project.photos?.[0]
    ? (project.photos[0].startsWith('http') ? project.photos[0] : `/api/${project.photos[0]}`)
    : null;

  const sdgGoals = project.sdgGoals || project.sdgs || [];
  const formattedDate = project.date
    ? new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div
      className="project-card"
      onClick={handleClick}
      style={{ animationDelay: `${delay}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className="project-card-image">
        {thumbnail ? (
          <img src={thumbnail} alt={project.title} loading="lazy" />
        ) : (
          <div className="project-card-placeholder">
            <span>📋</span>
          </div>
        )}
        {project.category && (
          <span className="project-card-category">{project.category}</span>
        )}
      </div>

      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-club">{project.club || project.clubName || 'Community Project'}</p>

        <div className="project-card-meta">
          {formattedDate && (
            <span className="meta-item">
              <MdCalendarToday />
              {formattedDate}
            </span>
          )}
          {project.location && (
            <span className="meta-item">
              <MdLocationOn />
              {project.location}
            </span>
          )}
        </div>

        <div className="project-card-footer">
          <div className="project-card-sdgs">
            {sdgGoals.slice(0, 4).map(num => (
              <SDGBadge key={num} number={num} size="sm" />
            ))}
            {sdgGoals.length > 4 && (
              <span className="sdg-more">+{sdgGoals.length - 4}</span>
            )}
          </div>
          {(project.beneficiaries || project.beneficiaries === 0) && (
            <span className="project-card-beneficiaries">
              <MdPeople />
              {project.beneficiaries?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
