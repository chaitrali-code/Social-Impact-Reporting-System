import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-core"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
