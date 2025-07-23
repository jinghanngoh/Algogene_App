import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const user = 'AGBOT1';
const apiKey = '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// Throttle function to limit API rates
const throttle = (func, delay) => {
  let lastCall = 0;
  let cachedResult = null;
  let loggedRecently = false;
  
  return async function(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      // Only log throttling occasionally to reduce spam
      if (!loggedRecently) {
        console.log(`Using cached data (refreshes every ${delay/1000}s)`);
        loggedRecently = true;
        setTimeout(() => { loggedRecently = false; }, 5000); // Reset logging flag after 5 seconds
      }
      
      // Only return cached result if it's valid
      if (cachedResult) {
        return cachedResult;
      }
    }
    
    lastCall = now;
    try {
      const result = await func.apply(this, args);
      if (result) {
        cachedResult = result;
      }
      return result;
    } catch (error) {
      throw error;
    }
  };
};


// 5.1) START ALGO
// export const startAlgo = async (accountId, algoId = 'jjvp5_qrwkyntz_6194', retries = 3) => {
  export const startAlgo = async (accountId, algoId, retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
      if (!algoId) {
        throw new Error('Missing required parameter: algoId');
      }
      
      const sessionId = await AsyncStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No valid session ID found. Please log in first.');
      }
  
      const payload = {
        api_key: apiKey,
        user,
        algo_id: algoId,
        account_id: accountId
      };
      
      // Log complete request details
      // console.log('START ALGO - REQUEST DETAILS:');
      // console.log('Payload:', JSON.stringify(payload, null, 2));
  
      const response = await API.post('/rest/v1/startalgo', payload, { 
        headers: { 'Content-Type': 'application/json' } 
      });
  
      // console.log('START ALGO - RESPONSE:');
      // console.log('RESPONSE:', response);
  
      return {
        algo_id: response.algo_id,
        res: response.res,
        status: response.status
      };
    } catch (error) {
      console.error('5.1) API Error:', error.message);
  }};


// 5.2) STOP ALGO
export const stopAlgo = async (accountId, algoId, retries = 3) => {
  try {
    if (!accountId) {
      throw new Error('Missing required parameter: accountId');
    }
    
    if (!algoId) {
      throw new Error('Missing required parameter: algoId');
    }
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const payload = {
      api_key: apiKey,
      user,
      algo_id: algoId,
      account_id: accountId
    };
    
    // Log complete request details
    console.log('STOP ALGO - REQUEST DETAILS:');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await API.post('/rest/v1/stopalgo', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Log the complete response
    // console.log('STOP ALGO - RESPONSE:');
    // console.log('RESPONSE:', response);
    
    return {
      res: response.res,
      status: response.status
    };
  } catch (error) {
    console.error('5.2) API Error:', error.message);
}};

// 5.3) GET REAL-TIME ACCOUNT BALANCE (GET THE ACCOUNT ID FOR KUCOIN INSTEAD OF HARDCODING FIXEDACCOUNTID)
export const getRealTimeAccountBalance = async (accountId, source = 'algogene', retries = 3) => {
  try {
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId,
      src: source
    };

    // console.log('5.3) GET REAL-TIME ACCOUNT BALANCE - Payload:', params);

    const response = await API.get('/rest/broker/account_balance', { 
      params,
      headers: { 'Content-Type': 'application/json'} 
    });

    // console.log('5.3) GET REAL-TIME ACCOUNT BALANCE - RESPONSE:', response);

    const responseData = response.data || response;

    return {
      status: responseData.status,
      balance: {
        nav: responseData.res.NAV,
        availableBalance: responseData.res.availableBalance,
        currency: responseData.res.cur,
        marginUsed: responseData.res.marginUsed,
        isBinded: responseData.res.is_binded,
        errorMessage: responseData.res.err_msg || null,
      },
    };
  } catch (error) {
    console.error('GET REAL-TIME ACCOUNT BALANCE - ERROR:', error);
    
    if (retries > 0) {
      console.log(`Retrying getRealTimeAccountBalance (${retries} left)...`);
      await delay(1000);
      return getRealTimeAccountBalance(accountId, source, retries - 1);
    }
    throw error;
  }
};

