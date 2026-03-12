const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const normalizeText = (value = '') =>
    String(value)
        .replace(/\r\n/g, '\n')
        .replace(/\u0000/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const collectReadableSegments = (value = '') => {
    const segments = value
        .split(/\s{2,}/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length >= 3);

    return [...new Set(segments)];
};

const extractReadableBinaryText = (buffer) => {
    const utf8Text = buffer
        .toString('utf8')
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
        .replace(/\s{2,}/g, ' ');
    const latin1Text = buffer
        .toString('latin1')
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
        .replace(/\s{2,}/g, ' ');
    const utf16Text = buffer
        .toString('utf16le')
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
        .replace(/\s{2,}/g, ' ');

    const combined = collectReadableSegments([utf8Text, latin1Text, utf16Text].join(' ')).join('\n');

    return normalizeText(combined);
};

const extractLegacyDocText = (buffer) => {
    const rawText = extractReadableBinaryText(buffer);
    const normalized = normalizeText(rawText);
    return normalized;
};

const parseResumeFile = async (uploadedFile) => {
    if (!uploadedFile?.path) {
        return {
            text: '',
            parser: 'none',
            warnings: [],
        };
    }

    const fileBuffer = fs.readFileSync(uploadedFile.path);
    const fileName = uploadedFile.originalname || path.basename(uploadedFile.path);
    const extension = path.extname(fileName).toLowerCase();
    const mimeType = String(uploadedFile.mimetype || '').toLowerCase();
    const warnings = [];

    try {
        if (mimeType.startsWith('text/') || ['.txt', '.md', '.rtf'].includes(extension)) {
            return {
                text: normalizeText(fileBuffer.toString('utf8')),
                parser: 'text',
                warnings,
            };
        }

        if (mimeType === 'application/pdf' || extension === '.pdf') {
            const parsed = await pdfParse(fileBuffer);
            return {
                text: normalizeText(parsed.text),
                parser: 'pdf-parse',
                warnings,
            };
        }

        if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            extension === '.docx'
        ) {
            const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
            return {
                text: normalizeText(parsed.value),
                parser: 'mammoth',
                warnings: parsed.messages?.length
                    ? [...warnings, ...parsed.messages.map((message) => message.message)]
                    : warnings,
            };
        }

        if (extension === '.doc') {
            const text = extractLegacyDocText(fileBuffer);
            if (!text) {
                warnings.push('Legacy .doc parsing returned very little text; please prefer PDF or DOCX for stronger extraction quality.');
            } else {
                warnings.push('Legacy .doc parsing is best-effort; some formatting or content may be incomplete.');
            }
            return {
                text,
                parser: 'legacy-doc-best-effort',
                warnings,
            };
        }

        warnings.push('Unsupported resume format for structured extraction; using best-effort text parsing.');
        return {
            text: extractReadableBinaryText(fileBuffer),
            parser: 'binary-fallback',
            warnings,
        };
    } catch (error) {
        warnings.push(`Resume parsing fallback used: ${error.message}`);
        const fallbackText = extractReadableBinaryText(fileBuffer);
        if (!fallbackText) {
            warnings.push('No structured text could be extracted from the uploaded file. PDF or DOCX is recommended for stronger AI analysis.');
        }
        return {
            text: fallbackText,
            parser: 'fallback',
            warnings,
        };
    }
};

module.exports = {
    parseResumeFile,
    normalizeText,
};
