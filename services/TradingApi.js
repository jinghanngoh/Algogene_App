import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const user = 'AGBOT1';
const apiKey = '13c0804bd10594d07ceb974baa8648fcccd01b4eaea569c7d6c5c91ab01cc083f';

// 5.1) START ALGO
export const startAlgo = async (accountId, algoId = 'live5_qrwkynfz_6194', retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        algo_id: algoId,
      };
      const response = await API.post('/rest/v1/startalgo', null, { params });
  
      if (!response.data?.status) {
        throw new Error(response.data?.res || 'Failed to start algo');
      }
  
      return {
        status: response.data.status,
        message: response.data.yes,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying startAlgo (${retries} left)...`);
        await delay(1000);
        return startAlgo(accountId, algoId, retries - 1);
      }
      throw error;
    }
  };

// 5.2) STOP ALGO
export const stopAlgo = async (accountId, algoId = 'live5_qrwkynfz_6194', retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        algo_id: algoId,
      };
      const response = await API.post('/rest/v1/stopalgo', null, { params });
  
      if (!response.data?.status) {
        throw new Error(response.data?.res || 'Failed to stop algo');
      }
  
      return {
        status: response.data.status,
        message: response.data.yes,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying stopAlgo (${retries} left)...`);
        await delay(1000);
        return stopAlgo(accountId, algoId, retries - 1);
      }
      throw error;
    }
  };

// 5.3) GET REAL-TIME ACCOUNT BALANCE
export const getRealTimeAccountBalance = async (accountId, source = 'algogene', retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        src: source,
      };
      const response = await API.get('/rest/broker/account_balance', { params });
  
      if (!response.data?.status) {
        throw new Error(response.data?.err_msg || 'Failed to get account balance');
      }
  
      return {
        status: response.data.status,
        balance: response.data.res,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying getRealTimeAccountBalance (${retries} left)...`);
        await delay(1000);
        return getRealTimeAccountBalance(accountId, source, retries - 1);
      }
      throw error;
    }
  };

// 5.4) GET REAL-TIME ACCOUNT POSITION
export const getRealTimeAccountPosition = async (accountId, source = 'algogene', retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        src: source,
      };
      const response = await API.get('/rest/broker/account_positions', { params });
  
      if (!response.data?.status) {
        throw new Error(response.data?.err_msg || 'Failed to get account positions');
      }
  
      return {
        status: response.data.status,
        positions: response.data.res,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
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
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        asOfDate: asOfDate || '',
      };
      const response = await API.get('/rest/v1/strategy_stats', { params });
  
      if (!response.data?.performance) {
        throw new Error(response.data?.err_msg || 'Failed to get performance stats');
      }
  
      return {
        performance: response.data.performance,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying getTradingPerformanceStats (${retries} left)...`);
        await delay(1000);
        return getTradingPerformanceStats(accountId, asOfDate, retries - 1);
      }
      throw error;
    }
  };

// 5.6) GET HISTORY OF DAILY CUMULATIVE P/L
export const getDailyCumulativePL = async (accountId, asOfDate = '', extrapolate = false, retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        asOfDate: asOfDate || '',
        extrapolate: extrapolate,
      };
      const response = await API.get('/rest/v1/strategy_pos', { params });
  
      if (!response.data?.count) {
        throw new Error(response.data?.err_msg || 'Failed to get daily cumulative P/L');
      }
  
      return {
        count: response.data.count,
        data: response.data.res,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
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
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        acdate: asOfDate || '',
      };
      const response = await API.get('/rest/v1/strategy_pos', { params });
  
      if (!response.data?.count) {
        throw new Error(response.data?.err_msg || 'Failed to get daily position');
      }
  
      return {
        count: response.data.count,
        data: response.data.yes || response.data.no, // Handle both ascending and descending
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying getDailyPosition (${retries} left)...`);
        await delay(1000);
        return getDailyPosition(accountId, asOfDate, retries - 1);
      }
      throw error;
    }
  };


// 5.8) GET HISTORY OF DAILY BALANCE
export const getDailyBalance = async (accountId, asOfDate = '', extrapolate = false, retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        acdate: asOfDate || '',
        extrapolate: extrapolate,
      };
      const response = await API.get('/rest/v1/strategy_bal', { params });
  
      if (!response.data?.count) {
        throw new Error(response.data?.err_msg || 'Failed to get daily balance');
      }
  
      return {
        count: response.data.count,
        data: response.data.vars,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying getDailyBalance (${retries} left)...`);
        await delay(1000);
        return getDailyBalance(accountId, asOfDate, extrapolate, retries - 1);
      }
      throw error;
    }
  };


// 5.9) GET HISTORY OF TRANSACTIONS
export const getTransactionHistory = async (accountId, asOfDate = '', page = 1, extrapolate = true, retries = 3) => {
    try {
      if (!accountId) {
        throw new Error('Missing required parameter: accountId');
      }
  
      const params = {
        api_key: apiKey,
        user,
        account_id: accountId,
        acdate: asOfDate || '',
        page,
        isExtrapolate: extrapolate,
      };
      const response = await API.get('/rest/v1/strategy_trade', { params });
  
      if (!response.data?.count) {
        throw new Error(response.data?.err_msg || 'Failed to get transaction history');
      }
  
      return {
        count: response.data.count,
        data: response.data.res,
      };
    } catch (error) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      if (error.response?.status === 400 && retries > 0) {
        console.log(`Retrying getTransactionHistory (${retries} left)...`);
        await delay(1000);
        return getTransactionHistory(accountId, asOfDate, page, extrapolate, retries - 1);
      }
      throw error;
    }
  };