// 5.4) GET REAL-TIME ACCOUNT POSITION (GET THE ACCOUNT ID FOR KUCOIN INSTEAD OF HARDCODING FIXEDACCOUNTID)
export const getRealTimeAccountPosition = async (accountId, source = 'algogene', retries = 3) => {
  try {
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';

    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId, // REPLACE WITH ACTUAL ACCOUNT_ID
      src: source
    };

    // console.log('5.4) GET REAL-TIME ACCOUNT POSITION - Payload:', params);

    const response = await API.get('/rest/broker/account_positions', { 
      params,
      headers: { 'Content-Type': 'application/json' }
    });

    // console.log('5.4) GET REAL-TIME ACCOUNT POSITION - RESPONSE:', response);

    const responseData = response.data || response;
    
    if (!responseData.status && !responseData.res) {
      throw new Error(responseData.message || 'Failed to get account positions');
    }

    return {
      positions: Array.isArray(responseData.res) ? responseData.res : [],
      status: responseData.status || true
    };
  } catch (error) {
    console.error('GET REAL-TIME ACCOUNT POSITION - ERROR:', error);

    if (retries > 0) {
      console.log(`Retrying getRealTimeAccountPosition (${retries} left)...`);
      await delay(1000);
      return getRealTimeAccountPosition(accountId, source, retries - 1);
    }
    throw error;
  }
};

// 5.5) GET TRADING PERFORMANCE STATISTICS
export const getTradingPerformanceStats = async (accountId, asOfDate = '', retries = 3) => {
  try {
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195'; // Use the Binance account ID that works with the API
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId,
      acdate: asOfDate || '',
    };

    // console.log('5.5) GET TRADING PERFORMANCE STATISTICS - Payload', params); 
    
    const response = await API.get('/rest/v1/strategy_stats', { 
      params,
      headers: { 'Content-Type' : 'application/json' }
    });

    // console.log('5.5) GET TRADING PERFORMANCE STATISTICS - RESPONSE', response);

    // The API response is already in response, not in response.data
    // The response object includes performance directly
    if (!response || !response.performance) {
      throw new Error('Failed to get performance stats or no performance data available');
    }

    return {
      status: true,
      performance: response.performance || {},
      settings: response.setting || {}
    };
  } catch (error) {
    console.error('GET TRADING PERFORMANCE STATS - ERROR:', {
      message: error.message,
      response: error.response?.data
    });
    
    if (retries > 0) {
      console.log(`Retrying getTradingPerformanceStats (${retries} left)...`);
      await delay(1000);
      return getTradingPerformanceStats(accountId, asOfDate, retries - 1);
    }
    throw error;
  }
};

// 5.6) GET HISTORY OF DAILY CUMULATIVE P/L
export const getDailyCumulativePL = async (accountId, asOfDate = '', extrapolate = 'True', retries = 3) => {
  try {
    // Use the Binance account ID that works with the API
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId, 
      acdate: asOfDate || '',
      isExtrapolate: extrapolate,
    };
    
    // console.log('5.6) GET DAILY CUMULATIVE P/L - Payload', params);
    
    const response = await API.get('/rest/v1/strategy_pl', {
      params,
      headers: { 'Content-Type' : 'application/json'}
    });
    
    // console.log('5.6) GET DAILY CUMULATIVE P/L - RESPONSE:', response);
  } catch (error) {
    console.error('GET DAILY CUMULATIVE P/L - ERROR:', {
      message: error.message,
      response: error.response?.data
    });
    
    if (retries > 0) {
      console.log(`Retrying getDailyCumulativePL (${retries} left)...`);
      await delay(1000);
      return getDailyCumulativePL(accountId, asOfDate, extrapolate, retries - 1);
    }
    throw error;
  }
};


