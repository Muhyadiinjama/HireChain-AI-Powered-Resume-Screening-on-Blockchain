const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
    extractSkillsFromSources,
    findMissingRequiredSkills,
    mergeUniqueSkills,
    normalizeSkillKey,
} = require('./skillExtractionService');

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
    const safeSkills = mergeUniqueSkills(
        Array.isArray(analysis.skills)
            ? analysis.skills.map((skill) => String(skill).trim()).filter(Boolean)
            : []
    );

    const safeMissingSkills = mergeUniqueSkills(
        Array.isArray(analysis.missingSkills)
            ? analysis.missingSkills.map((skill) => String(skill).trim()).filter(Boolean)
            : []
    );

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

const buildPrompt = ({
    resumeText,
    jobDescription,
    candidateProfileText,
    requiredSkills,
    extractedSkillHints
}) => `
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
- Detect skills from BOTH sources below: the uploaded resume text and the candidate profile / form text.
- The "skills" array should be as complete as possible for technical, tooling, platform, framework, language, database, cloud, blockchain, mobile, DevOps, and analytics skills that are clearly supported by the text.
- Prefer concrete technical skills such as React, Node.js, Python, Docker, AWS, PostgreSQL, Solidity, TensorFlow, Power BI, and similar tools or technologies.
- Do not include soft skills unless they are explicitly required technical capabilities.
- Keep the explanation under 80 words.

Required Job Skills:
${requiredSkills?.length ? requiredSkills.join(', ') : 'No explicit required skills were provided.'}

Rule-Based Skill Hints From Resume/Form:
${extractedSkillHints?.length ? extractedSkillHints.join(', ') : 'No deterministic skill hints were detected.'}

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

const buildFallbackAnalysis = ({ requiredSkills, extractedSkillHints, reason }) => {
    const matchedSkills = mergeUniqueSkills(extractedSkillHints);
    const missingSkills = findMissingRequiredSkills(requiredSkills, matchedSkills);
    const coverageScore = requiredSkills.length
        ? Math.round((Math.max(requiredSkills.length - missingSkills.length, 0) / requiredSkills.length) * 100)
        : Math.min(100, matchedSkills.length * 12);

    return {
        skills: matchedSkills,
        score: coverageScore,
        missingSkills,
        explanation: reason || (
            matchedSkills.length
                ? 'Fallback skill extraction used from the uploaded resume and candidate form.'
                : 'No supported technical skills were confidently detected from the uploaded resume or candidate form.'
        ),
    };
};

const combineAnalysisWithSkillHints = ({ analysis, extractedSkillHints, requiredSkills }) => {
    const skills = mergeUniqueSkills(analysis.skills, extractedSkillHints);
    const missingSkills = mergeUniqueSkills(
        findMissingRequiredSkills(requiredSkills, skills),
        analysis.missingSkills.filter((skill) => !skills.some((matchedSkill) => normalizeSkillKey(matchedSkill) === normalizeSkillKey(skill)))
    );

    return {
        ...analysis,
        skills,
        missingSkills,
    };
};

const analyzeWithClient = async ({
    genAI,
    resumeText,
    jobDescription,
    candidateProfileText,
    requiredSkills,
    extractedSkillHints
}) => {
    const prompt = buildPrompt({
        resumeText,
        jobDescription,
        candidateProfileText,
        requiredSkills,
        extractedSkillHints,
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
    requiredSkills = [],
}) => {
    const apiKeys = getApiKeys();
    const extractedSkillHints = extractSkillsFromSources({
        resumeText,
        candidateProfileText,
    });

    if (!apiKeys.length) {
        return buildFallbackAnalysis({
            requiredSkills,
            extractedSkillHints,
            reason: 'Gemini API key is not configured, so fallback skill extraction was used from the uploaded resume and candidate form.'
        });
    }

    const quotaBlockedKeys = [];
    let lastError;

    for (const { envName, value } of apiKeys) {
        try {
            const analysis = await analyzeWithClient({
                genAI: new GoogleGenerativeAI(value),
                resumeText,
                jobDescription,
                candidateProfileText,
                requiredSkills,
                extractedSkillHints,
            });
            return combineAnalysisWithSkillHints({
                analysis,
                extractedSkillHints,
                requiredSkills,
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
        return buildFallbackAnalysis({
            requiredSkills,
            extractedSkillHints,
            reason: `${createQuotaError(quotaBlockedKeys).message} Fallback skill extraction was used from the uploaded resume and candidate form.`
        });
    }

    if (lastError) {
        return buildFallbackAnalysis({
            requiredSkills,
            extractedSkillHints,
            reason: `Gemini analysis failed, so fallback skill extraction was used from the uploaded resume and candidate form. ${lastError.message || ''}`.trim()
        });
    }

    return buildFallbackAnalysis({ requiredSkills, extractedSkillHints });
};

module.exports = { analyzeResume };
