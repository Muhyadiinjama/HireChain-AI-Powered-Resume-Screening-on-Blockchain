const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const controllerPath = require.resolve('../controllers/screeningController');
const controllerDir = path.dirname(controllerPath);

const defaultJobCompanyServiceMock = {
    applyResolvedCompany: (job) => ({
        ...job,
        company: job?.company || 'HireChain AI'
    }),
    backfillJobCompanies: async () => {},
    resolveJobCompany: () => 'HireChain AI'
};

const loadScreeningController = (overrides = {}) => {
    const moduleMocks = {
        '../models/Candidate': {},
        '../models/Screening': {},
        '../models/BlockchainLog': {},
        '../models/Job': {},
        '../services/geminiService': { analyzeResume: async () => ({}) },
        '../services/blockchainService': {
            generateResumeHash: () => 'hash',
            generateVerificationId: () => 'verification-id',
            recordScreeningOnChain: async () => ({})
        },
        '../constants/applicationStatuses': { isValidApplicationStatus: () => true },
        '../services/jobCompanyService': defaultJobCompanyServiceMock,
        '../services/resumeParsingService': {
            parseResumeFile: async () => ({ text: '', warnings: [], parser: 'none' }),
            normalizeText: (value) => value
        },
        '../services/anonymizeResumeService': {
            anonymizeText: (text) => ({ anonymizedText: text, redactedFields: [] })
        },
        '../utils/accessControl': {
            canReviewerAccessCandidate: () => true,
            canReviewerAccessJob: () => true
        },
        ...overrides
    };

    const originals = new Map();

    Object.entries(moduleMocks).forEach(([relativePath, mockExports]) => {
        const resolvedPath = require.resolve(path.resolve(controllerDir, relativePath));
        originals.set(resolvedPath, require.cache[resolvedPath]);
        require.cache[resolvedPath] = {
            id: resolvedPath,
            filename: resolvedPath,
            loaded: true,
            exports: mockExports
        };
    });

    delete require.cache[controllerPath];
    const controller = require(controllerPath);

    const restore = () => {
        delete require.cache[controllerPath];

        originals.forEach((originalModule, resolvedPath) => {
            if (originalModule) {
                require.cache[resolvedPath] = originalModule;
                return;
            }

            delete require.cache[resolvedPath];
        });
    };

    return { controller, restore };
};

test('getJobCandidates fetches candidates only for the requested job id', async () => {
    const candidatesForJob = [
        {
            _id: 'candidate-1',
            userId: { name: 'Alice Applicant', email: 'alice@example.com' },
            jobId: { _id: 'job-1', company: 'Acme' }
        }
    ];
    let candidateQueryFilter;
    let screeningQueryFilter;

    const candidateQuery = {
        populate() {
            return this;
        },
        then(onFulfilled, onRejected) {
            return Promise.resolve(candidatesForJob).then(onFulfilled, onRejected);
        }
    };

    const { controller, restore } = loadScreeningController({
        '../models/Job': {
            findById: async (id) => ({ _id: id, createdBy: 'admin-1' })
        },
        '../models/Candidate': {
            find: (filter) => {
                candidateQueryFilter = filter;
                return candidateQuery;
            }
        },
        '../models/Screening': {
            find: async (filter) => {
                screeningQueryFilter = filter;
                return [
                    {
                        _doc: { _id: 'screen-1' },
                        candidateId: 'candidate-1'
                    }
                ];
            }
        },
        '../models/BlockchainLog': {
            findOne: async ({ candidateId }) => ({ verificationId: `log-${candidateId}` })
        }
    });

    const req = {
        params: { jobId: 'job-1' },
        dbUser: { role: 'admin', _id: 'admin-1' }
    };

    let statusCode;
    let responseBody;

    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(payload) {
            responseBody = payload;
            return this;
        }
    };

    try {
        await controller.getJobCandidates(req, res);

        assert.deepEqual(candidateQueryFilter, { jobId: 'job-1' });
        assert.deepEqual(screeningQueryFilter, {
            candidateId: { $in: ['candidate-1'] }
        });
        assert.equal(statusCode, 200);
        assert.equal(responseBody.success, true);
        assert.equal(responseBody.candidates.length, 1);
        assert.equal(responseBody.candidates[0].candidate._id, 'candidate-1');
        assert.equal(responseBody.candidates[0].candidateId._id, 'candidate-1');
        assert.deepEqual(responseBody.candidates[0].blockchain, { verificationId: 'log-candidate-1' });
    } finally {
        restore();
    }
});
