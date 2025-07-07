import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Update to Render or backend URL later
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
