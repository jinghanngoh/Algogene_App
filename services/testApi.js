// Test out the public marketplace endpoint 
import API from './api';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a 32-character session ID
const generateSessionId = () => {
  return uuidv4().replace(/-/g, ''); // 32 chars
};

export const fetchPublicAlgos = async () => { 
  try {
    console.log('Making API Request to /rest/v1/app_mp_topalgo');
    
    // Get or generate session ID
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }
    
    const response = await API.get('/rest/v1/app_mp_topalgo', {
      params: {
        user: 'AGBOT1',
        api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        sid: sessionId
      }
    });
    
    console.log('API Response:', response);

    if (!response.status) {
      throw new Error(response.res || 'API returned false status');
    }

    return {
      status: response.status,
      count: response.count,
      data: response.res
    };
  } catch (error) {
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
    } else if (error.request) {
      console.error('Error Request:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }
    throw error;
  }
};
