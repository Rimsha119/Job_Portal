const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET /jobs/company/my-jobs — Company only: list their own jobs
router.get('/company/my-jobs', protect, restrictTo('company'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your jobs.', error: error.message });
  }
});

// GET /jobs/company/summary — Company only: jobs plus their applications
router.get('/company/summary', protect, restrictTo('company'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } }).sort({ appliedAt: -1 }).lean();

    const applicationCounts = applications.reduce((acc, app) => {
      const jobId = app.jobId.toString();
      acc[jobId] = (acc[jobId] || 0) + 1;
      return acc;
    }, {});

    const jobsWithCounts = jobs.map(job => ({
      ...job,
      applicationsCount: applicationCounts[job._id.toString()] || 0,
    }));

    res.json({ jobs: jobsWithCounts, applications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company summary.', error: error.message });
  }
});

// GET /jobs — Public list with optional query filters
router.get('/', async (req, res) => {
  try {
    const { location, type, minSalary, maxSalary, search } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = Number(minSalary);
      if (maxSalary) filter.salary.$lte = Number(maxSalary);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs.', error: error.message });
  }
});

// GET /jobs/:id — Public single job detail
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job.', error: error.message });
  }
});

// POST /jobs — Company only: create a job
router.post('/', protect, restrictTo('company'), async (req, res) => {
  try {
    const { title, description, salary, location, type } = req.body;

    if (!title || !description || !salary || !location || !type) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const job = await Job.create({
      title,
      description,
      salary,
      location,
      type,
      postedBy: req.user._id,
      companyName: req.user.name,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job.', error: error.message });
  }
});

// DELETE /jobs/:id — Company only: delete own job
router.delete('/:id', protect, restrictTo('company'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job.' });
    }

    // remove uploaded resume files for applications
    const apps = await Application.find({ jobId: req.params.id });
    for (const a of apps) {
      if (a.resumeFileName) {
        const filePath = path.join(__dirname, '..', 'uploads', a.resumeFileName);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (err) { console.warn('Failed to remove file', filePath, err.message); }
        }
      }
    }

    await job.deleteOne();
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: 'Job deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job.', error: error.message });
  }
});

// POST /jobs/:id/apply — Candidate only: apply to a job (multipart/form-data, PDF upload)
router.post('/:id/apply', protect, restrictTo('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const { name, email } = req.body;
    if (!name || !email || !req.file) {
      return res.status(400).json({ message: 'Name, email, and resume PDF are required.' });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      jobId: req.params.id,
      candidateId: req.user._id,
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this job.' });
    }

    const application = await Application.create({
      jobId: req.params.id,
      candidateId: req.user._id,
      name,
      email,
      resumeFileName: req.file.filename,
    });

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application.', error: error.message });
  }
});

// GET /jobs/:id/applications — Company only: view applicants for their job
router.get('/:id/applications', protect, restrictTo('company'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications.' });
    }

    const applications = await Application.find({ jobId: req.params.id }).sort({ appliedAt: -1 });
    res.json({ job, applications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications.', error: error.message });
  }
});

module.exports = router;
