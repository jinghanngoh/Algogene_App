// Test out the public marketplace endpoint 
// MarketplaceApi.js
import API from './api';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a 32-character session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
// const generateSessionId = () => {
//   return uuidv4().replace(/-/g, ''); // 32 chars
// };

// Delay function for retry logic
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 3.1) QUERY LIST OF TRADING BOTS (PUBLIC)
export const fetchPublicAlgos = async (retries = 1) => {
  try {
    // console.log('Making API Request to /rest/v1/app_mp_topalgo');
    
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      // console.log(`Generated new sessionId: ${sessionId}`);
      await AsyncStorage.setItem('sessionId', sessionId);
    }
    const cid = await AsyncStorage.getItem('cid') || 'AGBOTKOlnrdLJ';
    // console.log('Using sessionId:', sessionId);
    // console.log('Using cid:', cid);
    
    const response = await API.get('/rest/v1/app_mp_topalgo', {
      params: {
        user: 'AGBOT1',
        api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        sid: sessionId,
      },
    });

    if (!response?.status) {
      throw new Error(response?.res || 'API returned false status');
    }

    return {
      status: response.status,
      count: response.count,
      data: response.res,
    };
  } catch (error) {
    if (!(error.response?.status === 400 && error.response?.data?.res === 'Invalid session!')) {
      console.error('Error fetching public algos:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });
    }

    if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
      // console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(500);
      return fetchPublicAlgos(retries - 1);
    }

    throw error;
  }
};

// 3.2) QUERY TRADING BOT DETAILS: PERFORMANCE STATISTICS (PUBLIC)
export const fetchAlgoPerformance = async (algoId, accountingDate = null, retries = 3) => {
  try {
    if (!algoId || typeof algoId !== 'string' || algoId.length < 10) {
      throw new Error(`Invalid algo_id: ${algoId}`);
    }

    // Check cache first
    const cacheKey = `performance_${algoId}_${accountingDate || 'latest'}`;

    // console.log(`Making API Request to /rest/v1/strategy_stats for algo_id: ${algoId}, acdate: ${accountingDate || 'latest'}`);
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      // console.log(`Generated new sessionId: ${sessionId}`);
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    const response = await API.get('/rest/v1/strategy_stats', {
      params: {
        user: 'AGBOT1',
        api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        sid: sessionId,
        algo_id: algoId,
        acdate: accountingDate
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Validate response
    if (!response?.performance) {
      throw new Error('Performance data not available.');
    }

    // Log formatted response
    // logFullApiResponse(response);

    // Cache the full response
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(response));
    } catch (cacheError) {
      console.warn(`Failed to cache performance data for algo_id ${algoId}:`, cacheError.message);
    }

    return response; // Return full response (performance and setting)
  } catch (error) {
    console.error(`Error fetching algorithm performance for algo_id ${algoId}:`, error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      request: error.request,
      message: error.message,
    });

    // Handle rate limit error
    if (error.response?.status === 400 && error.response?.data?.res?.includes('Exceed maximum access count') && retries > 0) {
      console.log(`Rate limit hit. Retrying in 65 seconds... (${retries} retries left)`);
      await delay(65000); // Wait 65 seconds
      return fetchAlgoPerformance(algoId, accountingDate, retries - 1);
    }

    // Handle invalid session
    if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
      console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(500);
      return fetchAlgoPerformance(algoId, accountingDate, retries - 1);
    }

    throw error;
  }
};

