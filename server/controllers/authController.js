const User = require('../models/User');
const admin = require('firebase-admin');

// Ensure Firebase Admin is initialized (usually in server.js)
const requiresCompany = (role) => role === 'admin' || role === 'recruiter';
const sanitizeCompany = (company) => (typeof company === 'string' ? company.trim() : '');

const register = async (req, res) => {
    try {
        const { token, role, name, email, company } = req.body;
        let uid, userEmail, userName;
        const requestedRole = role || 'candidate';
        const sanitizedCompany = sanitizeCompany(company);

        if (requiresCompany(requestedRole) && !sanitizedCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required for recruiter and admin accounts.'
            });
        }

        if (token) {
            // Verify Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);
            uid = decodedToken.uid;
            userEmail = decodedToken.email;
            userName = name || decodedToken.name || decodedToken.email.split('@')[0] || 'User';
        } else {
            // Fallback for non‑Firebase registration
            if (!email || !name) {
                return res.status(400).json({ success: false, message: 'Email and name are required when token is not provided' });
            }
            uid = `noauth_${Date.now()}`; // dummy UID
            userEmail = email;
            userName = name;
        }

        // Simplified registration: always upsert with the provided details
        const user = await User.findOneAndUpdate(
            { firebaseUID: uid },
            {
                $set: {
                    name: userName,
                    email: userEmail,
                    role: requestedRole,
                    company: requiresCompany(requestedRole) ? sanitizedCompany : ''
                }
            },
            { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Registration Error:', error.stack);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This email or account is already associated with an existing user.',
                error: error.keyValue
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
const login = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;
        // Check if user exists first to avoid unnecessary updates
        let user = await User.findOne({ firebaseUID: uid });

        if (!user) {
            // If user doesn't exist, create one
            user = await User.findOneAndUpdate(
                { firebaseUID: uid },
                {
                    $setOnInsert: {
                        name: name || email?.split('@')[0] || 'User',
                        email: email,
                        role: 'candidate'
                    }
                },
                { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
            );
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Login Error:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { firebaseUID: req.user.uid },
            {
                $setOnInsert: {
                    name: req.user.name || req.user.email?.split('@')[0] || 'User',
                    email: req.user.email,
                    role: 'candidate'
                }
            },
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('getMe Error:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        if (!req.dbUser) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        const name = typeof req.body.name === 'string' ? req.body.name.trim() : req.dbUser.name;
        const company = sanitizeCompany(req.body.company);

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }

        if (requiresCompany(req.dbUser.role) && !company) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required for recruiter and admin accounts.'
            });
        }

        req.dbUser.name = name;
        req.dbUser.company = requiresCompany(req.dbUser.role) ? company : '';
        await req.dbUser.save();

        return res.status(200).json({ success: true, user: req.dbUser });
    } catch (error) {
        console.error('Update Profile Error:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const registerNoAuth = async (req, res) => {
    try {
        const { name, email, role, company } = req.body;
        if (!email || !name) {
            return res.status(400).json({ success: false, message: 'Name and email are required' });
        }
        if (requiresCompany(role || 'candidate') && !sanitizeCompany(company)) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required for recruiter and admin accounts.'
            });
        }
        // Check if user already exists
        let existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        // Create a dummy firebaseUID for non-auth users
        const dummyUID = `noauth_${Date.now()}`;
        const normalizedRole = role || 'candidate';
        const user = new User({
            name,
            email,
            role: normalizedRole,
            company: requiresCompany(normalizedRole) ? sanitizeCompany(company) : '',
            firebaseUID: dummyUID
        });
        await user.save();
        return res.status(201).json({ success: true, user });
    } catch (error) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Duplicate field error', error: error.keyValue });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getMe, updateProfile, registerNoAuth };
