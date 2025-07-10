import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { configureBroker } from '../../services/BrokerApi';
import { fetchPublicAlgos } from '../../services/MarketplaceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubAccounts } from '../../context/SubAccountsContext';
import SubAccountCreation from '../components/SubAccountCreationModal';

const SubAccounts = () => {
  const { subAccounts, setSubAccounts, saveSubAccounts } = useSubAccounts();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlgorithmDetails = async (account) => {
    try {
      const response = await fetchPublicAlgos();
      if (response.status && Array.isArray(response.data)) {
        const algoData = response.data.find(algo => algo.algo_id === account.runningScript || algo.name === account.algorithm);
        if (algoData) {
          const updatedAccounts = subAccounts.map((acc) =>
            acc.id === account.id ? { ...acc, algorithm: algoData.name || acc.algorithm } : acc
          );
          setSubAccounts(updatedAccounts);
          saveSubAccounts(updatedAccounts);
        } else {
          console.warn(`No matching algorithm found for runningScript: ${account.runningScript}`);
        }
      } else {
        console.warn('Invalid response format from fetchPublicAlgos');
      }
    } catch (err) {
      console.error('Error fetching algorithm details:', err);
    }
  };

  const fetchSubAccountDetails = async (account) => {
    if (account.broker !== 'Binance' || !account.brokerApiKey || !account.brokerSecret) return;
    setLoading(true);
    try {
      const sessionId = await AsyncStorage.getItem('sessionId');
      if (!sessionId) {
        console.log('No session ID, attempting login...');
        await login();
      }
      console.log('Attempting to configure broker with:', {
        brokerApiKey: account.brokerApiKey,
        brokerSecret: account.brokerSecret,
      });
      const response = await configureBroker(account.brokerApiKey, account.brokerSecret);
      console.log('API Response:', response);
      const updatedAccounts = subAccounts.map((acc) =>
        acc.id === account.id
          ? {
              ...acc,
              brokerConnected: response.status === true,
              availableBalance: response.broker_accountinfo?.['GLKPZPXmtwmMP_qrwkyntz_6195']?.available_Balance || acc.availableBalance,
              cashBalance: response.broker_accountinfo?.['GLKPZPXmtwmMP_qrwkyntz_6195']?.cashBalance || acc.cashBalance,
              currency: response.broker_accountinfo?.['GLKPZPXmtwmMP_qrwkyntz_6195']?.cur || acc.currency,
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

  const toggleStatus = (id) => {
    const updatedAccounts = subAccounts.map((account) =>
      account.id === id
        ? { ...account, status: account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
        : account
    );
    setSubAccounts(updatedAccounts);
    saveSubAccounts(updatedAccounts);
    console.log(`Toggling ${id} to ${subAccounts.find((acc) => acc.id === id).status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
    const account = updatedAccounts.find((acc) => acc.id === id);
    fetchSubAccountDetails(account);
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
          {loading && <Text style={styles.loadingText}>Loading...</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
          <ScrollView>
            {subAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.subAccountBox}
                onPress={() => navigation.navigate('SubAccountDetails', { account })}
              >
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
                      console.log(`Starting Paper Test for ${account.id} with ${account.algorithm}`);
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
                    onPress={() => {
                      console.log(
                        `Starting Real Trade for ${account.id} with ${account.algorithm}` +
                        `${account.brokerConnected ? ' (Live)' : ' (Simulated, upload optional)'}`);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Real Trade</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4FC3F7' }]}
                    onPress={() => toggleStatus(account.id)}
                  >
                    <Text style={styles.actionButtonText}>
                      {account.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <SubAccountCreation visible={modalVisible} onClose={() => setModalVisible(false)} />
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
  },
  box: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginTop: 50,
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
    paddingVertical: 5,
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