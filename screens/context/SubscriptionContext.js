// This is a new folder for context providers (More specifically, we have subscription state management here)
// State management solution to track the subscribed algorithm 

import React, { createContext, useState, useContext } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscribedAlgorithm, setSubscribedAlgorithm] = useState(null);

  const subscribeToAlgorithm = (algorithm) => {
    setSubscribedAlgorithm(algorithm);
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