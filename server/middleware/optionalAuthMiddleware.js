const admin = require('firebase-admin');
const User = require('../models/User');

const optionalAuthMiddleware = async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const dbUser = await User.findOne({ firebaseUID: decodedToken.uid });

        req.user = decodedToken;
        if (dbUser) {
            req.dbUser = dbUser;
            req.user._id = dbUser._id;
        }
    } catch (_error) {
        // Ignore invalid or expired optional tokens and continue as a public request.
    }

    return next();
};

module.exports = optionalAuthMiddleware;
