const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    score: { type: Number, required: true },
    skills: [String],
    missingSkills: [String],
    aiExplanation: { type: String },
    analysisMode: { type: String, default: 'standard' },
    anonymizedAnalysis: { type: Boolean, default: false },
    redactedFields: [String],
    resumeParser: { type: String },
    anonymizationWarnings: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Screening', screeningSchema);
