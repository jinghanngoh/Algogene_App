
// // export const fetchStrategyStats = async (algo_id) => {
// //   try {
// //     console.log('Making API Request to /rest/v1/strategy_stats');
    
// //     // Get session ID
// //     let sessionId = await AsyncStorage.getItem('sessionId');
// //     if (!sessionId) {
// //       sessionId = generateSessionId();
// //       await AsyncStorage.setItem('sessionId', sessionId);
// //     }
    
// //     const response = await API.get('/rest/v1/strategy_stats', {
// //       params: {
// //         user: 'AGBOT1',
// //         api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
// //         sid: sessionId,
// //         algo_id: algo_id
// //       }
// //     });
    
// //     console.log('Strategy Stats API Response:', response);

// //     if (!response.status) {
// //       throw new Error(response.res || 'API returned false status');
// //     }

// //     return response;

// //   } catch (error) {
// //     console.error('Error fetching strategy stats:', error);
// //     throw error;
// //   }
// // };





// // Request interceptor for session ID - runs before every API call
// API.interceptors.request.use(async (config) => {
//   // Get credentials from secure storage
//   const credentials = {
//     user: 'AGBOT1',
//     api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff'
//   };
  
//   // Add required auth headers
//   config.headers.user = credentials.user;
//   config.headers.api_key = credentials.api_key;
  
//   // Add session ID if available
//   try {
//     const sessionId = await AsyncStorage.getItem('sessionId');
//     if (sessionId) {
//       config.headers.sid = sessionId;
//     }
//   } catch (error) {
//     console.log('Error reading sessionId:', error);
//   }
  
//   // Add timestamp to prevent caching
//   if (config.method === 'get') {
//     config.params = {
//       ...config.params,
//       _t: Date.now()
//     };
//   }
  
//   return config;
// });

// // Response interceptor - handles all responses
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

// export default API;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pre-configured instance 
const API = axios.create({
  baseURL: 'https://algogene.com',
    headers: {
      'Content-Type': 'application/json',
      'user': 'AGBOT1',
      'api_key': '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff' 
    }
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
API.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401 || error.response?.status === 400) {
      console.log('Auth failed, clearing session');
      AsyncStorage.removeItem('sessionId');
    }
    return Promise.reject(error);
  }
);

export default API;
