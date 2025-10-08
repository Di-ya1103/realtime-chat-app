import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url); // Debug API calls
  return config;
});

export const login = (username) => API.post('/auth/login', { username }).then((r) => r.data);
export const getUsers = () => API.get('/auth/users').then((r) => r.data.users);
export const getMessages = (userId, currentUserId) =>
  API.get(`/messages/history/${userId}`, { params: { currentUserId } }).then((r) => r.data.messages);

export default API;