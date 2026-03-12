const test = require('node:test');
const assert = require('node:assert/strict');
const { canReviewerAccessCandidate, canReviewerAccessJob } = require('../utils/accessControl');

test('admin can access any candidate and recruiter can access only owned candidates', () => {
    const recruiterId = 'recruiter-1';
    const candidate = {
        userId: 'candidate-1',
        jobId: {
            createdBy: recruiterId,
        },
    };

    assert.equal(canReviewerAccessCandidate(candidate, { role: 'admin', _id: 'admin-1' }), true);
    assert.equal(canReviewerAccessCandidate(candidate, { role: 'recruiter', _id: recruiterId }), true);
    assert.equal(canReviewerAccessCandidate(candidate, { role: 'recruiter', _id: 'recruiter-2' }), false);
    assert.equal(canReviewerAccessCandidate(candidate, { role: 'candidate', _id: 'candidate-1' }), true);
    assert.equal(canReviewerAccessCandidate(candidate, { role: 'candidate', _id: 'candidate-2' }), false);
});

test('job access allows admins and the job owner only', () => {
    const job = { createdBy: 'recruiter-1' };

    assert.equal(canReviewerAccessJob(job, { role: 'admin', _id: 'admin-1' }), true);
    assert.equal(canReviewerAccessJob(job, { role: 'recruiter', _id: 'recruiter-1' }), true);
    assert.equal(canReviewerAccessJob(job, { role: 'recruiter', _id: 'recruiter-2' }), false);
});
