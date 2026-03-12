const mongoose = require('mongoose');
const { APPLICATION_STATUSES } = require('../constants/applicationStatuses');

const candidateSchema = new mongoose.Schema({
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeURL: { type: String },
    resumeOriginalName: { type: String },
    resumeMimeType: { type: String },
    candidateProfileText: { type: String },
    consentAccepted: { type: Boolean, default: false },
    consentAcceptedAt: { type: Date },
    applicationStatus: {
        type: String,
        enum: APPLICATION_STATUSES,
        default: 'pending'
    },
    decisionNotes: { type: String },
    reviewedAt: { type: Date },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
