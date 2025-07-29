// React Context for managing subaccounts in app. Includes default HARDCODED data for now 
// Also manages state of trading subaccounts across application (Loading, Saving and Updating Subaccount info)

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALGO_ACCOUNT_MAPPINGS = { // Maps the hardcoded algoID (LHS) to respective broker account (RHS)
  'h448195gl0_ujbjcsgin_0452': 'GLKPZPXmtwmMP_qrwkyabjj_2370', // DeepNet (KuCoin)
  'h448195gl0_ujbjcsgin_0451': 'GLKPZPXmtwmMP_qrwkyntz_6195'// SpiderNet (Binance)
};

export const getCorrectAccountId = (algoId, providedAccountId) => { // Make sure correct accountID used for that algo
  if (ALGO_ACCOUNT_MAPPINGS[algoId]) {
    if (!providedAccountId || !providedAccountId.startsWith('GLKPZP')) { // If missing or dont start with GLK...
      console.log(`[MAPPING] Using correct account ID for algo ${algoId}`);
      return ALGO_ACCOUNT_MAPPINGS[algoId];
    }
  }
  return providedAccountId;
};

const SubAccountsContext = createContext();

const DEFAULT_SUB_ACCOUNTS = [
  { // Hardcoded Binance
    id: '#1000',
    brokerId: 'GLKPZPXmtwmMP_qrwkyntz_6195', 
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
    brokerId: 'GLKPZPXmtwmMP_qrwkyabjj_2370',
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

export const SubAccountsProvider = ({ children }) => { // Provide subaccount context to child components
  const [subAccounts, setSubAccounts] = useState(DEFAULT_SUB_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getCorrectAccountId = (algoId, providedAccountId) => { // Initialize with the default accounts
    if (ALGO_ACCOUNT_MAPPINGS[algoId]) { // If algorithm is known in our mappings
      if (!providedAccountId || !providedAccountId.startsWith('GLKPZP')) { // If the provided account ID doesn't match the expected format, return correct one (ALSO HARDCODED)
        console.log(`[MAPPING] Using correct account ID for algo ${algoId}`);
        return ALGO_ACCOUNT_MAPPINGS[algoId];
      }
    }
    return providedAccountId; // Keep the original if no mapping or format looks correct
  };

  const resetToDefaults = async () => { // Function to reset AsyncStorage to default hardcoded value and save to AsyncStorage. In future, can straight away store to DB
    try { 
      await AsyncStorage.setItem('subAccounts', JSON.stringify(DEFAULT_SUB_ACCOUNTS));
      setSubAccounts(DEFAULT_SUB_ACCOUNTS);
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => { // Initialize subaccount data when provider mounts, load data from AsyncStorage
      try {
        // await AsyncStorage.removeItem('subAccounts'); // For testing: clear AsyncStorage (remove this in production)
        const savedAccounts = await AsyncStorage.getItem('subAccounts'); // Get saved data from AsyncStorage
        
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts);
          if (Array.isArray(parsedAccounts) && parsedAccounts.length === 0) { // If saved accounts is an empty array, reset to default
            await resetToDefaults();
          } else {
            setSubAccounts(parsedAccounts);
          }
        } else {
          await resetToDefaults(); // No saved accounts, use defaults
        }
      } catch (error) {
        console.error('Error in SubAccountsContext initialization:', error); // Make sure still have default accounts
        setSubAccounts(DEFAULT_SUB_ACCOUNTS);
      }
    };
    initializeData();
  }, []);

  const fetchSubAccounts = async () => {
    try {
      const savedAccounts = await AsyncStorage.getItem('subAccounts'); // Get from storage
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts); 
        
        if (parsedAccounts.length === 0 && subAccounts.length > 0) { // If empty array but have defaults, use defaults
          await AsyncStorage.setItem('subAccounts', JSON.stringify(subAccounts));
          return subAccounts;
        }
        
        if (JSON.stringify(parsedAccounts) !== JSON.stringify(subAccounts)) { // Update if different
          setSubAccounts(parsedAccounts);
        }
        return parsedAccounts;
      }
      
      if (subAccounts.length > 0) { // If nothing in storage but have state, save state
        await AsyncStorage.setItem('subAccounts', JSON.stringify(subAccounts));
        return subAccounts;
      }
      
      await resetToDefaults(); // Reset to default
      return DEFAULT_SUB_ACCOUNTS;
    } catch (error) {
      console.error('Error fetchsubAccounts:', error);
      return subAccounts.length > 0 ? subAccounts : DEFAULT_SUB_ACCOUNTS;
    }
  };

  const saveSubAccounts = async (updatedAccounts) => {
    try {
      setSubAccounts(updatedAccounts);
      await AsyncStorage.setItem('subAccounts', JSON.stringify(updatedAccounts));
    } catch (err) {
      console.error('Error saving subAccounts:', err);
      setSubAccounts(updatedAccounts); // Update if fails
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
        resetToDefaults, 
      }}
    >
      {children}
    </SubAccountsContext.Provider>
  );
};


export const useSubAccounts = () => {
  const context = useContext(SubAccountsContext);
  if (context === undefined) {
    console.error('useSubAccounts must be used within a SubAccountsProvider, useSubAccounts error');
    return {  // Return empty values to prevent crash
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