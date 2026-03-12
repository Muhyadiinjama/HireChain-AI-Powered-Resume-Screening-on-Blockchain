const canReviewerAccessCandidate = (candidate, dbUser) => {
    if (!candidate || !dbUser) {
        return false;
    }

    if (dbUser.role === 'admin') {
        return true;
    }

    if (dbUser.role === 'recruiter') {
        return candidate.jobId?.createdBy?.toString() === dbUser._id.toString();
    }

    if (dbUser.role === 'candidate') {
        return candidate.userId?.toString() === dbUser._id.toString();
    }

    return false;
};

const canReviewerAccessJob = (job, dbUser) => {
    if (!job || !dbUser) {
        return false;
    }

    if (dbUser.role === 'admin') {
        return true;
    }

    return job.createdBy?.toString() === dbUser._id.toString();
};

module.exports = {
    canReviewerAccessCandidate,
    canReviewerAccessJob,
};
