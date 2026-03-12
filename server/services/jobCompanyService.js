const DEFAULT_JOB_COMPANY = 'HireChain AI';

const sanitizeCompany = (value) => (typeof value === 'string' ? value.trim() : '');

const resolveJobCompany = (job, dbUser) => {
    const explicitCompany = sanitizeCompany(job?.company);
    if (explicitCompany && explicitCompany !== DEFAULT_JOB_COMPANY) {
        return explicitCompany;
    }

    const creatorCompany = sanitizeCompany(dbUser?.company || job?.createdBy?.company);
    if (creatorCompany) {
        return creatorCompany;
    }

    return explicitCompany || DEFAULT_JOB_COMPANY;
};

const applyResolvedCompany = (job, dbUser) => {
    if (!job) {
        return job;
    }

    const resolvedCompany = resolveJobCompany(job, dbUser);
    if (typeof job.toObject === 'function') {
        const normalizedJob = job.toObject();
        normalizedJob.company = resolvedCompany;
        return normalizedJob;
    }

    return {
        ...job,
        company: resolvedCompany
    };
};

const backfillJobCompanies = async (jobs) => {
    const updates = jobs
        .map((job) => {
            const currentCompany = sanitizeCompany(job?.company);
            const resolvedCompany = resolveJobCompany(job);

            if (resolvedCompany && currentCompany !== resolvedCompany) {
                return {
                    updateOne: {
                        filter: { _id: job._id },
                        update: { $set: { company: resolvedCompany } }
                    }
                };
            }

            return null;
        })
        .filter(Boolean);

    if (!updates.length) {
        return;
    }

    const Job = require('../models/Job');
    await Job.bulkWrite(updates, { ordered: false });
};

module.exports = {
    DEFAULT_JOB_COMPANY,
    resolveJobCompany,
    applyResolvedCompany,
    backfillJobCompanies
};
