const User = require('../models/User');

const roleMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findOne({ firebaseUID: req.user.uid });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found in database' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ success: false, message: 'Unauthorized: insufficient permissions' });
            }

            // Attaching DB user to request object
            req.dbUser = user;
            next();
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
};

module.exports = roleMiddleware;
