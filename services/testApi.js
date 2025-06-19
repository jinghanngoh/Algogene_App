// Test out the public marketplace endpoint 
import API from './api';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { login } from '../services/auth/auth';

// Generate a 32-character session ID
const generateSessionId = () => {
  return uuidv4().replace(/-/g, ''); // 32 chars
};

// Delay function for retry logic
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch Trading Bots (2.1)
// export const fetchPublicAlgos = async () => { 
//   try {
//     console.log('Making API Request to /rest/v1/app_mp_topalgo');
    
//     // Get or generate session ID
//     let sessionId = await AsyncStorage.getItem('sessionId');
//     if (!sessionId) {
//       sessionId = generateSessionId();
//       await AsyncStorage.setItem('sessionId', sessionId);
//     }
    
//     const response = await API.get('/rest/v1/app_mp_topalgo', {
//       params: {
//         user: 'AGBOT1',
//         api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//         sid: sessionId
//       }
//     });

//     if (!response.status) {
//       throw new Error(response.res || 'API returned false status');
//     }

//     return {
//       status: response.status,
//       count: response.count,
//       data: response.res
//     };
//   } catch (error) {
//     console.error('Error fetching public algos:', error);
//     console.error('Error details:', {
//       response: error.response?.data,
//       status: error.response?.status,
//       request: error.request,
//       message: error.message
//     });
//     throw error;
//   }
// };

export const fetchPublicAlgos = async (retries = 1) => {
  try {
    console.log('Making API Request to /rest/v1/app_mp_topalgo');
    
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }
    const cid = await AsyncStorage.getItem('cid') || 'AGBOTKOlnrdLJ';
    console.log('Using sessionId:', sessionId);
    
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
    
    // if (!response.data.status) {
    //   throw new Error(response.res || 'API returned false status');
    // }

    return {
      status: response.status,
      count: response.count,
      data: response.res,
    };
  } catch (error) {
    console.error('Error fetching public algos:', error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
      console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(1000);
      return fetchPublicAlgos(retries - 1);
    }

    throw error;
  }
};

// Fetch trading bot performance statistics (2.2) with caching and retry
export const fetchAlgoPerformance = async (algoId, accountingDate = null, retries = 3) => {
  try {
    // Check cache first
    const cacheKey = `performance_${algoId}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      console.log(`Returning cached performance data for algo_id: ${algoId}`);
      return JSON.parse(cachedData);
    }

    console.log(`Making API Request to /rest/v1/strategy_stats for algo_id: ${algoId}`);
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    const response = await API.get('/rest/v1/strategy_stats', {
      params: {
        user: 'AGBOT1',
        api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        sid: sessionId,
        algo_id: algoId,
        acdate: accountingDate
      }
    });

    console.log(`Raw API Response for algo_id ${algoId}:`, JSON.stringify(response, null, 2));

    if (!response.performance) {
      throw new Error('Performance data not available.');
    }

    // Cache the response
    await AsyncStorage.setItem(cacheKey, JSON.stringify(response.performance));
    return response.performance;
    } catch (error) {
    console.error(`Error fetching algorithm performance for algo_id ${algoId}:`, error);
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
        return fetchAlgoPerformance(algoId, accountingDate, retries - 1);
      } else {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

    throw error;
  }
};

// // Fetch trading bot daily returns (2.3)
// export const fetchAlgoDailyReturns = async (algoId, accountingDate = null, isExtrapolate = false) => {
//   try {
//     console.log('Making API Request to /rest/v1/strategy_return');
//     let sessionId = await AsyncStorage.getItem('sessionId');
//     if (!sessionId) {
//       sessionId = generateSessionId();
//       await AsyncStorage.setItem('sessionId', sessionId);
//     }

//     const response = await API.get('/rest/v1/strategy_return', {
//       params: {
//         user: 'AGBOT1',
//         api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
//         sid: sessionId,
//         algo_id: algoId,
//         acdate: accountingDate,
//         isExtrapolate: isExtrapolate
//       }
//     });

//     console.log('Raw Daily Returns Response:', JSON.stringify(response, null, 2));

//     if (!response.res) {
//       throw new Error('Daily returns data not available.');
//     }
//     return response.res; // Returns the list of daily return objects
//   } catch (error) {
//     console.error('Error fetching daily returns:', error);
//     console.error('Error details:', {
//       response: error.response?.data,
//       status: error.response?.status,
//       request: error.request,
//       message: error.message
//     });
//     throw error;
//   }
// };