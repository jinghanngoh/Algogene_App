// context/SubAccountsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API from '../services/api'; // Adjust path to your API service

const SubAccountsContext = createContext();

const DEFAULT_SUB_ACCOUNTS = [
  { // Hardcoded Binance
    id: '#1000',
    brokerId: 'GLKPZPXmtwmMP_qrwkyntz_6195', // Add this field with the real broker account ID
    broker: 'Binance',
    algorithm: 'SpiderNet',
    currency: 'USD',
    leverage: '5.0',
    subscriptionEnd: '2025-08-31 02:02:51',
    algoId: 'h448195gl0_ujbjcsgin_0451',
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
    brokerId: 'jjvp5_qrwkyntz_6194', // Add this field with the real broker account ID
    broker: 'Kucoin',
    algorithm: 'DeepNet',
    currency: 'USD',
    leverage: '5.0',
    subscriptionEnd: '2025-06-31 02:02:51',
    algoId: 'h448195gl0_ujbjcsgin_0452',
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
];

export const SubAccountsProvider = ({ children }) => {
  // console.log('SubAccountsProvider rendering');
  // Initialize with the default accounts
  const [subAccounts, setSubAccounts] = useState(DEFAULT_SUB_ACCOUNTS);
  
  // Function to reset AsyncStorage to default accounts
  const resetToDefaults = async () => {
    try {
      // console.log('Resetting subAccounts to defaults');
      await AsyncStorage.setItem('subAccounts', JSON.stringify(DEFAULT_SUB_ACCOUNTS));
      setSubAccounts(DEFAULT_SUB_ACCOUNTS);
    } catch (error) {
      console.error('Error resetting to defaults:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing SubAccountsContext');
        
        // For testing: clear AsyncStorage (remove this in production)
        // await AsyncStorage.removeItem('subAccounts');
        
        // Get saved data from AsyncStorage
        const savedAccounts = await AsyncStorage.getItem('subAccounts');
        
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts);
          // console.log('Found saved accounts:', parsedAccounts);
          
          // If saved accounts is an empty array, reset to defaults
          if (Array.isArray(parsedAccounts) && parsedAccounts.length === 0) {
            // console.log('Empty array found in storage, resetting to defaults');
            await resetToDefaults();
          } else {
            // Otherwise use the saved accounts
            setSubAccounts(parsedAccounts);
          }
        } else {
          // No saved accounts, save defaults
          // console.log('No saved accounts, initializing with defaults');
          await resetToDefaults();
        }
      } catch (error) {
        console.error('Error in SubAccountsContext initialization:', error);
        // On error, make sure we still have the default accounts in state
        setSubAccounts(DEFAULT_SUB_ACCOUNTS);
      }
    };
    
    initializeData();
  }, []);

  // useEffect(() => {
  //   const fetchInitialSubAccounts = async () => {
  //     try {
  //       const sessionId = await AsyncStorage.getItem('sessionId');
  //       if (!sessionId) {
  //         await login();
  //         return;
  //       }
  //       const response = await API.get('/rest/v1/app_subaccounts', {
  //         params: { sid: sessionId, user: 'AGBOT1', api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff' },
  //       }).catch(() => ({ status: false, data: [] })); // Fallback for failed requests
  //       if (response.status && Array.isArray(response.data)) {
  //         setSubAccounts(response.data); // Override with API data if successful
  //       } else {
  //         console.warn('Failed to fetch subAccounts or invalid data:', response.data);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching initial subAccounts:', err);
  //     }
  //   };
  //   fetchInitialSubAccounts();
  // }, []); // Empty dependency array ensures this runs once on mount
  const fetchSubAccounts = async () => {
    try {
      // console.log('Fetching subAccounts...');
      
      // Try to get from AsyncStorage first
      const savedAccounts = await AsyncStorage.getItem('subAccounts');
      
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);
        // console.log('Loaded subAccounts from AsyncStorage:', parsedAccounts);
        
        // If empty array in storage but we have defaults in state, use state
        if (parsedAccounts.length === 0 && subAccounts.length > 0) {
          // console.log('Empty array in storage but have accounts in state');
          await AsyncStorage.setItem('subAccounts', JSON.stringify(subAccounts));
          return subAccounts;
        }
        
        // Update state if different from current
        if (JSON.stringify(parsedAccounts) !== JSON.stringify(subAccounts)) {
          setSubAccounts(parsedAccounts);
        }
        
        return parsedAccounts;
      }
      
      // If nothing in storage but we have state, save state to storage
      if (subAccounts.length > 0) {
        // console.log('Nothing in storage, saving current state');
        await AsyncStorage.setItem('subAccounts', JSON.stringify(subAccounts));
        return subAccounts;
      }
      
      // Last resort: reset to defaults
      c// onsole.log('No accounts found anywhere, resetting to defaults');
      await resetToDefaults();
      return DEFAULT_SUB_ACCOUNTS;
    } catch (error) {
      console.error('Error fetching subAccounts:', error);
      // Return current state on error, or defaults if state is empty
      return subAccounts.length > 0 ? subAccounts : DEFAULT_SUB_ACCOUNTS;
    }
  };

  // Function to save or update accounts in the database
  const saveSubAccounts = async (updatedAccounts) => {
    try {
      // console.log('Saving subAccounts:', updatedAccounts);
      
      // Update state
      setSubAccounts(updatedAccounts);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('subAccounts', JSON.stringify(updatedAccounts));
      
      // console.log('Successfully saved subAccounts');
    } catch (err) {
      console.error('Error saving subAccounts:', err);
      // Still update state even if storage fails
      setSubAccounts(updatedAccounts);
    }
  };

  const addSubAccount = (newSubAccount) => {
    const updatedAccounts = [...subAccounts, newSubAccount];
    saveSubAccounts(updatedAccounts);
  };
  
  const updateSubAccount = (updatedSubAccount) => {
    const updatedAccounts = subAccounts.map(account => 
      account.id === updatedSubAccount.id ? updatedSubAccount : account
    );
    saveSubAccounts(updatedAccounts);
  };
  
  const deleteSubAccount = (accountId) => {
    const updatedAccounts = subAccounts.filter(account => account.id !== accountId);
    saveSubAccounts(updatedAccounts);
  };

  return (
    <SubAccountsContext.Provider
      value={{
        subAccounts,
        setSubAccounts,
        fetchSubAccounts,
        saveSubAccounts,
        addSubAccount,
        updateSubAccount,
        deleteSubAccount,
        resetToDefaults, // Export this so components can reset if needed
      }}
    >
      {children}
    </SubAccountsContext.Provider>
  );
};


export const useSubAccounts = () => {
  const context = useContext(SubAccountsContext);
  if (context === undefined) {
    console.error('useSubAccounts must be used within a SubAccountsProvider');
    // Return a default value to avoid app crashes
    return { 
      subAccounts: [], 
      setSubAccounts: () => {}, 
      fetchSubAccounts: async () => [],
      saveSubAccounts: () => {},
      addSubAccount: () => {},
      updateSubAccount: () => {},
      deleteSubAccount: () => {},
      resetToDefaults: async () => {},
    };
  }
  return context;
};

export {DEFAULT_SUB_ACCOUNTS};