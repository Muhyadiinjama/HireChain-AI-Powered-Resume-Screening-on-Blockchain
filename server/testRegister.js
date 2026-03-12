const axios = require('axios');

(async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register-noauth', {
            name: 'Test User',
            email: 'test@example.com'
        });
        console.log('Response:', response.data);
    } catch (err) {
        if (err.response) {
            console.error('Error status:', err.response.status);
            console.error('Error data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
})();
