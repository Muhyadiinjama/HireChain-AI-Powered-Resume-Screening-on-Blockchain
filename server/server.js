const express = require('express');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Using Google DNS to fix SRV lookup issues
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
// mongoose.set('debug', true); // Disabled for cleaner terminal output
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    dbName: 'hirechain'
})
    .then(() => {
        console.log('mongodb is connected');
    })
    .catch(err => {
        console.log('MongoDB Connection Error:', err);
    });

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/screen', require('./routes/screeningRoutes'));

app.get('/', (req, res) => {
    res.send('HireChain AI API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
