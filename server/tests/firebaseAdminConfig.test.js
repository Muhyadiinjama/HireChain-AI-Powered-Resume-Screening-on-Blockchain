const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getFirebaseServiceAccount,
    normalizePrivateKey,
    stripWrappingQuotes,
} = require('../utils/firebaseAdminConfig');

test('stripWrappingQuotes removes matching outer quotes only', () => {
    assert.equal(stripWrappingQuotes('"value"'), 'value');
    assert.equal(stripWrappingQuotes("'value'"), 'value');
    assert.equal(stripWrappingQuotes('value'), 'value');
});

test('normalizePrivateKey supports escaped newlines and quoted values for Render env vars', () => {
    const normalized = normalizePrivateKey('"-----BEGIN PRIVATE KEY-----\\nABC123\\n-----END PRIVATE KEY-----\\n"');

    assert.equal(
        normalized,
        '-----BEGIN PRIVATE KEY-----\nABC123\n-----END PRIVATE KEY-----'
    );
});

test('getFirebaseServiceAccount returns normalized Firebase Admin credentials', () => {
    const serviceAccount = getFirebaseServiceAccount({
        FIREBASE_PROJECT_ID: 'demo-project',
        FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@example.iam.gserviceaccount.com',
        FIREBASE_PRIVATE_KEY: "'-----BEGIN PRIVATE KEY-----\\nXYZ\\n-----END PRIVATE KEY-----\\n'",
    });

    assert.deepEqual(serviceAccount, {
        projectId: 'demo-project',
        clientEmail: 'firebase-adminsdk@example.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nXYZ\n-----END PRIVATE KEY-----',
    });
});
