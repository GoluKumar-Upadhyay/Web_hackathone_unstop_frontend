// src/Services/ApiServices.ts
import axios from 'axios';

const ApiServices = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    maxRedirects: 5,
  },
});

export default ApiServices;