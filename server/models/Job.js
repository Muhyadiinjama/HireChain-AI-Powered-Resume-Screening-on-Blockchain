const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, default: 'HireChain AI' },
    location: { type: String, default: 'Remote' },
    type: { type: String, default: 'Full-time' },
    salaryRange: { type: String, default: '$100,000 - $150,000' },
    description: { type: String, required: true },
    tags: [String],
    department: { type: String, default: 'Engineering' },
    experienceLevel: { type: String, default: 'Mid Level (2-5 years)' },
    category: { type: String, default: 'Engineering' },
    subcategory: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationLink: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
