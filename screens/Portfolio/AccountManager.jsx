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
  const [activeAlgoId, setActiveAlgoId] = useState('jjvp5_qrwkyntz_6194');

  // Calculate Account-level metrics
  const totalPortfolioValue = subAccounts.length > 0
    ? subAccounts.reduce((sum, acc) => sum + parseFloat(acc.availableBalance || 0) + parseFloat(acc.cashBalance || 0), 0).toFixed(2)
    : '0.00';
  const totalPL = subAccounts.length > 0
    ? subAccounts.reduce((sum, acc) => sum + parseFloat(acc.realizedPL || 0) + parseFloat(acc.unrealizedPL || 0), 0).toFixed(2)
    : '0.00';
  const activeSubAccounts = subAccounts.filter(acc => acc.status === 'ACTIVE').length;
  const totalPositions = positions.length;
  const totalMarketValue = positions.reduce((sum, pos) => sum + parseFloat(pos.marketValue || 0), 0).toFixed(2);

  // Data for BarChart (total cash balance across Sub Accounts)
  const cashBalanceData = {
    labels: subAccounts.map(acc => acc.id),
    datasets: [
      {
        data: subAccounts.map(acc => parseFloat(acc.cashBalance || 0) || 0),
      },
    ],
  };

  // Placeholder for bank account/credit card data
  const accountBalance = {
    availableBalance: '1500000.0',
    cashBalance: '1200000.0',
  };

  const fetchPortfolioData = async () => {
    if (loading) return; // Prevent concurrent fetches
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching portfolio data...');
      
      const updatedAccounts = await Promise.all(
        subAccounts.map(async (account) => {
          try {
            const balanceResponse = await throttledGetRealTimeAccountBalance(account.brokerId || account.id);
            const positionResponse = await throttledGetRealTimeAccountPosition(account.brokerId || account.id);
            
            // Only log errors, not successful operations
            if (!balanceResponse || !balanceResponse.balance) {
              console.log(`No valid balance data for account ${account.id}`);
              return account;
            }
            
            if (!positionResponse) {
              console.log(`No valid position data for account ${account.id}`);
            } else if (positionResponse.positions && positionResponse.positions.length > 0) {
              // Only update and log positions if there are any
              setPositions(prev => [
                ...prev.filter(pos => pos.accountId !== account.id),
                ...positionResponse.positions.map(pos => ({ ...pos, accountId: account.id })),
              ]);
              console.log(`Updated ${positionResponse.positions.length} positions for account ${account.id}`);
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
      
      // Compare if there are actual changes before updating state
      const hasChanges = JSON.stringify(updatedAccounts) !== JSON.stringify(subAccounts);
      if (hasChanges) {
        console.log('Updating account data with new values');
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

  // Fetch performance data (statistics, P/L, positions, trades, algo stats)
  const fetchPerformanceData = async () => {
    try {
      // Get the first account or return if no accounts available
      if (!subAccounts || subAccounts.length === 0) {
        console.log('No accounts available for performance data');
        return;
      }
      
      // Use the first account (typically your Binance account)
      const account = subAccounts[0];
      const accountId = account.brokerId || account.id;
      
      console.log('Fetching performance data for account:', accountId);
      
      // Get performance statistics
      try {
        const performanceResponse = await throttledGetTradingPerformanceStats(accountId);
        if (performanceResponse) {
          setPerformanceStats(performanceResponse.performance || {});
        }
      } catch (perfError) {
        console.error('Error fetching performance stats:', perfError);
      }
      
      // Get daily cumulative P/L data
      try {
        const plResponse = await throttledGetDailyCumulativePL(accountId);
        if (plResponse) {
          setDailyPL(plResponse.data || []);
        }
      } catch (plError) {
        console.error('Error fetching daily P/L data:', plError);
      }
      
      // Get daily position data
      try {
        const positionResponse = await throttledGetDailyPosition(accountId);
        if (positionResponse && positionResponse.status) {
          console.log('Daily positions loaded:', positionResponse.data.length);
          setDailyPositions(positionResponse.data || []);
        }
      } catch (posError) {
        console.error('Error fetching daily positions:', posError);
      }

      try {
        // Use activeAlgoId if available, or try to get it from the account
        const algoId = activeAlgoId || account.algoId || 'jjvp5_qrwkyntz_6194';
        
        console.log('Fetching algo statistics for:', algoId);
        
        const algoResponse = await throttledGetAlgoStatistics(accountId, algoId);
        if (algoResponse && algoResponse.status) {
          console.log('Algo statistics loaded for:', algoId);
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
  
  // Initial data load and polling setup
  useEffect(() => {
    if (subAccounts.length > 0) {
      // Initial data fetch
      fetchPortfolioData();
      fetchPerformanceData();
      
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
  }, [subAccounts.length]); // Only run when component mounts or subAccount length changes

  // Account Card Component
  const AccountCard = ({ account }) => {
    return (
      <TouchableOpacity 
        style={styles.accountCard}
        onPress={() => navigation.navigate('AccountDetails', { accountId: account.id })}
      >
        <View style={styles.accountHeader}>
          <Text style={styles.accountId}>Account #{account.id}</Text>
          <View style={[styles.statusBadge, 
            { backgroundColor: account.status === 'ACTIVE' ? '#4caf50' : '#ff9800' }]}>
            <Text style={styles.statusText}>{account.status}</Text>
          </View>
        </View>
        
        <View style={styles.accountBalance}>
          <Text style={styles.balanceLabel}>Available Balance:</Text>
          <Text style={styles.balanceAmount}>
            {account.currency} {parseFloat(account.availableBalance).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.accountMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Cash:</Text>
            <Text style={styles.metaValue}>
              {account.currency} {parseFloat(account.cashBalance).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Broker:</Text>
            <Text style={styles.metaValue}>{account.broker || 'N/A'}</Text>
          </View>
        </View>
        
        {account.errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{account.errorMessage}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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

  // Trade History Section Component
  const TradeHistorySection = ({ trades }) => {
    if (!trades || trades.length === 0) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          <Text style={styles.emptyText}>No trade history available</Text>
        </View>
      );
    }

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Trades</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Date</Text>
              <Text style={styles.tableHeaderCell}>Symbol</Text>
              <Text style={styles.tableHeaderCell}>Side</Text>
              <Text style={styles.tableHeaderCell}>Price</Text>
              <Text style={styles.tableHeaderCell}>Quantity</Text>
              <Text style={styles.tableHeaderCell}>Value</Text>
            </View>
            {trades.slice(0, 10).map((trade, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{trade.date || 'N/A'}</Text>
                <Text style={styles.tableCell}>{trade.symbol || 'N/A'}</Text>
                <Text style={[
                  styles.tableCell, 
                  trade.side === 'BUY' ? styles.buyText : styles.sellText
                ]}>
                  {trade.side || 'N/A'}
                </Text>
                <Text style={styles.tableCell}>{trade.price ? `$${parseFloat(trade.price).toFixed(2)}` : 'N/A'}</Text>
                <Text style={styles.tableCell}>{trade.quantity || '0'}</Text>
                <Text style={styles.tableCell}>
                  {trade.value ? `$${parseFloat(trade.value).toFixed(2)}` : '$0.00'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        {trades.length > 10 && (
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate('TradeHistory', { trades })}
          >
            <Text style={styles.viewMoreText}>View all {trades.length} trades</Text>
          </TouchableOpacity>
        )}
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


  // useEffect(() => {
  //   if (subAccounts.length > 0) {
  //     fetchPortfolioData();
  //   }
  // }, [subAccounts]);

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
          <Text style={styles.sectionTitle}>Portfolio Overview</Text>
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
              onPress={() => navigation.navigate('Portfolio/SubAccounts')}
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
});

export default AccountManager;