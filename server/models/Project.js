const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  club: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Education',
      'Health',
      'Environment',
      'Community Development',
      'Women Empowerment',
      'Rural Development',
      'Technology',
      'Cultural',
      'Sports',
      'Other'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Project date is required']
  },
  location: {
    type: String,
    trim: true
  },
  photos: {
    type: [String],
    default: []
  },
  beneficiaries: {
    type: Number,
    default: 0
  },
  volunteers: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    trim: true
  },
  fundingAmount: {
    type: Number,
    default: 0
  },
  sdgGoals: {
    type: [Number],
    validate: {
      validator: function (arr) {
        return arr.every(v => v >= 1 && v <= 17);
      },
      message: 'SDG Goals must be numbers between 1 and 17'
    }
  },
  impactMetrics: {
    peopleReached: { type: Number, default: 0 },
    fundsUtilized: { type: Number, default: 0 },
    feedbackScore: {
      type: Number,
      min: [1, 'Feedback score must be at least 1'],
      max: [5, 'Feedback score must be at most 5']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