// 5.7) GET HISTORY OF DAILY POSITION
export const getDailyPosition = async (accountId, asOfDate = '', retries = 3) => {
  try {
    // Use the fixed account ID that works with the API
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId,
      acdate: asOfDate || '',
    };
    
    // console.log('5.7) GET DAILY POSITION - REQUEST DETAILS:', params);
    
    const response = await API.get('/rest/v1/strategy_pos', { 
      params,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // console.log('5.7) GET DAILY POSITION - RESPONSE:', response);

    return {
      status: true,
      data: response.res || [],
      count: response.count || 0
    };
  } catch (error) {
    // console.error('5.7) GET DAILY POSITION - ERROR:', {
    //   message: error.message,
    //   response: error.response?.data
    // });
    
    if (retries > 0) {
      console.log(`Retrying getDailyPosition (${retries} left)...`);
      await delay(1000);
      return getDailyPosition(accountId, asOfDate, retries - 1);
    }
    throw error;
  }
};


// 5.8) GET HISTORY OF DAILY BALANCE
export const getTradeHistory = async (accountId, asOfDate = '', extrapolate = 'True', retries = 3) => {
  try {
    // Use the fixed account ID that works with the API
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId,
      acdate: '',
      isExtrapolate: 'True',
    };

    // console.log('5.8) GET TRADE HISTORY - REQUEST DETAILS:', params);
    
    const response = await API.get('/rest/v1/strategy_bal', { 
      params,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // console.log('5.8) GET TRADE HISTORY - RESPONSE:', response)

    return {
      response
    };
  } catch (error) {
    // console.error('5.8) GET TRADE HISTORY - ERROR:', {
    //   message: error.message,
    //   response: error.response?.data
    // });
    
    if (retries > 0) {
      console.log(`Retrying getTradeHistory (${retries} left)...`);
      await delay(1000);
      return getTradeHistory(accountId, startDate, endDate, retries - 1);
    }
    throw error;
  }
};

// 5.9) GET HISTORY OF TRANSACTIONS
export const getAlgoStatistics = async (accountId, algoId, asOfDate = '', extrapolate = 'True', retries = 3, page = '1') => {
  try {
    // Use the fixed account ID that works with the API
    const fixedAccountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';
    
    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No valid session ID found. Please log in first.');
    }
    
    if (!algoId) {
      throw new Error('Missing required parameter: algoId');
    }

    const params = {
      api_key: apiKey,
      user,
      account_id: fixedAccountId,
      algo_id: algoId, 
      acdate: '',
      page: page,
      isExtrapolate: extrapolate
    };
    
    // console.log('5.9) GET ALGO STATISTICS - REQUEST DETAILS:', params);
    
    const response = await API.get('/rest/v1/strategy_trade', { 
      params,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // console.log('5.9) GET ALGO STATISTICS - RESPONSE:', response);

    return {response}
  } catch (error) {
    // console.error('5.9) GET ALGO STATISTICS - ERROR:', {
    //   message: error.message,
    //   response: error.response?.data
    // });
    
    // if (retries > 0) {
    //   console.log(`Retrying getAlgoStatistics (${retries} left)...`);
    //   await delay(1000);
    //   return getAlgoStatistics(accountId, algoId, retries - 1);
    // }
    throw error;
  }
};

// Throttled versions 
export const throttledGetRealTimeAccountBalance = throttle(getRealTimeAccountBalance, 30000);
export const throttledGetRealTimeAccountPosition = throttle(getRealTimeAccountPosition, 30000);
export const throttledGetTradingPerformanceStats = throttle(getTradingPerformanceStats, 30000);
export const throttledGetDailyCumulativePL = throttle(getDailyCumulativePL, 30000);
export const throttledGetDailyPosition = throttle(getDailyPosition, 30000);
export const throttledGetTradeHistory = throttle(getTradeHistory, 30000);
export const throttledGetAlgoStatistics = throttle(getAlgoStatistics, 30000);