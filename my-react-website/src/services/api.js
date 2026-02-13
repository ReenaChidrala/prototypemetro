// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:5000/api" // ← yeh correct base URL hai
});

export default API;
