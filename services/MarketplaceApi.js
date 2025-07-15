// Test out the public marketplace endpoint 
// MarketplaceApi.js
import API from './api';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a 32-character session ID
const generateSessionId = () => {
  return uuidv4().replace(/-/g, ''); // 32 chars
};

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

    // // Log raw response
    // console.log('=== FULL RAW STRATEGY RESPONSE ===');
    // console.log(JSON.stringify(response, null, 2));
    // console.log('=== END RAW RESPONSE ===');

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

    // console.log(`Raw Daily Returns Response for algo_id ${algoId}:`, JSON.stringify(response, null, 2));

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
    if (!algoId || !accountId || !email) {
      throw new Error('Missing required parameters: algoId, accountId, or email');
    }

    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    const response = await API.post('/rest/v1/app_subscribe_strategy/', {
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      user: 'AGBOT1',
      sid: sessionId,
      c_Email: email,
      algo_id : 'jjvp5_qrwkyntz_6194', // algo_id: algoId,
      account_id: accountId,
    });

    if (!response.data?.status) {
      throw new Error(response.data?.res || 'Subscription failed');
    }

    return {
      status: response.data.status,
      paymentLink: response.data.res,
      ticketId: response.data.tid,
    };
  } catch (error) {
    if (!(error.response?.status === 400 && error.response?.data?.res === 'Invalid session!')) {
      console.error('Error subscribing to algorithm:', error);
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
      return subscribeToAlgorithm(algoId, accountId, email, retries - 1);
    }

    throw error;
  }
};


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



// Log formatted strategy performance response
// const logFullApiResponse = (response) => {
//   console.log('=== FORMATTED STRATEGY RESPONSE ===');
  
//   // Performance section
//   console.log('\nPERFORMANCE METRICS:');
//   console.log('-------------------');
//   const performance = response.performance || {};
//   for (const [key, value] of Object.entries(performance)) {
//     if (typeof value === 'number') {
//       // Format numbers nicely
//       if (key.includes('pct') || key.includes('Rate') || key.includes('ratio')) {
//         console.log(`${key}: ${(value * 100).toFixed(2)}%`);
//       } else if (Math.abs(value) < 0.01) {
//         console.log(`${key}: ${value.toExponential(4)}`);
//       } else {
//         console.log(`${key}: ${value.toLocaleString()}`);
//       }
//     } else {
//       console.log(`${key}: ${value}`);
//     }
//   }

//   // Settings section
//   console.log('\nSTRATEGY SETTINGS:');
//   console.log('-----------------');
//   const settings = response.setting || {};
//   for (const [key, value] of Object.entries(settings)) {
//     if (Array.isArray(value)) {
//       console.log(`${key}: [${value.join(', ')}]`);
//     } else {
//       console.log(`${key}: ${value}`);
//     }
//   }

//   console.log('=== END OF FORMATTED RESPONSE ===');
// };
