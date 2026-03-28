const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeResume } = require('../services/geminiService');

const KEY_NAMES = [
    'GEMINI_API_KEY',
    'GEMINI_API_KEY_2',
    'GEMINI_API_KEY_3',
    'GOOGLE_API_KEY',
    'GOOGLE_API_KEY_2',
    'GENAI_API_KEY',
];

test('analyzeResume falls back to merged resume and form skill extraction when no Gemini key is configured', async () => {
    const previousEnv = {};
    const dynamicKeyNames = Object.keys(process.env).filter((key) => /^GEMINI_API_KEY(_\d+)?$/i.test(key));

    [...new Set([...KEY_NAMES, ...dynamicKeyNames])].forEach((key) => {
        previousEnv[key] = process.env[key];
        delete process.env[key];
    });

    try {
        const analysis = await analyzeResume({
            resumeText: 'Built mobile apps using Flutter and Firebase. Also used Docker for deployments.',
            candidateProfileText: 'Technical Skills: React Native, AWS, Power BI',
            jobDescription: 'Need a cross-platform developer with Flutter, Firebase, AWS, Docker, and Power BI.',
            requiredSkills: ['Flutter', 'Firebase', 'AWS', 'Docker', 'Power BI', 'Kubernetes'],
        });

        assert.deepEqual(analysis.skills, [
            'Firebase',
            'Docker',
            'Flutter',
            'AWS',
            'Power BI',
            'React Native',
        ]);
        assert.deepEqual(analysis.missingSkills, ['Kubernetes']);
        assert.match(analysis.explanation, /fallback skill extraction/i);
        assert.equal(typeof analysis.score, 'number');
    } finally {
        Object.entries(previousEnv).forEach(([key, value]) => {
            if (typeof value === 'undefined') {
                delete process.env[key];
                return;
            }

            process.env[key] = value;
        });
    }
});
