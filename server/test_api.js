const fetch = require('node-fetch');

const data = {
    name: "Test User",
    email: "test@example.com",
    role: "student",
    department: "CS",
    password: "password123"
};

async function test() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Body:", result);
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

test();
