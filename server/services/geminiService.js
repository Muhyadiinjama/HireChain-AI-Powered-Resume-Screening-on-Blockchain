const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
];

const KEY_ENV_CANDIDATES = [
    'GEMINI_API_KEY',
    'GEMINI_API_KEY_2',
    'GEMINI_API_KEY_3',
    'GOOGLE_API_KEY',
    'GOOGLE_API_KEY_2',
    'GENAI_API_KEY',
];

const getApiKeys = () => {
    const discoveredKeys = [];

    for (const envName of KEY_ENV_CANDIDATES) {
        const value = process.env[envName];
        if (value && value.trim()) {
            discoveredKeys.push({
                envName,
                value: value.trim(),
            });
        }
    }

    const dynamicGeminiKeys = Object.keys(process.env)
        .filter((key) => /^GEMINI_API_KEY(_\d+)?$/i.test(key))
        .sort()
        .map((envName) => ({
            envName,
            value: String(process.env[envName] || '').trim(),
        }))
        .filter((entry) => entry.value);

    const seen = new Set();
    return [...discoveredKeys, ...dynamicGeminiKeys].filter(({ value }) => {
        if (seen.has(value)) {
            return false;
        }

        seen.add(value);
        return true;
    });
};

const extractJson = (rawText) => {
    const cleaned = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse Gemini response as JSON');
    }

    return JSON.parse(jsonMatch[0]);
};

const normalizeAnalysis = (analysis) => {
    const safeSkills = Array.isArray(analysis.skills)
        ? analysis.skills.map((skill) => String(skill).trim()).filter(Boolean)
        : [];

    const safeMissingSkills = Array.isArray(analysis.missingSkills)
        ? analysis.missingSkills.map((skill) => String(skill).trim()).filter(Boolean)
        : [];

    const numericScore = Number(analysis.score);
    const safeScore = Number.isFinite(numericScore)
        ? Math.max(0, Math.min(100, Math.round(numericScore)))
        : 0;

    return {
        skills: safeSkills,
        score: safeScore,
        missingSkills: safeMissingSkills,
        explanation: typeof analysis.explanation === 'string' && analysis.explanation.trim()
            ? analysis.explanation.trim()
            : 'No explanation returned by Gemini.',
    };
};

const buildPrompt = ({ resumeText, jobDescription, candidateProfileText }) => `
Analyze the candidate resume against the job description and return ONLY valid JSON.
Do not wrap the response in markdown or code fences.

Return exactly this JSON shape:
{
  "skills": ["skill1", "skill2"],
  "score": 85,
  "missingSkills": ["missingSkill1"],
  "explanation": "Short explanation here"
}

Rules:
- Score must be an integer from 0 to 100.
- The resume and candidate profile text below have already been anonymized. Do not infer identity.
- Only include concrete skills that are clearly supported by the anonymized resume or candidate profile.
- Keep the explanation under 80 words.

Candidate Profile Context:
${candidateProfileText || 'No additional candidate profile context provided.'}

Anonymized Resume Text:
${resumeText || 'No plain-text resume content was extracted.'}

Job Description:
${jobDescription}
`;

const isQuotaError = (message = '') =>
    message.includes('429 Too Many Requests') || message.toLowerCase().includes('quota exceeded');

const createQuotaError = (attemptedKeyNames) => {
    const keyLabel = attemptedKeyNames.length > 0
        ? ` Tried keys: ${attemptedKeyNames.join(', ')}.`
        : '';

    return new Error(`Gemini API quota exceeded for the configured project keys.${keyLabel} Enable billing, wait for quota reset, or add a working key as GEMINI_API_KEY_2/GOOGLE_API_KEY.`);
};

const analyzeWithClient = async ({ genAI, resumeText, jobDescription, candidateProfileText }) => {
    const prompt = buildPrompt({
        resumeText,
        jobDescription,
        candidateProfileText,
    });

    let lastError;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const analysis = normalizeAnalysis(extractJson(response.text()));

            console.log(`Gemini model used: ${modelName}`);
            return analysis;
        } catch (err) {
            console.warn(`Model ${modelName} failed: ${err.message}`);
            lastError = err;
        }
    }

    throw lastError || new Error('Unknown Gemini error');
};

const analyzeResume = async ({
    resumeText = '',
    jobDescription,
    candidateProfileText = '',
}) => {
    const apiKeys = getApiKeys();

    if (!apiKeys.length) {
        throw new Error('No Gemini API key found. Add GEMINI_API_KEY or GEMINI_API_KEY_2 in server/.env.');
    }

    const quotaBlockedKeys = [];
    let lastError;

    for (const { envName, value } of apiKeys) {
        try {
            return await analyzeWithClient({
                genAI: new GoogleGenerativeAI(value),
                resumeText,
                jobDescription,
                candidateProfileText,
            });
        } catch (error) {
            const errorMessage = error?.message || '';
            lastError = error;

            if (isQuotaError(errorMessage)) {
                quotaBlockedKeys.push(envName);
                console.warn(`Gemini key ${envName} hit quota; trying next configured key if available.`);
                continue;
            }

            throw error;
        }
    }

    if (quotaBlockedKeys.length === apiKeys.length) {
        throw createQuotaError(quotaBlockedKeys);
    }

    throw lastError || new Error('Unknown Gemini error');
};

module.exports = { analyzeResume };
