const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, deleteJob, updateJob } = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public route to get jobs (or could be candidate/recruiter)
router.get('/', getJobs);
router.get('/:id', getJobById);

// Proctected routes: only recruiter or admin can manage jobs
router.post('/', authMiddleware, roleMiddleware(['recruiter', 'admin']), createJob);
router.put('/:id', authMiddleware, roleMiddleware(['recruiter', 'admin']), updateJob);
router.delete('/:id', authMiddleware, roleMiddleware(['recruiter', 'admin']), deleteJob);

module.exports = router;

