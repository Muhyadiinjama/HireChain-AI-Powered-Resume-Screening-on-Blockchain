const admin = require('firebase-admin');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Find MongoDB user to enrich the request
        const dbUser = await User.findOne({ firebaseUID: decodedToken.uid });

        req.user = decodedToken;
        if (dbUser) {
            req.dbUser = dbUser;
            // Optionally merge for convenience
            req.user._id = dbUser._id;
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
