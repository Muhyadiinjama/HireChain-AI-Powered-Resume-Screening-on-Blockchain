const test = require('node:test');
const assert = require('node:assert/strict');
const { anonymizeText } = require('../services/anonymizeResumeService');

test('anonymizeText redacts common personal identifiers', () => {
    const { anonymizedText, redactedFields } = anonymizeText(`
        John Doe
        john@example.com
        +60 12-345 6789
        LinkedIn: linkedin.com/in/johndoe
        GitHub: github.com/johndoe
        Location: Kuala Lumpur
    `);

    assert.match(anonymizedText, /\[REDACTED_NAME\]/);
    assert.match(anonymizedText, /\[REDACTED_PHONE\]/);
    assert.doesNotMatch(anonymizedText, /john@example\.com/i);
    assert.doesNotMatch(anonymizedText, /linkedin\.com/i);
    assert.doesNotMatch(anonymizedText, /github\.com/i);
    assert.ok(redactedFields.includes('name'));
    assert.ok(redactedFields.includes('phone'));
    assert.ok(redactedFields.includes('contactHeader'));
});
