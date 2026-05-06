// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: "https://prototypemetro.onrender.com/api"
});

export default API;
