import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api';
import { v4 as uuidv4 } from 'uuid';

const generateSessionId = () => {
  return uuidv4().replace(/-/g, '');
};

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "236411853963-5dusirh22slc7ekj2jpt65dubuot3s8e.apps.googleusercontent.com", 
  iosClientId: '236411853963-3v3f82rb67e77qqb1hrg6shbt1000v25.apps.googleusercontent.com', // From Google Cloud Console (required for iOS) // WE STILL TO MAKE THIS 
  // ...(Platform.OS === 'android' && {
  //   androidClientId: '236411853963-8hleu14lna6n5pn5id46cb6vu1upbe8n.apps.googleusercontent.com', // From Google Cloud Console (required for Android and server-side token verification)
  // }),
  offlineAccess: true, // If you need a server auth code for backend verification
});

export const googleLogin = async () => {
  try {
    // Check if user is already signed in
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Get the ID token or server auth code
    const { idToken, serverAuthCode } = userInfo;

    // Generate or retrieve session ID
    const sessionId = await AsyncStorage.getItem('sessionId') || generateSessionId();
    await AsyncStorage.setItem('sessionId', sessionId);

    // Prepare payload for backend
    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      id_token: idToken, // Send ID token to backend for verification
      // Optionally include serverAuthCode if your backend needs it for refresh tokens
    };

    console.log('Google Login Request Payload:', JSON.stringify(payload, null, 2));

    // Send token to your backend for verification
    const response = await API.post('/rest/v1/app_google_login', payload);

    console.log('Google Login API Response:', JSON.stringify(response, null, 2));

    if (response.status) {
      // Store user data in AsyncStorage
      await AsyncStorage.multiSet([
        ['c_Email', response.data.c_Email || userInfo.user.email],
        ['cid', response.data.cid || ''],
        ['c_Name', response.data.c_Name || userInfo.user.name || ''],
        ['c_region', response.data.c_region || 'hk'],
        ['c_lang', response.data.c_lang || 'en'],
        ['c_clientcur', response.data.c_clientcur || 'HKD'],
        ['isLoggedIn', 'true'],
      ]);

      return {
        success: true,
        data: response,
        message: response.res || 'Google login successful',
      };
    } else {
      throw new Error(response.res || 'Google login failed');
    }
  } catch (error) {
    console.error('Google login error:', error);

    // Handle specific Google Sign-In errors
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, message: 'Google sign-in was cancelled' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, message: 'Google sign-in is in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, message: 'Play services not available' };
    }

    return {
      success: false,
      message: error.response?.data?.res || error.message || 'Google login failed. Please try again.',
    };
  }
};

// Optional: Sign out from Google
export const googleSignOut = async () => {
  try {
    await GoogleSignin.signOut();
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
    console.log('Google sign-out successful');
    return { success: true, message: 'Google sign-out successful' };
  } catch (error) {
    console.error('Google sign-out error:', error);
    return { success: false, message: 'Failed to sign out from Google. Please try again.' };
  }
};