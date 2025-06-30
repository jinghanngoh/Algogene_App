import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SubAccounts = () => {
  const navigation = useNavigation();

  // Placeholder data for Sub Accounts with state management
  const [subAccounts, setSubAccounts] = useState([
    {
      id: '#1000',
      broker: 'Binance',
      algorithm: 'Momentum Strategy v1',
      currency: 'USD',
      leverage: '5.0',
      subscriptionEnd: '2025-08-31 02:02:51',
      runningScript: 'Momentum_v1',
      availableBalance: '1000000.0',
      cashBalance: '1000000.0',
      realizedPL: '0.0',
      unrealizedPL: '0.0',
      marginUsed: '0.0',
      status: 'INACTIVE',
      brokerConnected: false,
    },
    {
      id: '#1001',
      broker: 'Binance',
      algorithm: 'Trend Strategy v2',
      currency: 'BTC',
      leverage: '3.0',
      subscriptionEnd: '2025-09-15 12:00:00',
      runningScript: 'Trend_v2',
      availableBalance: '0.5',
      cashBalance: '0.1',
      realizedPL: '0.02',
      unrealizedPL: '-0.01',
      marginUsed: '0.3',
      status: 'ACTIVE',
      brokerConnected: true,
    },
    {
      id: '#1002',
      broker: 'Kraken',
      algorithm: 'Mean Reversion v1',
      currency: 'USD',
      leverage: '10.0',
      subscriptionEnd: '2025-10-01 08:30:00',
      runningScript: 'MeanRev_v1',
      availableBalance: '500000.0',
      cashBalance: '200000.0',
      realizedPL: '5000.0',
      unrealizedPL: '-2000.0',
      marginUsed: '100000.0',
      status: 'ACTIVE',
      brokerConnected: true,
    },
    {
      id: '#1003',
      broker: 'Binance',
      algorithm: 'Scalping Strategy v1',
      currency: 'USD',
      leverage: '8.0',
      subscriptionEnd: '2025-11-01 09:00:00',
      runningScript: 'Scalp_v1',
      availableBalance: '750000.0',
      cashBalance: '300000.0',
      realizedPL: '1000.0',
      unrealizedPL: '500.0',
      marginUsed: '200000.0',
      status: 'ACTIVE',
      brokerConnected: false,
    },
  ]);

  // Function to toggle Sub Account status
  const toggleStatus = (id) => {
    setSubAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === id
          ? { ...account, status: account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : account
      )
    );
    console.log(`Toggling ${id} to ${subAccounts.find(acc => acc.id === id).status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Sub Accounts List */}
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Sub Accounts</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateSubAccount')}
            >
              <Text style={styles.createButtonText}>+ Create</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Manage your trading sub accounts, each linked to a single broker and algorithm. Run Paper Tests or Real Trades to evaluate strategies.
          </Text>
          <ScrollView>
            {subAccounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={styles.subAccountBox}
                onPress={() =>
                  navigation.navigate('SubAccountDetails', { account })
                }
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
                    {account.currency === 'USD'
                      ? '$'
                      : account.currency === 'BTC'
                      ? '₿'
                      : ''}{account.availableBalance}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Cash Balance:</Text>
                  <Text style={styles.detailsValue}>
                    {account.currency === 'USD'
                      ? '$'
                      : account.currency === 'BTC'
                      ? '₿'
                      : ''}{account.cashBalance}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
});

export default SubAccounts;