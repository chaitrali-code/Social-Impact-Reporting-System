import { sdgGoals } from '../utils/sdgData';
import './SDGBadge.css';

const SDGBadge = ({ number, size = 'sm', showName = false }) => {
  const sdg = sdgGoals.find(s => s.number === number);
  if (!sdg) return null;

  return (
    <span
      className={`sdg-badge sdg-badge-${size}`}
      style={{ '--sdg-color': sdg.color }}
      title={`SDG ${sdg.number}: ${sdg.name}`}
    >
      <span className="sdg-badge-number">{sdg.number}</span>
      {showName && <span className="sdg-badge-name">{sdg.name}</span>}
    </span>
  );
};

export default SDGBadge;
