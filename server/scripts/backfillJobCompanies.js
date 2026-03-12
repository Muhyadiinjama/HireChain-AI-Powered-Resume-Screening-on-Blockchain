require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const Job = require('../models/Job');
require('../models/User');
const { backfillJobCompanies } = require('../services/jobCompanyService');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const run = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required to backfill job companies.');
    }

    await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        dbName: 'hirechain'
    });

    const jobs = await Job.find().populate('createdBy');
    await backfillJobCompanies(jobs);

    console.log(`Processed ${jobs.length} jobs for company backfill.`);
    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error('Backfill failed:', error.message);
    try {
        await mongoose.disconnect();
    } catch (_error) {
        // Ignore disconnect failures during script exit.
    }
    process.exit(1);
});
