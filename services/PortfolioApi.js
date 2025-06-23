import API from './api';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const optimizePortfolio = async (params = {}, retries = 3) => {
  try {
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem('sessionId', sessionId);
    }

    // Default parameters from documentation
    const defaultParams = {
      allowShortSell: false,
      risk_tolerance: 0.3,
      target_return: 0.15,
      total_portfolio_value: 1000000,
      basecur: 'USD',
      risk_free_rate: 0.01,
      arrSymbol: ['EURUSD'], // Default to a single symbol
      objective: 0, // Default to minimize volatility
      group_cond: {}, // Optional, empty by default
      StartDate: '2023-12-01', // Default dates (adjustable)
      EndDate: '2023-12-31', // Default dates (adjustable)
      sid: sessionId,
    };

    // Merge default params with provided params, overriding defaults
    const requestBody = { ...defaultParams, ...params };

    // Validate required fields
    if (!requestBody.arrSymbol || !Array.isArray(requestBody.arrSymbol) || requestBody.arrSymbol.length === 0) {
      throw new Error('arrSymbol must be a non-empty array of financial instruments.');
    }
    if (!requestBody.StartDate || !requestBody.EndDate) {
      throw new Error('StartDate and EndDate are required.');
    }

    const response = await API.post('/rest/v1/app/54/asset.optimize', requestBody);

    if (!response?.status) {
      throw new Error(response?.res || 'API returned false status');
    }

    return {
      status: response.status,
      data: response.res,
    };
  } catch (error) {
    console.error('Error optimizing portfolio:', error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      message: error.message,
    });

    // Handle invalid session
    if (error.response?.status === 400 && error.response?.data?.res === 'Invalid session!' && retries > 0) {
      console.log(`Invalid session detected. Retrying (${retries} left)...`);
      await AsyncStorage.removeItem('sessionId');
      await delay(500);
      return optimizePortfolio(params, retries - 1);
    }

    throw error;
  }
};