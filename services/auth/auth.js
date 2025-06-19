import API from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const generateSessionId = () => {
  return uuidv4().replace(/-/g, '');
};

export const signup = async ({ email, c_Name, captchaToken }) => {
  try {
    console.log('Signup params:', { email, c_Name, captchaToken });

    const sessionId = await AsyncStorage.getItem('sessionId') || generateSessionId();
    await AsyncStorage.setItem('sessionId', sessionId);

    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      c_Name: c_Name,
      'h-captcha-response': captchaToken || '',
    };

    console.log('Signup Request Payload:', JSON.stringify(payload, null, 2));
    console.log('Making API Request to /rest/v1/app_createuser');

    const response = await API.post('/rest/v1/app_createuser', payload);

    console.log('Signup API Response:', JSON.stringify(response, null, 2));

    if (response.status) {
      await AsyncStorage.multiSet([
        ['c_Email', response.c_Email || email],
        ['cid', response.cid || ''],
      ]);
      return {
        success: true,
        data: response,
      };
    } else {
      return {
        success: false,
        message: response.res || 'Signup failed',
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
      message: errorMessage,
    };
  }
};

export const resetPassword = async ({ userIdentifier, captchaToken }) => {
  try {
    const sessionId = await AsyncStorage.getItem('sessionId') || generateSessionId();
    await AsyncStorage.setItem('sessionId', sessionId);

    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: userIdentifier.includes('@') ? userIdentifier : undefined,
      user_id: userIdentifier.includes('@') ? undefined : userIdentifier,
      'h-captcha-response': captchaToken || '',
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const response = await API.post('/rest/v1/app_resetpassword', payload);
    
    if (!response.status) {
      throw new Error(response.res || 'Password reset failed');
    }
    
    return { 
      success: true, 
      message: response.res || 'New password sent to your email' 
    };
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.res || 
      'Failed to reset password. Please try again later.'
    );
  }
};

export const login = async ({ email, password, captchaToken }) => {
  try {
    await AsyncStorage.removeItem('sessionId');
    const sessionId = generateSessionId();
    await AsyncStorage.setItem('sessionId', sessionId);

    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      c_Pwd: password,
      'h-captcha-response': captchaToken || '',
    };

    console.log('Login Request Payload:', JSON.stringify(payload, null, 2));
    console.log('Making API Request to /rest/v1/app_userlogin');

    // const response = await API.post('/rest/v1/app_userlogin', payload);
    const response = await API.post('/rest/v1/app_userlogin', payload, {
      headers: { 'Content-Type': 'application/json' },
      // validateStatus: () => true,
    });

    console.log('Login API Response:', JSON.stringify(response, null, 2));

    // const setCookie = response.headers?.['set-cookie'];
    // if (setCookie) {
    //   let sid;
    //   if (Array.isArray(setCookie)) {
    //     const sidCookie = setCookie.find((cookie) => cookie.includes('sid='));
    //     if (sidCookie) {
    //       const sidMatch = sidCookie.match(/sid=([^;]+)/);
    //       sid = sidMatch ? sidMatch[1] : null;
    //     }
    //   } else if (typeof setCookie === 'string') {
    //     const sidMatch = setCookie.match(/sid=([^;]+)/);
    //     sid = sidMatch ? sidMatch[1] : null;
    //   }
    //   if (sid) {
    //     await AsyncStorage.setItem('sessionId', sid);
    //     console.log('Stored sessionId from set-cookie:', sid);
    //   }
    // }

    if (response.status) {
      await AsyncStorage.multiSet([
        ['c_Email', response.data.c_Email || email],
        ['cid', response.data.cid || ''],
        ['c_Name', response.data.c_Name || ''],
        ['c_region', response.data.c_region || 'hk'],
        ['c_lang', response.data.c_lang || 'en'],
        ['c_clientcur', response.data.c_clientcur || 'HKD'],
        ['isLoggedIn', 'true'],
      ]);

      return {
        success: true,
        data: response,
        message: response.res || 'Login successful',
      };
    } else {
      throw new Error(response.res || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    console.log('Error response:', JSON.stringify(error.response?.data, null, 2));
    if (error.response?.status === 401 || error.response?.status === 400) {
      await AsyncStorage.removeItem('sessionId');
    }
    return {
      success: false,
      message: error.response?.data?.res || error.message || 'Login failed. Please try again.',
    };
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'sessionId',
      'c_Email',
      'cid',
      'c_Name',
      'c_region',
      'c_lang',
      'c_clientcur',
      'isLoggedIn',
    ]);
    console.log('AsyncStorage cleared for logout');
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Failed to log out. Please try again.' };
  }
};