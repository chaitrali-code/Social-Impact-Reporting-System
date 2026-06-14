const express = require('express');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');
const geminiService = require('../services/geminiService');

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * POST /api/ai/generate-report/:projectId
 * Generate an AI-powered impact report for a project
 */
router.post('/generate-report/:projectId', async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Generate the report content via Gemini
  const generatedContent = await geminiService.generateReport(project);

  // Save or update the report document
  let report = await Report.findOne({ project: project._id });

  if (report) {
    report.generatedContent = generatedContent;
    report.generatedAt = new Date();
    report.createdBy = req.user._id;
    await report.save();
  } else {
    report = await Report.create({
      project: project._id,
      generatedContent,
      createdBy: req.user._id
    });
  }

  res.status(200).json({
    success: true,
    report
  });
});

/**
 * POST /api/ai/estimate-attendance
 * Estimate attendance from an uploaded image
 */
router.post('/estimate-attendance', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  // Read the uploaded file and convert to base64
  const filePath = req.file.path;
  const imageBuffer = fs.readFileSync(filePath);
  const imageBase64 = imageBuffer.toString('base64');
  const mimeType = req.file.mimetype;

  // Estimate attendance via Gemini
  const estimatedAttendance = await geminiService.estimateAttendance(imageBase64, mimeType);

  res.status(200).json({
    success: true,
    estimatedAttendance,
    imagePath: `/uploads/${req.file.filename}`
  });
});

/**
 * POST /api/ai/social-media/:projectId
 * Generate social media captions for a project
 */
router.post('/social-media/:projectId', async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Generate social media captions via Gemini
  const captions = await geminiService.generateSocialMedia(project);

  // Optionally save to an existing or new Report document
  let report = await Report.findOne({ project: project._id });

  if (report) {
    report.socialMediaCaptions = captions;
    report.generatedAt = new Date();
    report.createdBy = req.user._id;
    await report.save();
  } else {
    report = await Report.create({
      project: project._id,
      socialMediaCaptions: captions,
      createdBy: req.user._id
    });
  }

  res.status(200).json({
    success: true,
    captions,
    reportId: report._id
  });
});

/**
 * POST /api/ai/sdg-mapping/:projectId
 * Analyze SDG alignment for a project
 */
router.post('/sdg-mapping/:projectId', async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Analyze SDG alignment via Gemini
  const analysis = await geminiService.analyzeSDGAlignment(project);

  // Optionally save to an existing or new Report document
  let report = await Report.findOne({ project: project._id });

  if (report) {
    report.sdgAnalysis = analysis;
    report.generatedAt = new Date();
    report.createdBy = req.user._id;
    await report.save();
  } else {
    report = await Report.create({
      project: project._id,
      sdgAnalysis: analysis,
      createdBy: req.user._id
    });
  }

  res.status(200).json({
    success: true,
    analysis,
    reportId: report._id
  });
});

module.exports = router;
