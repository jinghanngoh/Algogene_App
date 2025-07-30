// For users to view and manage trading accounts (Display portfolio value, account balances, position data, performance metrics and trading history)
// Uses SubAccountsContext to access account info and makes API calls to retrieve real-time trading data
// Throttled is done to reduce frequency of API calls, to make the app faster and less jammed 
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSubAccounts } from '../../context/SubAccountsContext';
import { getRealTimeAccountBalance, getRealTimeAccountPosition } from '../../services/TradingApi';
import { throttledGetRealTimeAccountBalance, throttledGetRealTimeAccountPosition, throttledGetTradingPerformanceStats, throttledGetDailyCumulativePL, throttledGetDailyPosition, throttledGetTradeHistory, throttledGetAlgoStatistics, } from '../../services/TradingApi';

const AccountManager = () => {
  const { subAccounts, setSubAccounts, saveSubAccounts } = useSubAccounts();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState([]);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [dailyPL, setDailyPL] = useState(null); 
  const [dailyPositions, setDailyPositions] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [algoStats, setAlgoStats] = useState(null);
  const [activeAlgoId, setActiveAlgoId] = useState('jjvp5_qrwkyntz_6194'); // Hardcoded this as we use this algo for testing 

  const totalPortfolioValue = subAccounts.length > 0  // Calculate Account-level metrics
    ? subAccounts.reduce((sum, acc) => sum + parseFloat(acc.availableBalance || 0) + parseFloat(acc.cashBalance || 0), 0).toFixed(2)
    : '0.00';
  const totalPL = subAccounts.length > 0
    ? subAccounts.reduce((sum, acc) => sum + parseFloat(acc.realizedPL || 0) + parseFloat(acc.unrealizedPL || 0), 0).toFixed(2)
    : '0.00';
  const activeSubAccounts = subAccounts.filter(acc => acc.status === 'ACTIVE').length;
  const totalPositions = positions.length;
  const totalMarketValue = positions.reduce((sum, pos) => sum + parseFloat(pos.marketValue || 0), 0).toFixed(2);

  const cashBalanceData = { // Data for BarChart (total cash balance across Sub Accounts)
    labels: subAccounts.map(acc => acc.id),
    datasets: [
      {
        data: subAccounts.map(acc => parseFloat(acc.cashBalance || 0) || 0),
      },
    ],
  };

  const accountBalance = { // Hardcoded placeholder for bank account/credit card data
    availableBalance: '1500000.0',
    cashBalance: '1200000.0',
  };

  const fetchPortfolioData = async () => {
    if (loading) return; // Prevent concurrent fetches
    setLoading(true);
    setError(null);
    
    try {
      const updatedAccounts = await Promise.all(
        subAccounts.map(async (account) => {
          try {
            const balanceResponse = await throttledGetRealTimeAccountBalance(account.brokerId || account.id);
            const positionResponse = await throttledGetRealTimeAccountPosition(account.brokerId || account.id);
            
            if (!balanceResponse || !balanceResponse.balance) {
              console.log(`No valid balance data for account ${account.id}`);
              return account;
            }
            
            if (!positionResponse) {
              console.log(`No valid position data for account ${account.id}`);
            } else if (positionResponse.positions && positionResponse.positions.length > 0) { // Update position if there are things to be updated
              setPositions(prev => [
                ...prev.filter(pos => pos.accountId !== account.id),
                ...positionResponse.positions.map(pos => ({ ...pos, accountId: account.id })),
              ]);
            }
            
            return {
              ...account,
              availableBalance: balanceResponse.balance.availableBalance,
              cashBalance: balanceResponse.balance.nav,
              currency: balanceResponse.balance.currency,
              brokerConnected: balanceResponse.balance.isBinded,
              errorMessage: balanceResponse.balance.errorMessage,
            };
          } catch (err) {
            console.error(`Error fetching data for ${account.id}:`, err);
            return account;
          }
        })
      );

      // Fetch trade history data for all accounts
      if (subAccounts.length > 0) {
        await fetchTradeHistoryData();
      }
      
      const hasChanges = JSON.stringify(updatedAccounts) !== JSON.stringify(subAccounts); // See if got changes
      if (hasChanges) {
        setSubAccounts(updatedAccounts);
        saveSubAccounts(updatedAccounts);
      } else {
        console.log('No changes detected in account data');
      }
    } catch (err) {
      setError('Failed to fetch portfolio data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new function to fetch trade history data:
  const fetchTradeHistoryData = async () => {
    try {
      // Get the most active account or the first one
      const account = subAccounts.find(acc => acc.status === 'ACTIVE') || subAccounts[0];
      if (!account) return;
      
      const accountId = account.brokerId || account.id;
      const algoId = activeAlgoId || 'jjvp5_qrwkyntz_6194'; // Use your active algo ID
      
      console.log(`Fetching trade history for algo: ${algoId}`);
      
      // Use getAlgoStatistics for transactions history
      const response = await throttledGetAlgoStatistics(accountId, algoId);
      
      if (response && response.response && response.response.trades) {
        // Transform the trades data into the format your component expects
        const formattedTrades = response.response.trades.map(trade => ({
          date: trade.timestamp || trade.date || trade.transTime,
          symbol: trade.symbol || trade.instrumentId,
          side: trade.side || trade.orderSide || (trade.action === 'buy' ? 'BUY' : 'SELL'),
          price: parseFloat(trade.price || trade.fillPrice || trade.avgPrice || 0),
          quantity: parseFloat(trade.quantity || trade.size || trade.fillSize || 0),
          value: parseFloat(trade.value || (trade.price * trade.quantity) || 0),
          id: trade.id || trade.tradeId || trade.orderID,
          status: trade.status || 'FILLED',
          pnl: parseFloat(trade.pnl || trade.realizedPnl || 0)
        }));
        
        setTradeHistory(formattedTrades);
        console.log(`Fetched ${formattedTrades.length} trades from getAlgoStatistics`);
      } else {
        console.log('No valid trade history data returned from getAlgoStatistics');
        setTradeHistory([]);
      }
    } catch (error) {
      console.error('Error fetching trade history:', error);
      setTradeHistory([]);
    }
  };

  const fetchPerformanceData = async () => { // Fetch performance data (statistics, P/L, positions, trades, algo stats)
    try {
      if (!subAccounts || subAccounts.length === 0) {
        console.log('No accounts available for performance data');
        return;
      }
      
      const account = subAccounts[0]; // Use first account (Hardcoded for now, need to decide which to use later on)
      const accountId = account.brokerId || account.id;
      
      try {
        const performanceResponse = await throttledGetTradingPerformanceStats(accountId);
        if (performanceResponse) {
          setPerformanceStats(performanceResponse.performance || {});
        }
      } catch (perfError) {
        console.error('Error fetching performance stats:', perfError);
      }
      
      try { // Get daily cumulative P/L data
        const plResponse = await throttledGetDailyCumulativePL(accountId);
        if (plResponse) {
          setDailyPL(plResponse.data || []);
        }
      } catch (plError) {
        console.error('Error fetching daily P/L data:', plError);
      }
      
      try { // Get daily position data
        const positionResponse = await throttledGetDailyPosition(accountId);
        if (positionResponse && positionResponse.status) {
          setDailyPositions(positionResponse.data || []);
        }
      } catch (posError) {
        console.error('Error fetching daily positions:', posError);
      }

      try { // Use activeAlgoId if available, or try to get it from the account
        const algoId = activeAlgoId || account.algoId || 'jjvp5_qrwkyntz_6194'; // Remove the hardcode later 

        const algoResponse = await throttledGetAlgoStatistics(accountId, algoId);
        if (algoResponse && algoResponse.status) {
          setAlgoStats({
            statistics: algoResponse.statistics || {},
            performance: algoResponse.performance || {}
          });
        } else {
          console.log('No valid algo statistics returned');
        }
      } catch (algoError) {
        console.error('Error fetching algo statisticsp:', algoError);
      }
    } catch (error) {
      console.error('Error in fetchPerformanceData:', error);
    }
  };
  
  useEffect(() => {
    if (subAccounts.length > 0) {
      fetchTradeHistoryData();
    }
  }, [subAccounts.length, activeAlgoId]); // Re-fetch when accounts or active algo changes
  
  const DailyPositionSection = ({ dailyPositions }) => {
    if (!dailyPositions || dailyPositions.length === 0) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Positions</Text>
          <Text style={styles.emptyText}>No position data available</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Daily Positions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Date</Text>
              <Text style={styles.tableHeaderCell}>Symbol</Text>
              <Text style={styles.tableHeaderCell}>Quantity</Text>
              <Text style={styles.tableHeaderCell}>Side</Text>
              <Text style={styles.tableHeaderCell}>Value</Text>
            </View>
            {dailyPositions.map((position, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{position.date || 'N/A'}</Text>
                <Text style={styles.tableCell}>{position.symbol || 'N/A'}</Text>
                <Text style={styles.tableCell}>{position.quantity || '0'}</Text>
                <Text style={styles.tableCell}>{position.side || 'N/A'}</Text>
                <Text style={styles.tableCell}>{position.value ? `$${parseFloat(position.value).toFixed(2)}` : '$0.00'}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const TradeHistorySection = ({ trades, isLoading, onRefresh }) => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4FC3F7" />
          <Text style={styles.loadingText}>Loading trade history...</Text>
        </View>
      );
    }
    
    if (!trades || trades.length === 0) {
      return (
        <View style={styles.emptyTradeHistory}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyText}>No trade history available</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
      <View>
        <Text style={styles.sectionTitle}>Recent Trades</Text>
        <View style={styles.tradeHistoryTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Symbol</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Side</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Size</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>P&L</Text>
          </View>
          
          <ScrollView style={styles.tableScrollView}>
            {trades.map((trade, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.tableRow}
                onPress={() => alert(`Trade Details:\nID: ${trade.id || 'N/A'}\nCommission: $${(trade.commission || 0).toFixed(2)}\nStatus: ${trade.status || 'FILLED'}`)}
              >
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {new Date(trade.date).toLocaleDateString()} {new Date(trade.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{trade.symbol}</Text>
                <Text style={[
                  styles.tableCell, 
                  { flex: 1 }, 
                  trade.side === 'BUY' ? styles.buyText : styles.sellText
                ]}>
                  {trade.side}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>${trade.price.toFixed(2)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{trade.quantity.toFixed(4)}</Text>
                <Text style={[
                  styles.tableCell, 
                  { flex: 1.5 }, 
                  (trade.pnl || 0) >= 0 ? styles.profitText : styles.lossText
                ]}>
                  ${(trade.pnl || 0).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <TouchableOpacity 
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate('TradeHistory', { accountId: subAccounts[0]?.id })} // TO BE IMPLEMENTED, a page retrieving all trading history
        >
          <Text style={styles.viewMoreText}>View all trades</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Algo Statistics Section Component
  const AlgoStatsSection = ({ stats }) => {
    if (!stats) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Algorithm Statistics</Text>
          <Text style={styles.emptyText}>No algorithm data available</Text>
        </View>
      );
    }
  const { statistics, performance } = stats;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Algorithm Statistics</Text>
      
      <View style={styles.statsCardContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Win Rate</Text>
          <Text style={styles.statsValue}>
            {statistics.winRate ? `${(parseFloat(statistics.winRate) * 100).toFixed(1)}%` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Profit Factor</Text>
          <Text style={styles.statsValue}>
            {statistics.profitFactor ? parseFloat(statistics.profitFactor).toFixed(2) : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Sharpe Ratio</Text>
          <Text style={styles.statsValue}>
            {performance.sharpeRatio ? parseFloat(performance.sharpeRatio).toFixed(2) : 'N/A'}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsCardContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Total Trades</Text>
          <Text style={styles.statsValue}>{statistics.totalTrades || '0'}</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Net P/L</Text>
          <Text style={[
            styles.statsValue, 
            (performance.netPL > 0) ? styles.profitText : styles.lossText
          ]}>
            {performance.netPL ? `$${parseFloat(performance.netPL).toFixed(2)}` : '$0.00'}
          </Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Max Drawdown</Text>
          <Text style={styles.statsValue}>
            {performance.maxDrawdown ? `${(parseFloat(performance.maxDrawdown) * 100).toFixed(1)}%` : 'N/A'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.viewMoreButton}
        onPress={() => navigation.navigate('AlgoDetails', { algoId: activeAlgoId, stats })}
      >
        <Text style={styles.viewMoreText}>View detailed statistics</Text>
      </TouchableOpacity>
    </View>
  );
};

  useEffect(() => {
    if (subAccounts.length > 0) {
      // Initial data fetch
      fetchPortfolioData();
      
      // Set up polling interval (every 30 seconds)
      const intervalId = setInterval(() => {
        console.log('Scheduled data refresh (30s interval)');
        fetchPortfolioData();
      }, 30000);
      
      // Clean up interval on component unmount
      return () => {
        console.log('Cleaning up interval');
        clearInterval(intervalId);
      };
    }
  }, [/* Only include subAccounts.length as dependency */]);  // Only run when component mounts or subAccount length changes

  useEffect(() => {
    if (subAccounts.length > 0) {
      fetchPerformanceData();
    }
  }, [subAccounts.length]);

  const fetchAlgoData = async (algoId = activeAlgoId || 'jjvp5_qrwkyntz_6194') => {
    try {
      const stats = await throttledGetAlgoStatistics(null, algoId);
      if (stats && stats.status) {
        // setAlgoStatistics(stats.statistics);
        setAlgoStats(stats.statistics);
        setAlgoPerformance(stats.performance);
      }
    } catch (error) {
      console.error('Error fetching algo statisticsx:', error);
    }
  };

  useEffect(() => {
    if (subAccounts.length > 0){
      fetchAlgoData(activeAlgoId);
    }
  }, [subAccounts.length, activeAlgoId]);

return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.firstbox}>
          <Text style={styles.sectionTitle}>Accounts Overview</Text>
          {loading && <ActivityIndicator size="small" color="#4FC3F7" />}
          {error && <Text style={styles.errorText}>{error}</Text>}
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
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Total Sub Accounts:</Text>
            <Text style={styles.detailsValue}>{subAccounts.length}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Total Positions:</Text>
            <Text style={styles.detailsValue}>{totalPositions}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Total Market Value:</Text>
            <Text style={styles.detailsValue}>${totalMarketValue}</Text>
          </View>
            <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Accounts/SubAccounts')}
            >
              <Text style={styles.actionButtonText}>View Sub Accounts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={fetchPortfolioData}
            >
              <Text style={styles.actionButtonText}>Refresh Portfolio</Text>
            </TouchableOpacity>
          </View>
        </View>


        <View style= {styles.box}>
          <DailyPositionSection dailyPositions={dailyPositions} />
        </View>

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
              backgroundColor: '#1a1a1a',
              backgroundGradientFrom: '#1a1a1a',
              backgroundGradientTo: '#1a1a1a',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 195, 247, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
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

        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Position Summary</Text>
          {positions.length === 0 ? (
            <Text style={styles.emptyText}>No open positions</Text>
          ) : (
            positions.slice(0, 5).map((position, index) => (
              <View key={index} style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>{position.name} ({position.accountId})</Text>
                <Text style={styles.detailsValue}>
                  {position.position} shares @ ${position.marketPrice}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.box}>
          <TradeHistorySection 
            trades={tradeHistory} 
            isLoading={loading} 
            onRefresh={fetchTradeHistoryData} 
          />
        </View>

        <View style={styles.box}>
          <AlgoStatsSection stats={algoStats} />
        </View>

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
    marginTop: 100,
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
    gap: 10, 
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
    marginTop: 40,
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
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    width: 100,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tableCell: {
    width: 100,
    textAlign: 'center',
    color: '#444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginVertical: 15,
  },
  viewMoreText: {
    marginTop: 10,
    color: '#4FC3F7',
  },
  refreshButtonText: {
    color: '#888',
  }
});

export default AccountManager;