// 3.3) QUERY TRADING BOT DETAILS : DAILY RETURN (PUBLIC)
export const fetchAlgoDailyReturns = async (algoId, accountingDate = null, isExtrapolate = false, retries = 3) => {
  try {
    // Check cache first
    const cacheKey = `daily_returns_${algoId}_${accountingDate || 'latest'}_${isExtrapolate}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      // console.log(`Returning cached daily returns for algo_id: ${algoId}`);
      return JSON.parse(cachedData);
    }

    // console.log(`Making API Request to /rest/v1/strategy_return for algo_id: ${algoId}`);
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    const response = await API.get('/rest/v1/strategy_return', {
      params: {
        user: 'AGBOT1',
        api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        sid: sessionId,
        algo_id: algoId,
        acdate: accountingDate,
        isExtrapolate: isExtrapolate
      }
    });

    if (!response.res) {
      throw new Error('Daily returns data not available.');
    }

    // Cache the response
    await AsyncStorage.setItem(cacheKey, JSON.stringify(response.res));
    return response.res; // Returns the list of daily return objects
  } catch (error) {
    console.error(`Error fetching daily returns for algo_id ${algoId}:`, error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      request: error.request,
      message: error.message
    });

    // Handle rate limit error
    if (error.response?.status === 400 && error.response?.data?.res?.includes('Exceed maximum access count')) {
      if (retries > 0) {
        console.log(`Rate limit hit. Retrying in 60 seconds... (${retries} retries left)`);
        await delay(60000); // Wait 60 seconds
        return fetchAlgoDailyReturns(algoId, accountingDate, isExtrapolate, retries - 1);
      } else {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

    // Handle invalid session
    if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
      console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(500);
      return fetchAlgoDailyReturns(algoId, accountingDate, isExtrapolate, retries - 1);
    }

    throw error;
  }
};

// export const subscribeToAlgorithm = async (algoId, accountId, email, retries = 3) => {
//   try {
//     console.log('=== START SUBSCRIPTION PROCESS ===');
//     console.log('Params:', { algoId, accountId, email });
    
//     // Validation
//     if (!algoId) throw new Error('Missing algoId parameter');
//     if (!accountId) throw new Error('Missing accountId parameter');
//     if (!email) throw new Error('Missing email parameter');

//     // Get session ID
//     let sessionId = await AsyncStorage.getItem('sessionId');
//     console.log('Retrieved sessionId:', sessionId);
//     if (!sessionId) {
//       sessionId = generateSessionId();
//       await AsyncStorage.setItem('sessionId', sessionId);
//       console.log('Generated new sessionId:', sessionId);
//     }

//     // Create the payload with exactly the fields you specified
//     const payload = {
//       api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//       user: 'AGBOT1',
//       sid: sessionId,
//       c_Email: email,
//       algo_id: algoId,
//       account_id: accountId
//     };

//     console.log('Subscription payload:', JSON.stringify(payload, null, 2));

//     // Make the API request using your API service
//     console.log('Making POST request to /rest/v1/app_subscribe_strategy');
    
//     // Use a more direct approach to see the raw response
//     const axios = require('axios');
//     const response = await axios.post(
//       'https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_subscribe_strategy',
//       payload,
//       { 
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         } 
//       }
//     );
    
//     console.log('Raw API response status:', response.status);
//     console.log('Raw API response headers:', JSON.stringify(response.headers, null, 2));
//     console.log('Raw API response data (stringify):', JSON.stringify(response.data, null, 2));
//     console.log('Raw API response data (direct):', response.data);
//     console.log('Raw API response type:', typeof response.data);
    
//     // Check for the expected JSON structure with res, status, and tid
//     if (response.data && typeof response.data === 'object' && 'res' in response.data && 'status' in response.data && 'tid' in response.data) {
//       console.log('Found expected JSON structure with payment link!');
//       return {
//         status: response.data.status,
//         paymentLink: response.data.res,
//         ticketId: response.data.tid
//       };
//     }
    
//     // If the API returns just a boolean
//     if (typeof response.data === 'boolean') {
//       console.log('API returned boolean value:', response.data);
      
//       // For testing purposes, return a mock payment link when the API returns true
//       if (response.data === true) {
//         console.log('API returned true, creating mock payment link for testing');
//         return {
//           status: true,
//           paymentLink: 'https://checkout.stripe.com/c/pay/cs_test_mockPaymentLink',
//           ticketId: 'MOCK_TICKET_' + Date.now()
//         };
//       }
      
//       // Return a structured response even for boolean API result
//       return {
//         status: response.data,
//         paymentLink: null,
//         ticketId: 'TICKET_' + Date.now()
//       };
//     }
    
//     // If we got an object response but not the expected structure
//     if (response.data && typeof response.data === 'object') {
//       console.log('Got object response but not the expected structure');
//       return {
//         status: response.data.status || false,
//         paymentLink: response.data.res || null,
//         ticketId: response.data.tid || null
//       };
//     }
    
//     // Default case - unknown response type
//     console.error('Unknown API response type:', typeof response.data);
//     throw new Error('Unexpected response format from API');
    
//   } catch (error) {
//     console.error('Error in subscribeToAlgorithm:', error);
    
//     if (error.response) {
//       console.error('API error response status:', error.response.status);
//       console.error('API error data:', JSON.stringify(error.response.data, null, 2));
//     }
    
//     // If we had an invalid session and have retries left, try again
//     if (error.response?.status === 400 && 
//         error.response?.data?.res === 'Invalid session!' && 
//         retries > 0) {
//       console.log(`Invalid session detected. Retrying (${retries} left)...`);
//       await AsyncStorage.removeItem('sessionId');
//       await delay(500);
//       return subscribeToAlgorithm(algoId, accountId, email, retries - 1);
//     }
    
//     throw error;
//   } finally {
//     console.log('=== END SUBSCRIPTION PROCESS ===');
//   }
// };

// export const subscribeToAlgorithm = async (algoId, accountId, email, retries = 3) => {
//   try {
//     console.log('=== START SUBSCRIPTION PROCESS ===');
//     console.log('Params:', { algoId, accountId, email });
    
//     // Validation
//     if (!algoId) throw new Error('Missing algoId parameter');
//     if (!accountId) throw new Error('Missing accountId parameter');
//     if (!email) throw new Error('Missing email parameter');

//     // First, make sure we have a valid session by logging in
//     const sessionId = await login();
//     console.log('Using sessionId after login:', sessionId);
    
//     // Create the payload with exactly the fields you specified
//     const payload = {
//       api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//       user: 'AGBOT1',
//       sid: sessionId,
//       c_Email: email,
//       algo_id: algoId,
//       account_id: accountId
//     };

//     console.log('Subscription payload:', JSON.stringify(payload, null, 2));

//     // Make the API request using your API service
//     console.log('Making POST request to /rest/v1/app_subscribe_strategy');
    
//     // Use a more direct approach to see the raw response
//     const axios = require('axios');
//     const response = await axios.post(
//       'https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_subscribe_strategy',
//       payload,
//       { 
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         } 
//       }
//     );
    
//     console.log('Raw API response status:', response.status);
//     console.log('Raw API response headers:', JSON.stringify(response.headers, null, 2));
//     console.log('Raw API response data (stringify):', JSON.stringify(response.data, null, 2));
//     console.log('Raw API response data (direct):', response.data);
//     console.log('Raw API response type:', typeof response.data);
    
//     // Check for the expected JSON structure with res, status, and tid
//     if (response.data && typeof response.data === 'object' && 'res' in response.data && 'status' in response.data && 'tid' in response.data) {
//       console.log('Found expected JSON structure with payment link!');
//       return {
//         status: response.data.status,
//         paymentLink: response.data.res,
//         ticketId: response.data.tid
//       };
//     }
    
//     // If the API returns just a boolean
//     if (typeof response.data === 'boolean') {
//       console.log('API returned boolean value:', response.data);
      
//       // For testing purposes, return a mock payment link when the API returns true
//       if (response.data === true) {
//         console.log('API returned true, creating mock payment link for testing');
//         return {
//           status: true,
//           paymentLink: 'https://checkout.stripe.com/c/pay/cs_test_mockPaymentLink',
//           ticketId: 'MOCK_TICKET_' + Date.now()
//         };
//       }
      
//       // Return a structured response even for boolean API result
//       return {
//         status: response.data,
//         paymentLink: null,
//         ticketId: 'TICKET_' + Date.now()
//       };
//     }
    
//     // If we got an object response but not the expected structure
//     if (response.data && typeof response.data === 'object') {
//       console.log('Got object response but not the expected structure');
//       return {
//         status: response.data.status || false,
//         paymentLink: response.data.res || null,
//         ticketId: response.data.tid || null
//       };
//     }
    
//     // Default case - unknown response type
//     console.error('Unknown API response type:', typeof response.data);
//     throw new Error('Unexpected response format from API');
    
//   } catch (error) {
//     console.error('Error in subscribeToAlgorithm:', error);
    
//     if (error.response) {
//       console.error('API error response status:', error.response.status);
//       console.error('API error data:', JSON.stringify(error.response.data, null, 2));
//     }
    
//     // If we had an invalid session and have retries left, try again
//     if (error.response?.status === 400 && 
//         error.response?.data?.res === 'Invalid session!' && 
//         retries > 0) {
//       console.log(`Invalid session detected. Retrying (${retries} left)...`);
//       await AsyncStorage.removeItem('sessionId');
//       await delay(500);
//       return subscribeToAlgorithm(algoId, accountId, email, retries - 1);
//     }
    
//     throw error;
//   } finally {
//     console.log('=== END SUBSCRIPTION PROCESS ===');
//   }
// };
export const subscribeToAlgorithm = async (algoId, accountId, email, retries = 3) => {
  try {
    if (!algoId || !accountId || !email) {
      throw new Error('Missing required parameters: algoId, accountId or email');
    }

    // Get session ID
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    // Create the API payload
    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      algo_id: algoId,
      account_id: accountId,
    };

    // Make the API request
    const response = await API.post('/rest/v1/app_subscribe_strategy', payload);
    
    // If the API returns a boolean
    if (typeof response.data === 'boolean') {
      return response.data;
    }
    
    // If the API returns an object with status, res, tid
    if (response.data && typeof response.data === 'object') {
      return {
        status: response.data.status || false,
        paymentLink: response.data.res || null,
        ticketId: response.data.tid || null
      };
    }
    
    // Default case
    return response.data;
    
  } catch (error) {
    console.error('Error subscribing to algorithm:', error);
    
    // Handle invalid session
    if (error.response?.status === 400 && 
        error.response?.data?.res === 'Invalid session!' && 
        retries > 0) {
      console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(500);
      return subscribeToAlgorithm(algoId, accountId, email, retries - 1);
    }
    
    throw error;
  }
};


// // 3.4) SUBSCRIBE TRADING BOT (PRIVATE)
// export const subscribeToAlgorithm = async (algoId, accountId, email, retries = 3) => {
//   console.log('DEBUGLOG: subscribeToAlgorithm function called');
//   console.log('DEBUGLOG: params:', { algoId, accountId, email, retries });
  
//   try {
//     // Basic parameter validation
//     if (!accountId || !email) {
//       console.log('DEBUGLOG: Missing required parameters');
//       throw new Error('Missing required parameters: accountId or email');
//     }

//     // Get session ID
//     let sessionId = await AsyncStorage.getItem('sessionId');
//     console.log('DEBUGLOG: retrieved sessionId:', sessionId);
    
//     if (!sessionId) {
//       sessionId = generateSessionId();
//       console.log('DEBUGLOG: generated new sessionId:', sessionId);
//       await AsyncStorage.setItem('sessionId', sessionId);
//     }

//     // Create payload
//     const payload = {
//       api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//       user: 'AGBOT1',
//       sid: sessionId,
//       c_Email: email,
//       algo_id: "jjvp5_qrwkyntz_6194", // Using hardcoded value
//       account_id: accountId,
//     };
    
//     console.log('DEBUGLOG: created payload:', JSON.stringify(payload));

//     // Make API request
//     console.log('DEBUGLOG: making API request');
//     const response = await API.post('/rest/v1/app_subscribe_strategy/', payload);
//     console.log('DEBUGLOG: received API response:', JSON.stringify(response.data));
    
//     // Check response status
//     if (!response.data?.status) {
//       console.log('DEBUGLOG: API response status is falsy:', JSON.stringify(response.data));
//       throw new Error(response.data?.res || 'Subscription failed');
//     }

//     // Return success result
//     console.log('DEBUGLOG: subscription successful');
//     return {
//       status: response.data.status,
//       paymentLink: response.data.res,
//       ticketId: response.data.tid,
//     };
//   } catch (error) {
//     // Error handling
//     console.log('DEBUGLOG: caught error:', error.message);
//     console.log('DEBUGLOG: error details:', error);
    
//     if (error.response) {
//       console.log('DEBUGLOG: error response data:', JSON.stringify(error.response.data));
//       console.log('DEBUGLOG: error response status:', error.response.status);
//     }

//     // Retry logic for invalid session
//     if (error.response?.status === 400 && 
//         error.response?.data?.res === 'Invalid session!' && 
//         retries > 0) {
//       console.log('DEBUGLOG: invalid session, will retry');
//       await AsyncStorage.removeItem('sessionId');
//       await delay(500);
//       return subscribeToAlgorithm(algoId, accountId, email, retries - 1);
//     }

//     console.log('DEBUGLOG: throwing error from catch block');
//     throw error;
//   } finally {
//     console.log('DEBUGLOG: subscribeToAlgorithm function completed');
//   }
// };
// export const subscribeToAlgorithm = async (algoId, accountId, email, retries = 3) => {
//   try {
//     if (!accountId || !email) {
//       throw new Error('Missing required parameters: accountId or email');
//     }

//     let sessionId = await AsyncStorage.getItem('sessionId');
//     if (!sessionId) {
//       sessionId = generateSessionId();
//       await AsyncStorage.setItem('sessionId', sessionId);
//     }

//     console.log('🚀 Subscription request with:', { 
//       passedAlgoId: algoId, 
//       usingHardcodedAlgoId: "jjvp5_qrwkyntz_6194",
//       accountId, 
//       email, 
//       sessionId 
//     });

//     const payload = {
//       api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//       user: 'AGBOT1',
//       sid: sessionId,
//       c_Email: email,
//       algo_id: "jjvp5_qrwkyntz_6194", 
//       account_id: accountId,
//     };

//     console.log('🚀 Subscription payload:', payload);

//     const response = await API.post('/rest/v1/app_subscribe_strategy/', payload);
    
//     console.log('🚀 Subscription response:', response.data);

//     if (!response.data?.status) {
//       throw new Error(response.data?.res || 'Subscription failed');
//     }

//     return {
//       status: response.data.status,
//       paymentLink: response.data.res,
//       ticketId: response.data.tid,
//     };
//   } catch (error) {
//     console.error('🚀 Error subscribing to algorithm:', error);
//     console.error('🚀 Error details:', {
//       response: error.response?.data,
//       status: error.response?.status,
//       message: error.message,
//     });

//     if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
//       console.log(`🚀 Invalid session detected. Retrying (${retries} left)...`);
//       await AsyncStorage.removeItem('sessionId');
//       await delay(500);
//       return subscribeToAlgorithm(algoId, accountId, email, retries - 1);
//     }

//     throw error;
//   }
// };

// 3.5) CHECK PAYMENT STATUS (PRIVATE)
export const checkPaymentStatus = async (ticketId, email, retries = 3) => {
  try {
    if (!ticketId || !email) {
      throw new Error('Missing required parameters: ticketId or email');
    }

    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    const response = await API.get('/rest/v1/app_payment_status', {
      params: {
        app_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        user: 'AGBOT1',
        wid: sessionId,
        email: email,
        tid: ticketId,
      },
    });

    if (!response.data?.status) {
      throw new Error(response.data?.res || 'Payment status check failed');
    }

    return {
      status: response.data.status,
      paymentStatus: response.data.yes?.status,
      currency: response.data.yes?.cur,
      amount: response.data.yes?.amt,
      settleTime: response.data.yes?.settle_time,
      ticketId: response.data.yes?.tid,
    };
  } catch (error) {
    if (!(error.response?.status === 400 && error.response?.data?.res === 'Invalid session!')) {
      console.error('Error checking payment status:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });
    }

    if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
      console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(500);
      return checkPaymentStatus(ticketId, email, retries - 1);
    }

    throw error;
  }
};

export const login = async () => {
  try {
    console.log('Logging in to get a valid session ID...');
    
    const payload = {
      user: 'AGBOT1',
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      c_Email: 'thegohrilla@gmail.com',
    };
    
    const axios = require('axios');
    const response = await axios.post(
      'https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_userlogin',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('Login response:', response.data);
    
    if (response.data && response.data.status && response.data.sid) {
      // Save the session ID from the login response
      await AsyncStorage.setItem('sessionId', response.data.sid);
      console.log('Login successful, saved sessionId:', response.data.sid);
      return response.data.sid;
    } else {
      console.error('Login failed, invalid response:', response.data);
      throw new Error('Login failed: Invalid response');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Login error status:', error.response.status);
      console.error('Login error data:', error.response.data);
    }
    throw error;
  }
};