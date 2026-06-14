const express = require('express');
const Project = require('../models/Project');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * GET /api/analytics/dashboard
 * Aggregate dashboard stats
 */
router.get('/dashboard', async (req, res) => {
  // Total projects
  const totalProjects = await Project.countDocuments();

  // Total beneficiaries and volunteers
  const impactAgg = await Project.aggregate([
    {
      $group: {
        _id: null,
        totalBeneficiaries: { $sum: '$beneficiaries' },
        totalVolunteers: { $sum: '$volunteers' }
      }
    }
  ]);

  const totalBeneficiaries = impactAgg.length > 0 ? impactAgg[0].totalBeneficiaries : 0;
  const totalVolunteers = impactAgg.length > 0 ? impactAgg[0].totalVolunteers : 0;

  // Total distinct clubs
  const clubs = await Project.distinct('club');
  const totalClubs = clubs.length;

  // Distinct SDGs covered
  const sdgs = await Project.distinct('sdgGoals');
  const sdgsCovered = sdgs.length;

  // Total reports generated
  const totalReports = await Report.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      totalBeneficiaries,
      totalVolunteers,
      totalClubs,
      sdgsCovered,
      totalReports
    }
  });
});

/**
 * GET /api/analytics/sdg-distribution
 * Group projects by SDG goals, count per SDG
 */
router.get('/sdg-distribution', async (req, res) => {
  const distribution = await Project.aggregate([
    { $unwind: '$sdgGoals' },
    {
      $group: {
        _id: '$sdgGoals',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        sdg: '$_id',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: distribution
  });
});

/**
 * GET /api/analytics/club-impact
 * Group by club with sum of beneficiaries, volunteers, and project count
 */
router.get('/club-impact', async (req, res) => {
  const clubImpact = await Project.aggregate([
    {
      $group: {
        _id: '$club',
        totalBeneficiaries: { $sum: '$beneficiaries' },
        totalVolunteers: { $sum: '$volunteers' },
        projectCount: { $sum: 1 }
      }
    },
    { $sort: { projectCount: -1 } },
    {
      $project: {
        _id: 0,
        club: '$_id',
        totalBeneficiaries: 1,
        totalVolunteers: 1,
        projectCount: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: clubImpact
  });
});

/**
 * GET /api/analytics/timeline
 * Group projects by month/year, return counts per period
 */
router.get('/timeline', async (req, res) => {
  const timeline = await Project.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        count: { $sum: 1 },
        totalBeneficiaries: { $sum: '$beneficiaries' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
        totalBeneficiaries: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: timeline
  });
});

/**
 * GET /api/analytics/category-distribution
 * Group projects by category, return counts
 */
router.get('/category-distribution', async (req, res) => {
  const categories = await Project.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: categories
  });
});

module.exports = router;
