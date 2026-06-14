const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  generatedContent: {
    type: String,
    default: ''
  },
  socialMediaCaptions: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  estimatedAttendance: {
    type: Number,
    default: 0
  },
  sdgAnalysis: {
    type: String,
    default: ''
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
