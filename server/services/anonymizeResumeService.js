const { normalizeText } = require('./resumeParsingService');

const REDACTION_PATTERNS = [
    {
        field: 'email',
        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        replacement: '[REDACTED_EMAIL]',
    },
    {
        field: 'phone',
        pattern: /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/g,
        replacement: '[REDACTED_PHONE]',
    },
    {
        field: 'url',
        pattern: /\b(?:https?:\/\/|www\.)\S+\b/gi,
        replacement: '[REDACTED_URL]',
    },
    {
        field: 'linkedin',
        pattern: /\b(?:linkedin\.com\/\S+)\b/gi,
        replacement: '[REDACTED_LINKEDIN]',
    },
    {
        field: 'github',
        pattern: /\b(?:github\.com\/\S+)\b/gi,
        replacement: '[REDACTED_GITHUB]',
    },
    {
        field: 'address',
        pattern: /\b\d{1,5}\s+[A-Z0-9][A-Z0-9\s.,-]{4,}(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|jalan|no\.)\b/gi,
        replacement: '[REDACTED_ADDRESS]',
    },
    {
        field: 'dateOfBirth',
        pattern: /\b(?:dob|date of birth)[:\s-]*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/gi,
        replacement: '[REDACTED_DOB]',
    },
    {
        field: 'idNumber',
        pattern: /\b(?:passport|ic|national id|identity card|nric)[\s:#-]*[A-Z0-9-]{5,}\b/gi,
        replacement: '[REDACTED_ID]',
    },
];

const GENDER_PATTERNS = [
    /\b(?:male|female|man|woman|he\/him|she\/her|mr\.?|mrs\.?|ms\.?)\b/gi,
];

const stripLeadingIdentityBlock = (text, redactedFields) => {
    const lines = normalizeText(text).split('\n');
    if (lines.length < 2) {
        return text;
    }

    const identityIndicators = [
        '@',
        'linkedin',
        'github',
        'portfolio',
        'phone',
        'address',
        'location',
        'www.',
        'http',
    ];

    let removed = false;
    const filteredLines = lines.filter((line, index) => {
        if (index > 5) {
            return true;
        }

        const normalizedLine = line.toLowerCase();
        const shouldRemove = identityIndicators.some((indicator) => normalizedLine.includes(indicator));
        if (shouldRemove) {
            removed = true;
            return false;
        }
        return true;
    });

    if (removed) {
        redactedFields.add('contactHeader');
    }

    return filteredLines.join('\n');
};

const redactLikelyNameHeader = (text, redactedFields) => {
    const lines = normalizeText(text).split('\n');
    let replaced = false;

    const updatedLines = lines.map((line, index) => {
        if (index > 1) {
            return line;
        }

        const trimmed = line.trim();
        const looksLikeName =
            /^[A-Za-z][A-Za-z' -]+$/.test(trimmed) &&
            trimmed.split(/\s+/).length >= 2 &&
            trimmed.split(/\s+/).length <= 4 &&
            !/\b(resume|cv|curriculum vitae)\b/i.test(trimmed);

        if (looksLikeName) {
            replaced = true;
            return '[REDACTED_NAME]';
        }

        return line;
    });

    if (replaced) {
        redactedFields.add('name');
    }

    return updatedLines.join('\n');
};

const anonymizeText = (value = '') => {
    const redactedFields = new Set();
    let anonymized = normalizeText(value);

    anonymized = stripLeadingIdentityBlock(anonymized, redactedFields);
    anonymized = redactLikelyNameHeader(anonymized, redactedFields);

    for (const { field, pattern, replacement } of REDACTION_PATTERNS) {
        if (pattern.test(anonymized)) {
            redactedFields.add(field);
            anonymized = anonymized.replace(pattern, replacement);
        }
    }

    for (const pattern of GENDER_PATTERNS) {
        if (pattern.test(anonymized)) {
            redactedFields.add('genderedLanguage');
            anonymized = anonymized.replace(pattern, '[REDACTED_GENDER]');
        }
    }

    anonymized = anonymized
        .replace(/\b(?:name|candidate name|full name)\s*:\s*[^\n]+/gi, 'Name: [REDACTED_NAME]')
        .replace(/\b(?:location|current location|address)\s*:\s*[^\n]+/gi, 'Location: [REDACTED_LOCATION]')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return {
        anonymizedText: anonymized,
        redactedFields: [...redactedFields],
    };
};

module.exports = {
    anonymizeText,
};
