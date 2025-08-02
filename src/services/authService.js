import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw new Error('Login failed. Please check your credentials.');
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return JSON.parse(atob(token.split('.')[1])); // Decode the token to get user info
    }
    return null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};