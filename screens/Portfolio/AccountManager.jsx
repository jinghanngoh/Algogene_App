import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AccountManager = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  // Placeholder data for Sub Accounts (used for calculations only)
  const subAccounts = [
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
    },
  ];

  // Calculate Account-level metrics
  const totalPortfolioValue = subAccounts
    .reduce((sum, acc) => sum + parseFloat(acc.availableBalance) + parseFloat(acc.cashBalance), 0)
    .toFixed(2);
  const totalPL = subAccounts
    .reduce((sum, acc) => sum + parseFloat(acc.realizedPL) + parseFloat(acc.unrealizedPL), 0)
    .toFixed(2);
  const activeSubAccounts = subAccounts.filter(acc => acc.status === 'ACTIVE').length;

  // Data for BarChart (total cash balance across Sub Accounts)
  const cashBalanceData = {
    labels: subAccounts.map(acc => acc.id),
    datasets: [
      {
        data: subAccounts.map(acc => parseFloat(acc.cashBalance)),
      },
    ],
  };

  // Placeholder for bank account/credit card data
  const accountBalance = {
    availableBalance: '1500000.0',
    cashBalance: '1200000.0',
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

        {/* Account Summary */}
        <View style={styles.firstbox}>
          <Text style={styles.sectionTitle}>Portfolio Overview</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Total Portfolio Value:</Text>
            <Text style={styles.detailsValue}>${totalPortfolioValue}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Total P/L:</Text>
            <Text style={styles.detailsValue}>
              {totalPL >= 0 ? '+' : ''}${totalPL}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Active Sub Accounts:</Text>
            <Text style={styles.detailsValue}>{activeSubAccounts}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SubAccounts')}
          >
            <Text style={styles.actionButtonText}>View Sub Accounts</Text>
          </TouchableOpacity>
        </View>

        {/* Cash Balance Chart */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Cash Balances</Text>
          <BarChart
            data={cashBalanceData}
            width={screenWidth - 60}
            height={220}
            yAxisLabel="$"
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero
            showBarTops={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            chartConfig={{
              backgroundColor: '#000000',
              backgroundGradientFrom: '#000000',
              backgroundGradientTo: '#000000',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
              barPercentage: 0.4,
              propsForLabels: {
                fontSize: 10,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisLabel}>0</Text>
            <Text style={styles.yAxisLabel}>200K</Text>
            <Text style={styles.yAxisLabel}>400K</Text>
            <Text style={styles.yAxisLabel}>600K</Text>
            <Text style={styles.yAxisLabel}>800K</Text>
            <Text style={styles.yAxisLabel}>1M</Text>
          </View>
        </View>

        {/* Bank Account/Credit Card Linking */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Available Balance:</Text>
            <Text style={styles.detailsValue}>${accountBalance.availableBalance}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Cash Balance:</Text>
            <Text style={styles.detailsValue}>${accountBalance.cashBalance}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4FC3F7' }]}
              onPress={() => alert('Link Bank Account (Placeholder)')}
            >
              <Text style={styles.actionButtonText}>Link Bank Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4FC3F7' }]}
              onPress={() => alert('Link Credit Card (Placeholder)')}
            >
              <Text style={styles.actionButtonText}>Link Credit Card</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => alert('Deposit Funds (Placeholder)')}
            >
              <Text style={styles.actionButtonText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#D32F2F' }]}
              onPress={() => alert('Withdraw Funds (Placeholder)')}
            >
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
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
  firstbox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginTop: 60,
  },
  box: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#4FC3F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  yAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
  },
  yAxisLabel: {
    color: 'white',
    fontSize: 10,
  },
});

export default AccountManager;