const http = require('http');

const loginData = JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const makeRequest = (options, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await makeRequest(loginOptions, loginData);

        if (loginRes.status !== 200) {
            console.error('Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        console.log('Login successful. Token received.');

        console.log('2. Fetching Profile (getMe)...');
        const meOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const meRes = await makeRequest(meOptions);
        console.log('Profile Response:', meRes.status, meRes.data);

        if (meRes.status === 200 && meRes.data.email === 'admin@example.com') {
            console.log('SUCCESS: Profile fetched successfully!');
        } else {
            console.error('FAILURE: Profile fetch failed.');
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
};

runTest();
