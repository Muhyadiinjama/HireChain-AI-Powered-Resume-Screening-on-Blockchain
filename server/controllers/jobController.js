const Job = require('../models/Job');
const {
    applyResolvedCompany,
    backfillJobCompanies,
    resolveJobCompany
} = require('../services/jobCompanyService');

const createJob = async (req, res) => {
    try {
        if (!req.dbUser || !req.dbUser._id) {
            return res.status(401).json({ success: false, message: 'Authentication error: User not fully registered in database' });
        }

        const { title, description, location, type, salaryRange, tags, department, experienceLevel, category, subcategory } = req.body;

        const job = new Job({
            title,
            company: resolveJobCompany({ company: req.body.company }, req.dbUser),
            description,
            location: location || 'Remote',
            type: type || 'Full-time',
            salaryRange: salaryRange || '$100,000 - $150,000',
            tags,
            department: department || 'Engineering',
            experienceLevel: experienceLevel || 'Mid Level (2-5 years)',
            category: category || 'Engineering',
            subcategory: subcategory || '',
            createdBy: req.dbUser._id,
            applicationLink: '/upload'
        });

        job.applicationLink = `/upload/${job._id}`;

        await job.save();
        res.status(201).json({ success: true, job });
    } catch (error) {
        console.error('Job Creation Detailed Error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${messages.join(', ')}`
            });
        }

        res.status(500).json({
            success: false,
            message: `Server Error: ${error.message}`
        });
    }
};

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .sort({ createdAt: -1, _id: -1 })
            .populate('createdBy');
        await backfillJobCompanies(jobs);
        const normalizedJobs = jobs.map((job) => applyResolvedCompany(job));
        res.status(200).json({ success: true, jobs: normalizedJobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('createdBy');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        await backfillJobCompanies([job]);
        const normalizedJob = applyResolvedCompany(job);
        res.status(200).json({ success: true, job: normalizedJob });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Ensure only the creator or admin can delete
        if (job.createdBy.toString() !== req.dbUser._id.toString() && req.dbUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Ensure only the creator or admin can update
        if (job.createdBy.toString() !== req.dbUser._id.toString() && req.dbUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
        }

        const payload = {
            ...req.body,
            company: resolveJobCompany({ company: req.body.company || job.company }, req.dbUser)
        };

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, payload, { returnDocument: 'after' }).populate('createdBy');
        const normalizedJob = applyResolvedCompany(updatedJob);
        res.status(200).json({ success: true, job: normalizedJob });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createJob, getJobs, getJobById, deleteJob, updateJob };

