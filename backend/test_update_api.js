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

        // 2. Create a temporary student
        console.log('2. Creating temporary student...');
        const studentData = JSON.stringify({
            name: 'Temp Student',
            email: 'tempstudent@example.com',
            password: 'password123',
            department: 'CS',
            year: '1st'
        });

        const createOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/student',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': studentData.length,
                'Authorization': `Bearer ${token}`
            }
        };

        const createRes = await makeRequest(createOptions, studentData);
        if (createRes.status !== 201) {
            // If user already exists, try to find it (but we don't have a find by email endpoint easily accessible here without listing all)
            // For simplicity, let's assume it might fail if exists.
            console.log('Create failed (maybe exists):', createRes.data);
        } else {
            console.log('Student created:', createRes.data._id);
        }

        // Get the ID (either from create or we need to fetch users to find it)
        // Let's fetch all users to find our temp student
        console.log('3. Fetching users to find ID...');
        const getOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/users',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const usersRes = await makeRequest(getOptions);
        const tempUser = usersRes.data.find(u => u.email === 'tempstudent@example.com');

        if (!tempUser) {
            console.error('Temp user not found!');
            return;
        }

        console.log('Temp user ID:', tempUser._id);

        // 3. Update the student
        console.log('4. Updating student...');
        const updateData = JSON.stringify({
            name: 'Updated Student Name',
            department: 'IT',
            year: '2nd'
        });

        const updateOptions = {
            hostname: 'localhost',
            port: 5000,
            path: `/api/users/${tempUser._id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': updateData.length,
                'Authorization': `Bearer ${token}`
            }
        };

        const updateRes = await makeRequest(updateOptions, updateData);
        console.log('Update Response:', updateRes.status, updateRes.data);

        if (updateRes.status === 200 && updateRes.data.name === 'Updated Student Name') {
            console.log('SUCCESS: User updated successfully!');
        } else {
            console.error('FAILURE: User update failed.');
        }

        // 4. Cleanup (Delete)
        console.log('5. Deleting temp user...');
        const deleteOptions = {
            hostname: 'localhost',
            port: 5000,
            path: `/api/users/${tempUser._id}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        await makeRequest(deleteOptions);
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Test Error:', error);
    }
};

runTest();
