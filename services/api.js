import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pre-configured instance 
const API = axios.create({
  
  // baseURL: 'https://7840b2f6f14c.ngrok-free.app',
  baseURL: 'https://blindly-beloved-muskox.ngrok-free.app',
  // baseURL: 'https://algogene.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  //withCredentials: true,
});

// Request interceptor for session ID - runs before every API call
API.interceptors.request.use(async (config) => {
  const credentials = {
    user: 'AGBOT1',
    api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
  };

  config.headers.user = credentials.user;
  config.headers.api_key = credentials.api_key;

  try {
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (sessionId) {
      config.headers.sid = sessionId;
      config.headers.Cookie = `sid=${sessionId}`;
    }
  } catch (error) {
    console.log('Error reading sessionId:', error);
  }

  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});
API.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response.data || {},
  async (error) => {
    if (error.response?.status === 401 || (error.response?.status === 400 && error.response?.data?.res === 'Unauthorized')) {
      console.log('Auth failed, clearing session');
      await AsyncStorage.removeItem('sessionId');
    }
    console.log('API Error Responsex:', JSON.stringify(error.response?.data, null, 2));
    return Promise.reject(error);
  }
);

export const login = async () => {
  try {
    const payload = {
      user: 'AGBOT1',
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      c_Email: 'thegohrilla@gmail.com',
    };
    const response = await API.post('/rest/v1/app_userlogin', payload);
    if (response.status === true) {
      const sessionId = response.sid || response.headers['set-cookie']?.find(c => c.includes('sid='))?.split('sid=')[1]?.split(';')[0];
      if (sessionId) {
        await AsyncStorage.setItem('sessionId', sessionId);
        console.log('Login successful, sessionId:', sessionId);
        return sessionId;
      }
    }
    throw new Error('Login failed: Invalid response');
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export default API;