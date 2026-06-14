import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { createProject } from '../services/api';
import { sdgGoals } from '../utils/sdgData';
import toast from 'react-hot-toast';
import {
  MdArrowForward, MdArrowBack, MdCloudUpload, MdClose,
  MdCheck, MdInfo, MdPhoto, MdBarChart, MdPublic, MdRateReview
} from 'react-icons/md';
import './ProjectUpload.css';

const steps = [
  { label: 'Basic Info', icon: MdInfo },
  { label: 'Photos', icon: MdPhoto },
  { label: 'Impact Data', icon: MdBarChart },
  { label: 'SDG Goals', icon: MdPublic },
  { label: 'Review', icon: MdRateReview },
];

const categories = ['Education', 'Health', 'Environment', 'Community', 'Technology', 'Arts', 'Sports', 'Other'];

const ProjectUpload = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    club: '',
    category: '',
    date: '',
    location: '',
    beneficiaries: '',
    volunteers: '',
    duration: '',
    funding: '',
    sdgGoals: [],
  });
  const [photos, setPhotos] = useState([]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleSDG = (num) => {
    setFormData(prev => ({
      ...prev,
      sdgGoals: prev.sdgGoals.includes(num)
        ? prev.sdgGoals.filter(n => n !== num)
        : [...prev.sdgGoals, num],
    }));
  };

  // Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const newPhotos = acceptedFiles.map(file =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
  });

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('club', formData.club);
      fd.append('category', formData.category);
      fd.append('date', formData.date);
      fd.append('location', formData.location);
      fd.append('beneficiaries', formData.beneficiaries);
      fd.append('volunteers', formData.volunteers);
      fd.append('duration', formData.duration);
      fd.append('funding', formData.funding);
      formData.sdgGoals.forEach(g => fd.append('sdgGoals', g));
      photos.forEach(photo => fd.append('photos', photo));

      await createProject(fd);
      toast.success('Project created successfully! 🎉');
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return formData.title && formData.description && formData.category;
    return true;
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1 className="page-title">Create New Project</h1>
        <p className="page-subtitle">Document your social impact project</p>
      </div>

      {/* Progress Steps */}
      <div className="stepper">
        {steps.map((step, i) => (
          <div key={i} className={`step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}>
            <div className="step-circle" onClick={() => i < currentStep && setCurrentStep(i)}>
              {i < currentStep ? <MdCheck /> : <step.icon />}
            </div>
            <span className="step-label">{step.label}</span>
            {i < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="step-content">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="form-step" key="step-0">
            <h2 className="step-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your project title"
                  required
                />
              </div>
              <div className="form-field full-width">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the project, its goals, and outcomes..."
                  rows={5}
                  required
                />
              </div>
              <div className="form-field">
                <label>Club / Organization</label>
                <input
                  type="text"
                  name="club"
                  value={formData.club}
                  onChange={handleChange}
                  placeholder="e.g. Eco Warriors"
                />
              </div>
              <div className="form-field">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, India"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photos */}
        {currentStep === 1 && (
          <div className="form-step" key="step-1">
            <h2 className="step-title">Project Photos</h2>
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
            >
              <input {...getInputProps()} />
              <MdCloudUpload className="dropzone-icon" />
              <p className="dropzone-text">
                {isDragActive ? 'Drop images here...' : 'Drag & drop images here, or click to browse'}
              </p>
              <p className="dropzone-hint">JPEG, PNG, WebP — max 10 images, 10MB each</p>
            </div>

            {photos.length > 0 && (
              <div className="photo-previews">
                {photos.map((file, i) => (
                  <div key={i} className="photo-preview">
                    <img src={file.preview} alt={`Preview ${i + 1}`} />
                    <button className="photo-remove" onClick={() => removePhoto(i)}>
                      <MdClose />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Impact Data */}
        {currentStep === 2 && (
          <div className="form-step" key="step-2">
            <h2 className="step-title">Impact Data</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Beneficiaries</label>
                <input
                  type="number"
                  name="beneficiaries"
                  value={formData.beneficiaries}
                  onChange={handleChange}
                  placeholder="Number of people impacted"
                  min="0"
                />
              </div>
              <div className="form-field">
                <label>Volunteers</label>
                <input
                  type="number"
                  name="volunteers"
                  value={formData.volunteers}
                  onChange={handleChange}
                  placeholder="Number of volunteers"
                  min="0"
                />
              </div>
              <div className="form-field">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 days, 2 weeks"
                />
              </div>
              <div className="form-field">
                <label>Funding Amount (₹)</label>
                <input
                  type="number"
                  name="funding"
                  value={formData.funding}
                  onChange={handleChange}
                  placeholder="Budget in INR"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: SDG Goals */}
        {currentStep === 3 && (
          <div className="form-step" key="step-3">
            <h2 className="step-title">UN Sustainable Development Goals</h2>
            <p className="step-description">Select the SDGs that your project contributes to</p>
            <div className="sdg-grid">
              {sdgGoals.map(sdg => (
                <button
                  key={sdg.number}
                  className={`sdg-card ${formData.sdgGoals.includes(sdg.number) ? 'selected' : ''}`}
                  style={{ '--sdg-color': sdg.color }}
                  onClick={() => toggleSDG(sdg.number)}
                  type="button"
                >
                  <div className="sdg-card-number" style={{ background: sdg.color }}>
                    {sdg.number}
                  </div>
                  <span className="sdg-card-name">{sdg.name}</span>
                  {formData.sdgGoals.includes(sdg.number) && (
                    <MdCheck className="sdg-card-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <div className="form-step" key="step-4">
            <h2 className="step-title">Review & Submit</h2>
            <div className="review-card">
              <div className="review-section">
                <h4>Basic Information</h4>
                <div className="review-grid">
                  <div><span>Title:</span> {formData.title}</div>
                  <div><span>Club:</span> {formData.club || 'Not specified'}</div>
                  <div><span>Category:</span> {formData.category}</div>
                  <div><span>Date:</span> {formData.date || 'Not specified'}</div>
                  <div><span>Location:</span> {formData.location || 'Not specified'}</div>
                </div>
                <div className="review-description">
                  <span>Description:</span>
                  <p>{formData.description}</p>
                </div>
              </div>

              <div className="review-section">
                <h4>Impact Data</h4>
                <div className="review-grid">
                  <div><span>Beneficiaries:</span> {formData.beneficiaries || 'N/A'}</div>
                  <div><span>Volunteers:</span> {formData.volunteers || 'N/A'}</div>
                  <div><span>Duration:</span> {formData.duration || 'N/A'}</div>
                  <div><span>Funding:</span> {formData.funding ? `₹${Number(formData.funding).toLocaleString()}` : 'N/A'}</div>
                </div>
              </div>

              <div className="review-section">
                <h4>Photos</h4>
                <p>{photos.length} photo(s) attached</p>
              </div>

              <div className="review-section">
                <h4>SDG Goals</h4>
                <div className="review-sdgs">
                  {formData.sdgGoals.length > 0
                    ? formData.sdgGoals.map(num => {
                        const sdg = sdgGoals.find(s => s.number === num);
                        return (
                          <span key={num} className="review-sdg-badge" style={{ background: sdg?.color }}>
                            SDG {num}
                          </span>
                        );
                      })
                    : <p className="text-muted">No SDGs selected</p>
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="step-nav">
        {currentStep > 0 && (
          <button className="btn-outline" onClick={prevStep}>
            <MdArrowBack /> Previous
          </button>
        )}
        <div style={{ flex: 1 }} />
        {currentStep < steps.length - 1 ? (
          <button className="btn-primary" onClick={nextStep} disabled={!canProceed()}>
            Next <MdArrowForward />
          </button>
        ) : (
          <button className="btn-primary btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <span className="btn-loader" /> : 'Submit Project'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectUpload;
