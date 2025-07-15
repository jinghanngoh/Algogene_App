import API from './api';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// const BASE_URL = 'https://blindly-beloved-muskox.ngrok-free.app';
const BASE_URL = 'https://algogene';
const API_KEY = '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff';
const USER = 'AGBOT1';

// Axios instance with default headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    user: USER,
    api_key: API_KEY,
  },
});

const objectiveMap = {
  'Global Minimum Variance': 0,
  'Max Sharpe Ratio': 1,
  'Max Sortino Ratio': 2,
  'Min Conditional VaR': 3,
  'Risk Parity Diversification': 4,
};

export const optimizePortfolio = async (params = {}) => {
  try {
    const payload = {
      StartDate: params.StartDate,
      EndDate: params.EndDate,
      arrSymbol: params.arrSymbol,
      objective: objectiveMap[params.objective] !== undefined ? objectiveMap[params.objective] : 0,
      target_return: params.target_return || 0.15,
      risk_tolerance: params.risk_tolerance || 0.3,
      allowShortSell: params.allowShortSell || false,
      risk_free_rate: params.risk_free_rate || 0.01,
      basecur: params.basecur || 'USD',
      total_portfolio_value: params.total_portfolio_value || 1000000,
      group_cond: params.group_cond,
    };
    
    const response = await api.post('/rest/v1/app/54/asset.optimize', payload);
    // console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
    // console.log('Raw Alloc:', response.data.res?.asset_allocate?.alloc);
    // console.log('Raw Shares:', response.data.res?.asset_allocate?.shares);
    // console.log('Raw Prices:', response.data.res?.asset_allocate?.prices);

    if (!response.data?.status) {
      throw new Error(response.data?.res || 'API request failed');
    }

    const res = response.data.res;

    if (typeof res === 'string') {
      throw new Error(res);
    }

    const allocations = res.asset_allocate?.alloc
      ? Object.entries(res.asset_allocate.alloc).map(([symbol, weight]) => ({
          symbol,
          weight: weight / 100,
          shares: res.asset_allocate.shares?.[symbol] || 0,
          currentPrice: res.asset_allocate.prices?.[symbol] || 0,
        }))
      : [];

      if (allocations.length === 0) {
        console.warn('No allocations returned from API', {
          symbols: params.arrSymbol,
          alloc: res?.asset_allocate?.alloc,
          shares: res?.asset_allocate?.shares,
          prices: res?.asset_allocate?.prices,
          response: res,
        });
      }

    const metrics = {
      annualizedReturn: res.asset_soln?.return || 0,
      annualizedVolatility: res.asset_soln?.volatility || 0,
      sharpeRatio: res.asset_soln?.sharpe || 0,
      var95: res.asset_soln?.var || 0,
      cvar95: res.asset_soln?.cvar || 0,
      cashLeft: res.asset_allocate?.leftover || 0,
    };

    return {
      status: true,
      data: {
        asset_allocate: allocations,
        ...metrics,
      },
      fullResponse: res,
    };
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(res?.err_msg || error.message || 'Optimization failed');
  }
};