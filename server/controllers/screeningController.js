const fs = require('fs');
const path = require('path');
const Candidate = require('../models/Candidate');
const Screening = require('../models/Screening');
const BlockchainLog = require('../models/BlockchainLog');
const Job = require('../models/Job');
const { analyzeResume } = require('../services/geminiService');
const {
    generateResumeHash,
    generateVerificationId,
    recordScreeningOnChain,
} = require('../services/blockchainService');
const { isValidApplicationStatus } = require('../constants/applicationStatuses');
const { applyResolvedCompany, backfillJobCompanies } = require('../services/jobCompanyService');
const { parseResumeFile, normalizeText } = require('../services/resumeParsingService');
const { anonymizeText } = require('../services/anonymizeResumeService');
const { canReviewerAccessCandidate, canReviewerAccessJob } = require('../utils/accessControl');

const normalizeCandidateJob = (candidate) => {
    if (!candidate?.jobId) {
        return candidate;
    }

    candidate.jobId = applyResolvedCompany(candidate.jobId);
    return candidate;
};

const backfillCandidateJobs = async (candidates) => {
    const jobs = candidates
        .map((candidate) => candidate?.jobId)
        .filter(Boolean);

    if (!jobs.length) {
        return;
    }

    await backfillJobCompanies(jobs);
};

