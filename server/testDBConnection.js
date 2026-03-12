const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing MongoDB connection to:', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    dbName: 'hirechain',
    serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 10
})
    .then(() => {
        console.log('SUCCESS: MongoDB is connected');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: MongoDB Connection Error:');
        console.error(err);
        process.exit(1);
    });
