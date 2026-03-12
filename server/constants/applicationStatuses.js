const APPLICATION_STATUSES = ['pending', 'shortlisted', 'interview', 'accepted', 'rejected'];

const isValidApplicationStatus = (status) => APPLICATION_STATUSES.includes(status);

module.exports = {
    APPLICATION_STATUSES,
    isValidApplicationStatus,
};
