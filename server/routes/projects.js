const express = require('express');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * POST /api/projects
 * Create a new project with optional photo uploads
 */
router.post('/', upload.array('photos', 10), async (req, res) => {
  const {
    title,
    description,
    club,
    category,
    date,
    location,
    beneficiaries,
    volunteers,
    duration,
    fundingAmount,
    sdgGoals,
    impactMetrics,
    status
  } = req.body;

  // Build photo paths from uploaded files
  const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  // Parse sdgGoals if it comes as a JSON string
  let parsedSdgGoals = sdgGoals;
  if (typeof sdgGoals === 'string') {
    try {
      parsedSdgGoals = JSON.parse(sdgGoals);
    } catch (e) {
      parsedSdgGoals = sdgGoals.split(',').map(Number).filter(n => !isNaN(n));
    }
  }

  // Parse impactMetrics if it comes as a JSON string
  let parsedImpactMetrics = impactMetrics;
  if (typeof impactMetrics === 'string') {
    try {
      parsedImpactMetrics = JSON.parse(impactMetrics);
    } catch (e) {
      parsedImpactMetrics = {};
    }
  }

  const project = await Project.create({
    title,
    description,
    club,
    category,
    date,
    location,
    photos,
    beneficiaries: beneficiaries ? Number(beneficiaries) : 0,
    volunteers: volunteers ? Number(volunteers) : 0,
    duration,
    fundingAmount: fundingAmount ? Number(fundingAmount) : 0,
    sdgGoals: parsedSdgGoals || [],
    impactMetrics: parsedImpactMetrics || {},
    status: status || 'draft',
    createdBy: req.user._id
  });

  const populated = await Project.findById(project._id).populate('createdBy', 'name club');

  res.status(201).json({
    success: true,
    project: populated
  });
});

/**
 * GET /api/projects
 * List projects with optional filtering
 * Query params: ?club=, ?category=, ?status=, ?sdg=, ?search=
 */
router.get('/', async (req, res) => {
  const { club, category, status, sdg, search } = req.query;
  const filter = {};

  if (club) {
    filter.club = club;
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (sdg) {
    // sdg can be a single number or comma-separated
    const sdgNumbers = String(sdg).split(',').map(Number).filter(n => !isNaN(n));
    if (sdgNumbers.length > 0) {
      filter.sdgGoals = { $in: sdgNumbers };
    }
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const projects = await Project.find(filter)
    .populate('createdBy', 'name club')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    projects
  });
});

/**
 * GET /api/projects/:id
 * Get a single project by ID
 */
router.get('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id).populate('createdBy', 'name club email');

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  res.status(200).json({
    success: true,
    project
  });
});

/**
 * PUT /api/projects/:id
 * Update a project — only creator or admin can update
 */
router.put('/:id', upload.array('photos', 10), async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Authorization: only the creator or admin can update
  if (
    project.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this project'
    });
  }

  // Build update data
  const updateData = { ...req.body };

  // Handle new photo uploads — append to existing photos
  if (req.files && req.files.length > 0) {
    const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
    updateData.photos = [...(project.photos || []), ...newPhotos];
  }

  // Parse sdgGoals if it comes as a JSON string
  if (updateData.sdgGoals && typeof updateData.sdgGoals === 'string') {
    try {
      updateData.sdgGoals = JSON.parse(updateData.sdgGoals);
    } catch (e) {
      updateData.sdgGoals = updateData.sdgGoals.split(',').map(Number).filter(n => !isNaN(n));
    }
  }

  // Parse impactMetrics if it comes as a JSON string
  if (updateData.impactMetrics && typeof updateData.impactMetrics === 'string') {
    try {
      updateData.impactMetrics = JSON.parse(updateData.impactMetrics);
    } catch (e) {
      // Keep existing impactMetrics if parse fails
      delete updateData.impactMetrics;
    }
  }

  // Convert numeric fields
  if (updateData.beneficiaries) updateData.beneficiaries = Number(updateData.beneficiaries);
  if (updateData.volunteers) updateData.volunteers = Number(updateData.volunteers);
  if (updateData.fundingAmount) updateData.fundingAmount = Number(updateData.fundingAmount);

  project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'name club');

  res.status(200).json({
    success: true,
    project
  });
});

/**
 * DELETE /api/projects/:id
 * Delete a project — only creator or admin can delete
 */
router.delete('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Authorization: only the creator or admin can delete
  if (
    project.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this project'
    });
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

module.exports = router;