const screenResume = async (req, res) => {
    try {
        const {
            resumeText = '',
            candidateProfileText = '',
            jobId,
            email,
            consentAccepted,
        } = req.body;

        if (!req.dbUser?._id) {
            return res.status(401).json({ success: false, message: 'Authenticated user not found' });
        }

        if (!jobId) {
            return res.status(400).json({ success: false, message: 'Job ID is required' });
        }

        if (!resumeText.trim() && !candidateProfileText.trim() && !req.file) {
            return res.status(400).json({ success: false, message: 'Resume content or uploaded file is required' });
        }

        const hasConsent = String(consentAccepted).toLowerCase() === 'true';
        if (!hasConsent) {
            return res.status(400).json({
                success: false,
                message: 'Candidate consent is required before AI screening and verification.'
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const jobContext = `
            Title: ${job.title}
            Department: ${job.department}
            Experience Level: ${job.experienceLevel}
            Required Skills: ${(job.tags || []).join(', ')}
            Description: ${job.description}
        `;

        const parsedResume = await parseResumeFile(req.file || null);
        const combinedResumeText = normalizeText([
            parsedResume.text,
            resumeText,
        ].filter(Boolean).join('\n\n'));

        const anonymizedResume = anonymizeText(combinedResumeText);
        const anonymizedProfile = anonymizeText(candidateProfileText);
        const anonymizationWarnings = [
            ...(parsedResume.warnings || []),
        ];
        const redactedFields = [...new Set([
            ...anonymizedResume.redactedFields,
            ...anonymizedProfile.redactedFields,
        ])];

        const analysis = await analyzeResume({
            resumeText: anonymizedResume.anonymizedText,
            candidateProfileText: anonymizedProfile.anonymizedText,
            jobDescription: jobContext,
        });

        const candidate = new Candidate({
            email: email || req.dbUser.email,
            userId: req.dbUser._id,
            jobId,
            resumeURL: req.file ? req.file.path : '',
            resumeOriginalName: req.file?.originalname || '',
            resumeMimeType: req.file?.mimetype || '',
            candidateProfileText,
            consentAccepted: true,
            consentAcceptedAt: new Date(),
        });
        await candidate.save();

        const screening = new Screening({
            candidateId: candidate._id,
            score: analysis.score,
            skills: analysis.skills,
            missingSkills: analysis.missingSkills,
            aiExplanation: analysis.explanation,
            analysisMode: 'anonymized',
            anonymizedAnalysis: true,
            redactedFields,
            resumeParser: parsedResume.parser,
            anonymizationWarnings,
        });
        await screening.save();

        const timestamp = new Date();
        const fileBuffer = req.file?.path ? fs.readFileSync(req.file.path) : null;
        const hash = generateResumeHash({
            resumeText: [candidateProfileText, resumeText].filter(Boolean).join('\n\n'),
            timestamp: timestamp.toISOString(),
            fileBuffer,
            fileName: req.file?.originalname,
            mimeType: req.file?.mimetype,
        });
        const verificationId = generateVerificationId();
        const onChainRecord = await recordScreeningOnChain({
            hash,
            verificationId,
            applicationId: candidate._id.toString(),
            score: analysis.score,
        });

        const blockchainLog = new BlockchainLog({
            hash,
            timestamp,
            candidateId: candidate._id,
            verificationId,
            txHash: onChainRecord.txHash,
            blockNumber: onChainRecord.blockNumber,
            contractAddress: onChainRecord.contractAddress,
            chainId: onChainRecord.chainId,
            network: onChainRecord.network,
            onChainConfirmed: onChainRecord.onChainConfirmed,
            explorerUrl: onChainRecord.explorerUrl,
        });
        await blockchainLog.save();

        res.status(200).json({
            success: true,
            candidate,
            result: { ...screening._doc, _id: candidate._id },
            verification: blockchainLog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobCandidates = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (!canReviewerAccessJob(job, req.dbUser)) {
            return res.status(403).json({ success: false, message: 'Not authorized to view candidates for this job' });
        }

        const screenings = await Screening.find()
            .populate({
                path: 'candidateId',
                match: { jobId: req.params.jobId }
            })
            .populate({
                path: 'candidateId',
                populate: { path: 'jobId' }
            });

        const filtered = screenings.filter((s) => s.candidateId !== null);
        filtered.forEach((screening) => normalizeCandidateJob(screening.candidateId));
        await backfillCandidateJobs(filtered.map((screening) => screening.candidateId));

        const results = await Promise.all(filtered.map(async (s) => {
            const log = await BlockchainLog.findOne({ candidateId: s.candidateId._id });
            return {
                ...s._doc,
                candidate: s.candidateId,
                blockchain: log
            };
        }));

        res.status(200).json({ success: true, candidates: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const candidates = await Candidate.find({ userId: req.dbUser._id })
            .populate('jobId')
            .sort({ createdAt: -1 });
        candidates.forEach((candidate) => normalizeCandidateJob(candidate));
        await backfillCandidateJobs(candidates);

        const results = await Promise.all(candidates.map(async (candidate) => {
            const screening = await Screening.findOne({ candidateId: candidate._id });
            const blockchain = await BlockchainLog.findOne({ candidateId: candidate._id });
            return {
                ...candidate._doc,
                job: applyResolvedCompany(candidate.jobId),
                screening,
                blockchain
            };
        }));

        res.status(200).json({ success: true, applications: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getApplicationResult = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('jobId');

        if (!candidate) return res.status(404).json({ message: 'Application not found' });

        if (!req.dbUser) {
            return res.status(403).json({ success: false, message: 'User not found in database' });
        }

        if (req.dbUser.role === 'candidate' && candidate.userId.toString() !== req.dbUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
        }

        if (req.dbUser.role === 'recruiter' && candidate.jobId?.createdBy?.toString() !== req.dbUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
        }

        normalizeCandidateJob(candidate);
        await backfillCandidateJobs([candidate]);

        const screening = await Screening.findOne({ candidateId: candidate._id });
        const blockchain = await BlockchainLog.findOne({ candidateId: candidate._id });

        res.status(200).json({
            success: true,
            candidate,
            job: candidate.jobId,
            screening,
            blockchain
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCandidateReview = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('jobId')
            .populate('userId', 'name email');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (!canReviewerAccessCandidate(candidate, req.dbUser)) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this candidate' });
        }

        normalizeCandidateJob(candidate);
        await backfillCandidateJobs([candidate]);

        const screening = await Screening.findOne({ candidateId: candidate._id });
        const blockchain = await BlockchainLog.findOne({ candidateId: candidate._id });

        res.status(200).json({
            success: true,
            candidate,
            screening,
            blockchain
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCandidateDecision = async (req, res) => {
    try {
        const { status, decisionNotes = '' } = req.body;

        if (!isValidApplicationStatus(status)) {
            return res.status(400).json({ success: false, message: 'Invalid application status' });
        }

        const candidate = await Candidate.findById(req.params.id)
            .populate('jobId')
            .populate('userId', 'name email');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (!canReviewerAccessCandidate(candidate, req.dbUser)) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this candidate' });
        }

        normalizeCandidateJob(candidate);
        await backfillCandidateJobs([candidate]);

        candidate.applicationStatus = status;
        candidate.decisionNotes = decisionNotes.trim();
        candidate.reviewedAt = status === 'pending' ? null : new Date();
        await candidate.save();

        const screening = await Screening.findOne({ candidateId: candidate._id });
        const blockchain = await BlockchainLog.findOne({ candidateId: candidate._id });

        res.status(200).json({
            success: true,
            message: `Candidate marked as ${status}.`,
            candidate,
            screening,
            blockchain
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const downloadCandidateResume = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('jobId')
            .populate('userId', 'name email');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (!canReviewerAccessCandidate(candidate, req.dbUser)) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
        }

        if (!candidate.resumeURL) {
            return res.status(404).json({ success: false, message: 'Resume not available for this candidate' });
        }

        const absolutePath = path.resolve(__dirname, '..', candidate.resumeURL);
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ success: false, message: 'Uploaded resume file not found' });
        }

        if (candidate.resumeMimeType) {
            res.type(candidate.resumeMimeType);
        }

        const safeFilename = candidate.resumeOriginalName || path.basename(candidate.resumeURL);
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename.replace(/"/g, '')}"`);
        return res.sendFile(absolutePath);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCandidates = async (req, res) => {
    try {
        let jobIds;
        if (req.dbUser.role === 'admin') {
            const jobs = await Job.find();
            jobIds = jobs.map((j) => j._id);
        } else {
            const jobs = await Job.find({ createdBy: req.dbUser._id });
            jobIds = jobs.map((j) => j._id);
        }

        const screenings = await Screening.find()
            .populate({
                path: 'candidateId',
                match: { jobId: { $in: jobIds } },
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'jobId', populate: { path: 'createdBy', select: 'company' } }
                ]
            });

        const filtered = screenings.filter((s) => s.candidateId !== null);
        filtered.forEach((screening) => normalizeCandidateJob(screening.candidateId));
        await backfillCandidateJobs(filtered.map((screening) => screening.candidateId));

        const results = await Promise.all(filtered.map(async (s) => {
            const log = await BlockchainLog.findOne({ candidateId: s.candidateId._id });
            return {
                ...s._doc,
                candidate: s.candidateId,
                blockchain: log
            };
        }));

        res.status(200).json({ success: true, candidates: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    screenResume,
    getJobCandidates,
    getMyApplications,
    getApplicationResult,
    getAllCandidates,
    getCandidateReview,
    updateCandidateDecision,
    downloadCandidateResume
};
