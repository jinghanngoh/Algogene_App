import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { configureBroker } from '../../services/BrokerApi';
import { fetchPublicAlgos } from '../../services/MarketplaceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubAccounts } from '../../context/SubAccountsContext';
import SubAccountCreation from '../components/SubAccountCreationModal';
import { startAlgo, stopAlgo } from '../../services/TradingApi';

const SubAccounts = () => {
  const { 
    subAccounts, 
    saveSubAccounts, 
    updateSubAccount,
    fetchSubAccounts,
    setSubAccounts
  } = useSubAccounts();

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const accounts = await fetchSubAccounts();
        
        // If we still get an empty array after fetching, try resetting
        if (accounts.length === 0) {
          // console.log('Still no accounts after fetch, resetting to defaults');
          // await resetToDefaults();
        }
      } catch (err) {
        console.error('Error loading subaccounts:', err);
        setError('Failed to load sub accounts: ' + err.message);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchAlgorithmDetails = async (account) => {
    try {
      const response = await fetchPublicAlgos();
      if (response.status && Array.isArray(response.data)) {
        const algoData = response.data.find(algo => algo.algo_id === account.algoId || algo.name === account.algorithm);
        if (algoData) {
          const updatedAccounts = subAccounts.map((acc) =>
            acc.id === account.id ? { ...acc, algorithm: algoData.name || acc.algorithm } : acc
          );
          setSubAccounts(updatedAccounts);
          saveSubAccounts(updatedAccounts);
        } else {
          console.warn(`No matching algorithm found for algoId: ${account.algoId}`);
        }
      } else {
        console.warn('Invalid response format from fetchPublicAlgos');
      }
    } catch (err) {
      console.error('Error fetching algorithm details:', err);
    }
  };

  const fetchSubAccountDetails = async (account) => {
    if (!account.brokerApiKey || !account.brokerSecret) return;
    setLoading(true);
    try {
      const sessionId = await AsyncStorage.getItem('sessionId');
      if (!sessionId) {
        // console.log('No session ID, attempting login...');
        await login();
      }
      const response = await configureBroker(
        account.broker.toLowerCase(),
        account.brokerApiKey,
        account.brokerSecret,
        account.brokerPassphrase
      );
      console.log('API Response:', response);
      // Dynamically use the account_id from response.account_map
      const accountId = response.account_map?.[0]?.[0] || account.id; // Handle nested array format
      const updatedAccounts = subAccounts.map((acc) =>
        acc.id === account.id
          ? {
              ...acc,
              brokerConnected: response.status === true,
              availableBalance: response.broker_accountinfo?.[accountId]?.available_Balance || acc.availableBalance,
              cashBalance: response.broker_accountinfo?.[accountId]?.NAV || acc.cashBalance,
              currency: response.broker_accountinfo?.[accountId]?.cur || acc.currency,
            }
          : acc
      );
      setSubAccounts(updatedAccounts);
      saveSubAccounts(updatedAccounts);
      setError(null);
    } catch (err) {
      console.error(`Error fetching details for ${account.id}:`, err);
      console.log('Full Error Response:', err.response?.data);
      setError(`Failed to connect to ${account.broker}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    subAccounts.forEach((account) => {
      fetchSubAccountDetails(account);
      fetchAlgorithmDetails(account);
    });
  }, []);

  const toggleStatus = async (id) => {
    const account = subAccounts.find((acc) => acc.id === id);
    if (!account) return;
  
    setLoading((prev) => ({ ...prev, [id]: true }));
    setError(null);
  
    try {
      console.log(`[VALIDATION] Account #${account.id} mapped to broker ID: ${accountId}`);
      
      // Map accounts to their broker IDs if not already present
      let accountId;
      if (account.brokerId) {
        accountId = account.brokerId;
      } else if (account.id === '#1000') {
        accountId = 'GLKPZPXmtwmMP_qrwkyntz_6195';
      } else if (account.id === '#1001') {
        accountId = 'GLKPZPXmtwmMP_qrwkyabjj_2370'; 
      } else {
        throw new Error('Missing broker account ID. Please check broker connection.');
      }

      // Map to algorithm IDs if not already present
      let algoId;
      if (account.algoId) {
        algoId = account.algoId;
      } else if (account.runningScript === 'SpiderNet_v1') {
        algoId = 'h448195gl0_ujbjcsgin_0451';
      } else if (account.runningScript === 'DeepNet_v1') {
        algoId = 'h448195gl0_ujbjcsgin_0452';
      } else {
        throw new Error('Missing algorithm ID for this account');
      }

      const updatedAccount = { 
        ...account, 
        status: account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        brokerId: accountId,
        algoId: algoId
      };
    
      // First update the UI optimistically
      updateSubAccount(updatedAccount);

      console.log(`[DEBUG] Mapped values - accountId: ${accountId}, algoId: ${algoId}`);

      // Then before calling stopAlgo:
      if (account.status === 'ACTIVE') {
        console.log(`[DEBUG] Stopping algo with accountId: ${accountId}, algoId: ${algoId}`);
        const result = await stopAlgo(accountId, algoId);
        console.log(`[DEBUG] Stop algo result:`, result);
      } else {
        console.log(`[DEBUG] Starting algo with accountId: ${accountId}, algoId: ${algoId}`);
        const result = await startAlgo(accountId, algoId);
        console.log(`[DEBUG] Start algo result:`, result);
      }
    } catch (err) {
      console.error(`Error toggling status for ${id}:`, err);
      setError(`Failed to ${account.status === 'ACTIVE' ? 'pause' : 'resume'} ${id}: ${err.message}`);
      updateSubAccount(account);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
};

return (
  <ScrollView style={styles.scrollContainer}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.box}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Sub Accounts</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          Manage your trading sub accounts, each linked to a single broker and algorithm. Run Paper Tests or Real Trades to evaluate strategies.
        </Text>

        {isInitialLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : subAccounts.length === 0 ? (
          <Text style={styles.emptyText}>No sub accounts found. Create one to get started.</Text>
        ) : (
          <ScrollView>
            {subAccounts.map((account) => (
              <View key={account.id} style={styles.subAccountBox}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>{account.id}</Text>
                  <Text
                    style={[
                      styles.headerStatus,
                      { color: account.status === 'ACTIVE' ? '#00ff00' : 'gray' },
                    ]}
                  >
                    {account.status}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Broker:</Text>
                  <Text style={styles.detailsValue}>{account.broker}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Broker Status:</Text>
                  <Text style={styles.detailsValue}>
                    {account.brokerConnected ? 'Connected' : 'Not Connected'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Algorithm:</Text>
                  <Text style={styles.detailsValue}>{account.algorithm}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Currency:</Text>
                  <Text style={styles.detailsValue}>{account.currency}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Leverage:</Text>
                  <Text style={styles.detailsValue}>{account.leverage}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Available Balance:</Text>
                  <Text style={styles.detailsValue}>
                    {account.currency === 'USD' ? '$' : ''}{account.availableBalance}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Cash Balance:</Text>
                  <Text style={styles.detailsValue}>
                    {account.currency === 'USD' ? '$' : ''}{account.cashBalance}
                  </Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => {
                      // console.log(`Starting Paper Test for ${account.id} with ${account.algorithm}`);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Paper Test</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor:
                          account.status === 'ACTIVE'
                            ? account.brokerConnected
                              ? '#D3D3D3'
                              : '#666666'
                            : '#666666',
                        opacity: account.status === 'ACTIVE' ? 1 : 0.5,
                      },
                    ]}
                    disabled={account.status !== 'ACTIVE'}
                    // onPress={() => {
                    //    console.log(
                    //     `Starting Real Trade for ${account.id} with ${account.algorithm}` +
                    //     `${account.brokerConnected ? ' (Live)' : ' (Simulated, upload optional)'}`);
                    // }}
                  >
                    <Text style={styles.actionButtonText}>Real Trade</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4FC3F7' }]}
                    onPress={() => toggleStatus(account.id)}
                    disabled={loading[account.id]}
                  >
                    {loading[account.id] ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {account.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <SubAccountCreation 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  </ScrollView>
);
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    marginTop: 30
  },
  box: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginTop: 70,
  },
  subAccountBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerStatus: {
    fontSize: 14,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'lightgray',
    marginBottom: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsLabel: {
    color: 'lightgray',
    fontSize: 14,
  },
  detailsValue: {
    color: 'white',
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    marginTop: 5,
  },
  createButton: {
    backgroundColor: '#4FC3F7',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 10,
    flex: 1,
    marginHorizontal: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    color: '#bbb',
    textAlign: 'center',
    marginVertical: 10,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default SubAccounts;