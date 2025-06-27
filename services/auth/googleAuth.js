// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { v4 as uuidv4 } from 'uuid';
// import API from '../api'; 

// // Generate a session ID
// const generateSessionId = () => {
//   return uuidv4().replace(/-/g, '');
// };

// // Configure Google Sign-In
// GoogleSignin.configure({
//   webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with your Google Cloud Web Client ID
//   offlineAccess: false,
//   iosClientId: 'YOUR_IOS_CLIENT_ID', // Optional, for iOS
// });

// // Google Sign-In function
// export const googleLogin = async () => {
//   try {
//     // Check if the user is already signed in
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();
    
//     // Extract user details
//     const { email, givenName, familyName } = userInfo.user;
//     const c_Name = `${givenName} ${familyName}`.trim();

//     // Generate and store session ID
//     const sessionId = generateSessionId();
//     await AsyncStorage.setItem('sessionId', sessionId);

//     // Prepare payload for ALGOGENE API
//     const payload = {
//       api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//       user: 'AGBOT1',
//       sid: sessionId,
//       c_Email: email,
//       c_Name, // Use Google-provided name for signup
//       'h-captcha-response': '', // Skipping hCaptcha for prototype
//     };

//     console.log('Google Login Payload:', JSON.stringify(payload, null, 2));

//     // Attempt to log in with ALGOGENE API
//     let response = await API.post('/rest/v1/app_userlogin', {
//       ...payload,
//       c_Pwd: '', // Password is empty as Google Sign-In doesn't provide one
//     }, {
//       headers: { 'Content-Type': 'application/json' },
//     });

//     console.log('Login API Response:', JSON.stringify(response, null, 2));

//     if (response.status) {
//       // Successful login
//       await AsyncStorage.multiSet([
//         ['c_Email', response.c_Email || email],
//         ['cid', response.cid || ''],
//         ['c_Name', response.c_Name || c_Name],
//         ['c_region', response.c_region || 'hk'],
//         ['c_lang', response.c_lang || 'en'],
//         ['c_clientcur', response.c_clientcur || 'HKD'],
//         ['isLoggedIn', 'true'],
//       ]);

//       return {
//         success: true,
//         data: response,
//         message: response.res || 'Google login successful',
//       };
//     } else {
//       // Login failed, attempt to sign up
//       console.log('Login failed, attempting signup...');
//       response = await API.post('/rest/v1/app_createuser', payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       console.log('Signup API Response:', JSON.stringify(response, null, 2));

//       if (response.status) {
//         await AsyncStorage.multiSet([
//           ['c_Email', response.c_Email || email],
//           ['cid', response.cid || ''],
//           ['c_Name', c_Name],
//           ['c_region', 'hk'],
//           ['c_lang', 'en'],
//           ['c_clientcur', 'HKD'],
//           ['isLoggedIn', 'true'],
//         ]);

//         return {
//           success: true,
//           data: response,
//           message: response.res || 'Google signup successful',
//         };
//       } else {
//         throw new Error(response.res || 'Google signup failed');
//       }
//     }
//   } catch (error) {
//     console.error('Google login error:', error);

//     // Handle specific Google Sign-In errors
//     if (error.code) {
//       switch (error.code) {
//         case statusCodes.SIGN_IN_CANCELLED:
//           return { success: false, message: 'Google Sign-In cancelled' };
//         case statusCodes.IN_PROGRESS:
//           return { success: false, message: 'Google Sign-In is in progress' };
//         case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//           return { success: false, message: 'Play Services not available' };
//         default:
//           return { success: false, message: 'Google Sign-In failed. Please try again.' };
//       }
//     }

//     // Handle API errors
//     return {
//       success: false,
//       message: error.response?.data?.res || error.message || 'Google login failed. Please try again.',
//     };
//   }
// };