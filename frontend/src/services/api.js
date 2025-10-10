// services/api.js
import axios from 'axios';

// FIX: Set the correct base URL explicitly.
// Server is running on http://localhost:5000 and uses the /api prefix.
const API_BASE_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;