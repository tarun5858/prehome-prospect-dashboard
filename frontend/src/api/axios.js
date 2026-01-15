import axios from 'axios';

const API = axios.create({
  // If we are on Render, use relative path '/api'
  // If we are on localhost, use 'http://localhost:5000/api'
  baseURL: import.meta.env.MODE === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api',
  withCredentials: true
});

export default API;