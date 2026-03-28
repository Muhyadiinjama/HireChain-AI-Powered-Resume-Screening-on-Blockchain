const stripWrappingQuotes = (value = '') => {
    const trimmed = String(value || '').trim();

    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
};

const normalizePrivateKey = (value = '') => {
    const unwrapped = stripWrappingQuotes(value);

    return unwrapped
        .replace(/\r\n/g, '\n')
        .replace(/\\n/g, '\n')
        .trim();
};

const getFirebaseServiceAccount = (env = process.env) => {
    const projectId = String(env.FIREBASE_PROJECT_ID || '').trim();
    const clientEmail = String(env.FIREBASE_CLIENT_EMAIL || '').trim();
    const privateKey = normalizePrivateKey(env.FIREBASE_PRIVATE_KEY || '');

    return {
        projectId,
        clientEmail,
        privateKey,
    };
};

module.exports = {
    getFirebaseServiceAccount,
    normalizePrivateKey,
    stripWrappingQuotes,
};
