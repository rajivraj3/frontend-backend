const API_URL = 'http://127.0.0.1:5000/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        console.log(`📡 Requesting: ${endpoint}`, options);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });
            
            console.log(`📥 Response Status: ${response.status}`);
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }

            const data = await response.json();
            console.log(`📦 Data:`, data);
            
            if (!response.ok) throw new Error(data.error || 'Something went wrong');
            return data;
        } catch (err) {
            console.error(`❌ Fetch Error:`, err);
            throw err;
        }
    },

    auth: {
        async login(email, password) {
            const data = await api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        },
        async register(userData) {
            return api.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        },
        getUser() {
            return JSON.parse(localStorage.getItem('user'));
        }
    },

    assignments: {
        async getAll() {
            return api.request('/assignments');
        },
        async create(data) {
            return api.request('/assignments', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
    },

    submissions: {
        async upload(formData) {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/submissions/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            return response.json();
        },
        async getAll() {
            return api.request('/submissions');
        }
    },

    alerts: {
        async getAll() {
            return api.request('/alerts');
        },
        async review(id, status) {
            return api.request(`/alerts/${id}/review`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        }
    }
};
