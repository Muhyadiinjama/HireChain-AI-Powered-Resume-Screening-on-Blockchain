const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    screenResume,
    getJobCandidates,
    getMyApplications,
    getApplicationResult,
    getAllCandidates,
    getCandidateReview,
    updateCandidateDecision,
    downloadCandidateResume
} = require('../controllers/screeningController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const BlockchainLog = require('../models/BlockchainLog');
const Candidate = require('../models/Candidate');

const upload = multer({ dest: 'uploads/' });

const canSeeSensitiveBlockchainDetails = (req) => req.dbUser?.role === 'admin';

const sanitizeBlockchainLog = (log, includeSensitiveDetails) => {
    const doc = typeof log.toObject === 'function' ? log.toObject() : { ...log };

    if (includeSensitiveDetails) {
        return doc;
    }

    return {
        _id: doc._id,
        hash: doc.hash,
        timestamp: doc.timestamp,
        verificationId: doc.verificationId,
        txHash: doc.txHash,
        blockNumber: doc.blockNumber,
        contractAddress: doc.contractAddress,
        chainId: doc.chainId,
        network: doc.network,
        onChainConfirmed: doc.onChainConfirmed,
        explorerUrl: doc.explorerUrl
    };
};

// Candidates can upload resumes
router.post('/', authMiddleware, roleMiddleware(['candidate']), upload.single('resume'), screenResume);

// Get specific application result
router.get('/application/:id', authMiddleware, getApplicationResult);
router.get('/application/:id/review', authMiddleware, roleMiddleware(['recruiter', 'admin']), getCandidateReview);
router.patch('/application/:id/status', authMiddleware, roleMiddleware(['recruiter', 'admin']), updateCandidateDecision);
router.get('/application/:id/resume', authMiddleware, roleMiddleware(['recruiter', 'admin']), downloadCandidateResume);

// Candidates can view their own application history
router.get('/my-applications', authMiddleware, roleMiddleware(['candidate']), getMyApplications);

// Recruiters and Admins can view all candidates
router.get('/all-candidates', authMiddleware, roleMiddleware(['recruiter', 'admin']), getAllCandidates);

// Recruiters and Admins can view candidate lists for a job
router.get('/job/:jobId', authMiddleware, roleMiddleware(['recruiter', 'admin']), getJobCandidates);

// PUBLIC: Get all blockchain logs for the explorer page
router.get('/blockchain-logs', optionalAuthMiddleware, async (req, res) => {
    try {
        const includeSensitiveDetails = canSeeSensitiveBlockchainDetails(req);
        const query = BlockchainLog.find()
            .sort({ timestamp: -1 })
            .limit(50);

        if (includeSensitiveDetails) {
            query.populate({
                path: 'candidateId',
                populate: [
                    { path: 'jobId', select: 'title company location type' },
                    { path: 'userId', select: 'name email' }
                ]
            });
        }

        const logs = await query;
        res.status(200).json({
            success: true,
            logs: logs.map((log) => sanitizeBlockchainLog(log, includeSensitiveDetails)),
            viewerCanSeeSensitiveDetails: includeSensitiveDetails
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/blockchain-logs/:hash', optionalAuthMiddleware, async (req, res) => {
    try {
        const includeSensitiveDetails = canSeeSensitiveBlockchainDetails(req);
        const query = BlockchainLog.findOne({ hash: req.params.hash });

        if (includeSensitiveDetails) {
            query.populate({
                path: 'candidateId',
                populate: [
                    { path: 'jobId', select: 'title company location type' },
                    { path: 'userId', select: 'name email' }
                ]
            });
        }

        const log = await query;

        if (!log) {
            return res.status(404).json({ success: false, message: 'Verification record not found' });
        }

        res.status(200).json({
            success: true,
            log: sanitizeBlockchainLog(log, includeSensitiveDetails),
            viewerCanSeeSensitiveDetails: includeSensitiveDetails
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
