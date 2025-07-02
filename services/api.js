import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pre-configured instance 
const API = axios.create({
  baseURL: 'https://blindly-beloved-muskox.ngrok-free.app',
  // baseURL: 'https://algogene.com',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor for session ID - runs before every API call
API.interceptors.request.use(async (config) => {
  // Get credentials from secure storage
  const credentials = {
    user: 'AGBOT1',
    api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff'
  };
  
  // Add required auth headers
  config.headers.user = credentials.user;
  config.headers.api_key = credentials.api_key;
  
  // Add session ID if available
  try {
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (sessionId) {
      config.headers.sid = sessionId;
      config.headers.Cookie = `sid=${sessionId}`;
      // jar.setCookie(`sid=${sessionId}; Path=/`, config.baseURL);
    }
  } catch (error) {
    console.log('Error reading sessionId:', error);
  }
  
  // Add timestamp to prevent caching
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  return config;
});

// Response interceptor - handles all responses
// API.interceptors.response.use(
//   response => response.data,
//   error => {
//     if (error.response?.status === 401 || error.response?.status === 400) {
//       console.log('Auth failed, clearing session');
//       AsyncStorage.removeItem('sessionId');
//     }
//     return Promise.reject(error);
//   }
// );

API.interceptors.response.use(
  (response) => response.data || {},
  async (error) => {
    if (error.response?.status === 401 || (error.response?.status === 400 && error.response?.data?.res === 'Unauthorized')) {
      console.log('Auth failed, clearing session');
      await AsyncStorage.removeItem('sessionId');
    }
    console.log('API Error Response:', JSON.stringify(error.response?.data, null, 2));
    return Promise.reject(error);
  }
);

// export default API;

// API.interceptors.response.use(
//   async (response) => {
//     // Extract sid from set-cookie header
//     const setCookie = response.headers?.['set-cookie'];
//     if (setCookie) {
//       let sid;
//       if (Array.isArray(setCookie)) {
//         const sidCookie = setCookie.find((cookie) => cookie.includes('sid='));
//         if (sidCookie) {
//           const sidMatch = sidCookie.match(/sid=([^;]+)/);
//           sid = sidMatch ? sidMatch[1] : null;
//         }
//       } else if (typeof setCookie === 'string') {
//         const sidMatch = setCookie.match(/sid=([^;]+)/);
//         sid = sidMatch ? sidMatch[1] : null;
//       }
//       if (sid) {
//         await AsyncStorage.setItem('sessionId', sid);
//         console.log('Updated sessionId from set-cookie:', sid);
//       }
//     }
//     return response.data;
//   },
//   async (error) => {
//     if (error.response?.status === 401 || (error.response?.status === 400 && error.response?.data?.res === 'Unauthorized')) {
//       console.log('Auth failed, clearing session');
//       await AsyncStorage.removeItem('sessionId');
//     }
//     return Promise.reject(error);
//   }
// );

export default API;
