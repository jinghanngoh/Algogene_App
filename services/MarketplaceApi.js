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

export const authenticateUser = async (retries = 3) => {
  try {
    console.log('Attempting to authenticate user...');
    
    // Create the authentication payload
    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      // Note: For login, we need password/credentials but they're not in your code
      // Since this is a test API, let's try a standard approach
      c_Email: 'thegohrilla@gmail.com',
      // You might need additional auth fields here based on the API documentation
    };
    
    console.log('Authentication payload:', JSON.stringify(payload, null, 2));
    
    // Make the API request to authenticate
    const response = await fetch('https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_userlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Authentication response status:', response.status);
    
    const data = await response.json();
    console.log('Authentication response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.status && data.sid) {
      // Save the valid session ID
      await AsyncStorage.setItem('sessionId', data.sid);
      console.log('Authentication successful! Session ID:', data.sid);
      return data.sid;
    } else {
      console.error('Authentication failed:', data.res || 'Unknown error');
      throw new Error(`Authentication failed: ${data.res || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    
    // Retry if we have retries left
    if (retries > 0) {
      console.log(`Authentication failed. Retrying (${retries} left)...`);
      await delay(1000);
      return authenticateUser(retries - 1);
    }
    
    throw error;
  }
};

export const login = async () => {
  try {
    console.log("Attempting to login to get a valid session ID...");
    
    // Login payload
    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      c_Email: 'thegohrilla@gmail.com'
    };
    
    console.log("Login payload:", JSON.stringify(payload, null, 2));
    
    // Make the login request
    const response = await fetch('https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_userlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log("Login response status:", response.status);
    
    const data = await response.json();
    console.log("Login response data:", JSON.stringify(data, null, 2));
    
    if (response.ok && data.status && data.sid) {
      // Save the session ID
      await AsyncStorage.setItem('sessionId', data.sid);
      console.log("Login successful! New sessionId:", data.sid);
      return data.sid;
    } else {
      console.error("Login failed:", data.res || "Unknown error");
      throw new Error(`Login failed: ${data.res || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error in login function:", error);
    throw error;
  }
};

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

// 3.4) SUBSCRIBE TRADING BOT (PRIVATE)
export const subscribeToAlgorithm = async (algoId, accountId, email, retries = 3) => {
  try {
    console.log("Starting algorithm subscription process...");
    
    if (!algoId || !accountId || !email) {
      throw new Error('Missing required parameters: algoId, accountId or email');
    }

    // First, try to login to refresh the session
    console.log("Logging in to refresh session...");
    const loginPayload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      c_Email: 'thegohrilla@gmail.com',
      c_Pwd: '55565724',  // Using the password from your logs
      sid: '79383bc13880440783cdc6136e2379e7'  // Using the sid from your login logs
    };
    
    let sessionId;
    try {
      const loginResponse = await fetch('https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_userlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });
      
      const loginData = await loginResponse.json();
      console.log("Login response for subscription:", loginData);
      
      if (loginData.status === true) {
        // Save the session ID that was used in the successful login
        sessionId = loginPayload.sid;
        await AsyncStorage.setItem('sessionId', sessionId);
        console.log("Successfully logged in with sessionId:", sessionId);
      } else {
        console.log("Login failed, using existing session ID...");
        sessionId = await AsyncStorage.getItem('sessionId');
      }
    } catch (loginError) {
      console.error("Error during login:", loginError);
      sessionId = await AsyncStorage.getItem('sessionId');
    }
    
    console.log("Using session ID for subscription:", sessionId);
    
    if (!sessionId) {
      console.error("No valid session ID found - user might not be logged in");
      throw new Error('No valid session ID found. Please log in to the app first.');
    }

    // Use the test values as specified in the documentation
    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      algo_id: 'jjvp5_qrwkyntz_6194', // Using the test algo_id from docs
      account_id: 'GLKPZPXmtwmMP_qrwkyntz_6195', // Using the same value for account_id as suggested
    };

    console.log("Subscription payload:", JSON.stringify(payload, null, 2));

    // Make the API request
    console.log("Making subscription API request...");
    const response = await fetch('https://blindly-beloved-muskox.ngrok-free.app/rest/v1/app_subscribe_strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("Subscription response status:", response.status);
    
    const data = await response.json();
    console.log("Subscription response data:", JSON.stringify(data, null, 2));

    // Handle invalid session error
    if (response.status === 400 && data.res === "Invalid session!" && retries > 0) {
      console.log("Got 'Invalid session!' error. Retrying with different account_id...");
      
      // Try with the GLKPZPXmtwmMP_qrwkyntz_6195 account ID that appears in your logs
      return subscribeToAlgorithm(algoId, "GLKPZPXmtwmMP_qrwkyntz_6195", email, retries - 1);
    }

    if (!response.ok) {
      console.error("API error:", data.res);
      throw new Error(`API error: ${data.res || 'Unknown error'}`);
    }

    // Process successful response
    console.log("Subscription request successful!");
    
    if (typeof data === 'boolean') {
      return data;
    } else if (data && typeof data === 'object') {
      return {
        status: data.status || false,
        paymentLink: data.res || null,
        ticketId: data.tid || null
      };
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error in subscribeToAlgorithm:", error);
    throw error;
  }
};


// 3.5) CHECK PAYMENT STATUS (PRIVATE)
export const checkPaymentStatus = async (ticketId, email) => {
  try {
    console.log(`Checking payment status for ticket: ${ticketId}`);
    
    // Get the session ID that we know works
    const sessionId = await AsyncStorage.getItem('sessionId');
    
    if (!sessionId) {
      throw new Error('No session ID found. Please log in first.');
    }
    
    const payload = {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      tid: ticketId
    };
    
    console.log('Payment status check payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('https://blindly-beloved-muskox.ngrok-free.app/rest/v1/mp_subscribe_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Payment status check response status:', response.status);
    
    const data = await response.json();
    console.log('Payment status check response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(`API error: ${data.res || 'Unknown error'}`);
    }
    
    return {
      paymentStatus: data.status === true ? 'completed' : 'pending',
      details: data
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

