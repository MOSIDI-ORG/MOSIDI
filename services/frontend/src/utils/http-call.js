import axios from 'axios';

export const HTTP = axios.create({
  baseURL: process.env.VUE_APP_BASE_URI,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
})