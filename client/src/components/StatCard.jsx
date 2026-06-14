import './StatCard.css';

const StatCard = ({ icon: Icon, label, value, subtitle, gradient = 'purple', delay = 0 }) => {
  return (
    <div className={`stat-card stat-${gradient}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-glow" />
      <div className="stat-card-content">
        <div className="stat-card-header">
          <div className={`stat-card-icon icon-${gradient}`}>
            {Icon && <Icon />}
          </div>
          {subtitle && (
            <span className="stat-card-trend">{subtitle}</span>
          )}
        </div>
        <div className="stat-card-body">
          <p className="stat-card-value">{value}</p>
          <p className="stat-card-label">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
