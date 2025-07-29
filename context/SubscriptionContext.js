// This is a new folder for context providers (More specifically, we have subscription state management here)
// State management solution to track the subscribed algorithm 
// MAY OR MAY NOT NEED THIS PAGE (CHECK 3.4 SUBSCRIBE TRADING BOT if needed or if 3.4) does the role of this page) 
import React, { createContext, useState, useContext } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscribedAlgorithm, setSubscribedAlgorithm] = useState(null); 

  const subscribeToAlgorithm = (algorithm) => {
    if (subscribedAlgorithm && subscribedAlgorithm.id !== algorithm.id) {
      return false; 
    }
    setSubscribedAlgorithm(algorithm);
    return true;
  };

  const unsubscribeFromAlgorithm = () => {
    setSubscribedAlgorithm(null);
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscribedAlgorithm, 
        subscribeToAlgorithm, 
        unsubscribeFromAlgorithm 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);