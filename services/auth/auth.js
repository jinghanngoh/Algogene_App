import API from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Generate a 32-character session ID
const generateSessionId = () => {
  return uuidv4().replace(/-/g, ''); // 32 chars
};

// Signup function for ALGOGENE API
export const signup = async ({ username, email, c_Name, password, captchaToken }) => {
  try {

    console.log('Signup params:', { username, email, c_Name, captchaToken });

    const sessionId = await AsyncStorage.getItem('sessionId') || generateSessionId();
    await AsyncStorage.setItem('sessionId', sessionId);

    // Get or generate session ID
    // let sessionId = await AsyncStorage.getItem('sessionId');
    // if (!sessionId) {
    //   sessionId = generateSessionId();
    //   await AsyncStorage.setItem('sessionId', sessionId);
    // }

    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      c_Name: c_Name,
      'h-captcha-response': captchaToken 
      // 'h-captcha-response': captchaToken || '', // Uncomment for hCaptcha
    };

    console.log('Signup Request Payload:', JSON.stringify(payload, null, 2));
    console.log('Making API Request to /rest/v1/app_createuser');

    const response = await API.post('/rest/v1/app_createuser', payload, {
        headers: {
          'Content-Type': 'application/json',
          'user': 'AGBOT1',
          'api_key': '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
          'sid': sessionId
        }
      });

    console.log('Signup API Response:', JSON.stringify(response, null, 2));

    if (response.status) {
      // Store response data for activation/login
    //   await AsyncStorage.setItem('c_Email', response.c_Email);
    //   await AsyncStorage.setItem('user', response.user);
    //   await AsyncStorage.setItem('cid', response.cid); 
    await AsyncStorage.multiSet([
        ['c_Email', response.c_Email],
        ['cid', response.cid],
        ]);
      return {
        success: true,
        data: response,
      };
    } else {
      return {
        success: false,
        message: response.res,
      };
    }
  } catch (error) {
    console.error('Error during signup:', error);
    let errorMessage = 'An error occurred during registration';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Registration endpoint not found. Please check the API URL.';
      } else {
        errorMessage = error.response.data?.res || error.response.statusText;
      }
    }

    return {
      success: false,
      message: error.response?.data?.res || error.message || 'An error occurred during registration',
    };
  }
};