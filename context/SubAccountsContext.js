// context/SubAccountsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api'; // Adjust path to your API service

const SubAccountsContext = createContext();

export const SubAccountsProvider = ({ children }) => {
  console.log('SubAccountsProvider rendering');
  const [subAccounts, setSubAccounts] = useState([
    { // Hardcoded Binance
      id: '#1000',
      broker: 'Binance',
      algorithm: 'SpiderNet',
      currency: 'USD',
      leverage: '5.0',
      subscriptionEnd: '2025-08-31 02:02:51',
      runningScript: 'SpiderNet_v1',
      availableBalance: '1000000.0',
      cashBalance: '1000000.0',
      realizedPL: '0.0',
      unrealizedPL: '0.0',
      marginUsed: '0.0',
      status: 'INACTIVE',
      brokerConnected: false,
      brokerApiKey: '033ff7baad2893427dee0a7fc313a239af8ce33035d702757ca893da0fb14e85',
      brokerSecret: '1282d57b4233583b7f4e85201bb972e1d7cdc6b63822ebc0ec30bac95d78cb4b',
    },
    { // Hardcoded Kucoin
      id: '#1001',
      broker: 'Kucoin',
      algorithm: 'DeepNet',
      currency: 'USD',
      leverage: '5.0',
      subscriptionEnd: '2025-06-31 02:02:51',
      runningScript: 'DeepNet_v1',
      availableBalance: '2000000000.0',
      cashBalance: '100000000.0',
      realizedPL: '0.0',
      unrealizedPL: '0.0',
      marginUsed: '0.0',
      status: 'INACTIVE',
      brokerConnected: false,
      brokerApiKey: '6874c2742301b10001e7a4b4',
      brokerSecret: '96db4b1f-0984-43cb-85a5-509b050a0318', 
      brokerPassphrase: 'G3a8wj8P', 
    }
  ]);

  useEffect(() => {
    const fetchInitialSubAccounts = async () => {
      try {
        const sessionId = await AsyncStorage.getItem('sessionId');
        if (!sessionId) {
          await login();
          return;
        }
        const response = await API.get('/rest/v1/app_subaccounts', {
          params: { sid: sessionId, user: 'AGBOT1', api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff' },
        }).catch(() => ({ status: false, data: [] })); // Fallback for failed requests
        if (response.status && Array.isArray(response.data)) {
          setSubAccounts(response.data); // Override with API data if successful
        } else {
          console.warn('Failed to fetch subAccounts or invalid data:', response.data);
        }
      } catch (err) {
        console.error('Error fetching initial subAccounts:', err);
      }
    };
    fetchInitialSubAccounts();
  }, []); // Empty dependency array ensures this runs once on mount

  // Function to save or update accounts in the database
  const saveSubAccounts = async (updatedAccounts) => {
    try {
      const sessionId = await AsyncStorage.getItem('sessionId');
      const response = await API.post('/rest/v1/app_subaccounts', {
        sid: sessionId,
        user: 'AGBOT1',
        api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
        subAccounts: updatedAccounts,
      });
      if (response.status) {
        setSubAccounts(updatedAccounts); // Sync local state with saved data
      } else {
        console.warn('Failed to save subAccounts:', response.data);
      }
    } catch (err) {
      console.error('Error saving subAccounts:', err);
    }
  };

  return (
    <SubAccountsContext.Provider value={{ subAccounts, setSubAccounts, saveSubAccounts }}>
      {children}
    </SubAccountsContext.Provider>
  );
};

export const useSubAccounts = () => {
  const context = useContext(SubAccountsContext);
  if (context === undefined) {
    console.error('useSubAccounts must be used within a SubAccountsProvider');
  } else {
    // console.log('SubAccounts context:', context);
  }  return context || { subAccounts: [], setSubAccounts: () => {}, saveSubAccounts: () => {} }; // Fallback
};

// Placeholder login function (move to services/auth if needed)
const login = async () => {
  try {
    const payload = {
      user: 'AGBOT1',
      api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
      c_Email: 'thegohrilla@gmail.com',
    };
    const response = await API.post('/rest/v1/app_userlogin', payload);
    if (response.status === true) {
      const sessionId = response.sid || response.headers['set-cookie']?.find(c => c.includes('sid='))?.split('sid=')[1]?.split(';')[0];
      if (sessionId) {
        await AsyncStorage.setItem('sessionId', sessionId);
        console.log('Login successful, sessionId:', sessionId);
        return sessionId;
      }
    }
    throw new Error('Login failed: Invalid response');
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};