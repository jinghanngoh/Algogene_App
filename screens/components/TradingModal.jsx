import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSubscription } from '../../context/SubscriptionContext';
import { fetchAlgoDailyReturns, fetchAlgoPerformance } from '../../services/testApi';

const TradingModal = ({ visible, onClose, strategy = null }) => {
  const { subscribedAlgorithm, subscribeToAlgorithm, unsubscribeFromAlgorithm } = useSubscription();
  const [performanceStats, setPerformanceStats] = useState(null);
  const [dailyReturns, setDailyReturns] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [loadingDailyReturns, setLoadingDailyReturns] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    console.log('Strategy:', strategy);
    if (strategy?.algo_id) {
      fetchPerformanceStats(strategy.algo_id);
      fetchDailyReturnsData(strategy.algo_id);
    }
  }, [strategy]);

  const fetchPerformanceStats = async (algoId) => {
    setLoadingPerformance(true);
    setErrorMessage(null);
    try {
      const performance = await fetchAlgoPerformance(algoId);
      setPerformanceStats(performance);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setErrorMessage(error.message || 'Failed to load performance data.');
    } finally {
      setLoadingPerformance(false);
    }
  };

  const fetchDailyReturnsData = async (algoId) => {
    setLoadingDailyReturns(true);
    setErrorMessage(null);
    try {
      const returns = await fetchAlgoDailyReturns(algoId);
      const formattedReturns = returns.slice(-5).map((item) => ({
        date: item.t, // Map 't' to 'date'
        return: item.r * 100, // Daily return as percentage (optional, keep if you want to show it)
        cumulativeReturn: item.cr * 100, // Cumulative return as percentage
      }));
      setDailyReturns(formattedReturns);
    } catch (error) {
      console.error('Error fetching daily returns:', error);
      setErrorMessage('Using random daily returns due to fetch error.');
    } finally {
      setLoadingDailyReturns(false);
    }
  };

  const currentStrategy = strategy || {
    algo_id: 'default-strategy',
    strategy: 'Unnamed Strategy',
    developer: 'Unknown Developer',
    desc: 'No description available.',
    price: 0,
    cur: 'USD',
    settings: {}
  };

  const isSubscribed = subscribedAlgorithm?.algo_id === currentStrategy.algo_id;

    // In TradingModal.jsx
    const handleSubscribe = () => {
      if (subscribedAlgorithm && subscribedAlgorithm.algo_id !== currentStrategy.algo_id) {
        Alert.alert(
          'Subscription Conflict',
          "You're already subscribed to another algorithm. Please unsubscribe first.",
          [{ text: 'OK' }]
        );
        return;
      }
      subscribeToAlgorithm(currentStrategy);
      onClose();
    };

  const handleUnsubscribe = () => {
    Alert.alert(
      'Confirm Unsubscribe',
      'Are you sure you want to unsubscribe from this strategy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          onPress: () => {
            unsubscribeFromAlgorithm();
            onClose();
          },
          style: 'destructive'
        }
      ]
    );
  };

  const chartData = performanceStats ? {
    labels: ['7d', '30d', '90d', '180d', '365d'],
    datasets: [{
      data: [
        performanceStats.rolling_return_7d * 100,
        performanceStats.rolling_return_30d * 100,
        performanceStats.rolling_return_90d * 100,
        performanceStats.rolling_return_180d * 100,
        performanceStats.rolling_return_365d * 100
      ],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }]
  } : {
    labels: ['7d', '30d', '90d', '180d', '365d'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }]
  };

  const chartConfig = {
    backgroundColor: '#1E1E1E',
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 8 },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#4FC3F7'
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: 'rgba(255, 255, 255, 0.1)'
    }
  };

  // return (
  //   <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
  //     <ScrollView style={styles.container}>
  //       {/* Header Section */}
  //       <View style={styles.header}>
  //         <View style={styles.titleContainer}>
  //           <Text style={styles.title}>{currentStrategy.strategy}</Text>
  //           <Text style={styles.developer}>By {currentStrategy.developer}</Text>
  //         </View>
  //         <View style={styles.priceContainer}>
  //           <Text style={styles.price}>
  //             {currentStrategy.price} {currentStrategy.cur}/month
  //           </Text>
  //         </View>
  //       </View>

  //       {/* Description Section */}
  //       <View style={styles.section}>
  //         <Text style={styles.sectionTitle}>DESCRIPTION</Text>
  //         <Text style={styles.description}>{currentStrategy.desc}</Text>
  //       </View>

  //       {/* Performance Chart */}
  //       <View style={styles.section}>
  //         <Text style={styles.sectionTitle}>ROLLING RETURNS (%)</Text>
  //         <View style={styles.chartContainer}>
  //           <LineChart
  //             data={chartData}
  //             width={Dimensions.get('window').width - 40}
  //             height={220}
  //             chartConfig={chartConfig}
  //             bezier
  //             style={styles.chart}
  //           />
  //         </View>
  //       </View>

  //       {/* Strategy Settings */}
  //       {performanceStats?.setting && (
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>STRATEGY SETTINGS</Text>
  //           <View style={styles.detailItem}>
  //             <Text style={styles.detailLabel}>Asset Class:</Text>
  //             <Text style={styles.detailValue}>{performanceStats.setting.assetClass.join(', ')}</Text>
  //           </View>
  //           <View style={styles.detailItem}>
  //             <Text style={styles.detailLabel}>Base Currency:</Text>
  //             <Text style={styles.detailValue}>{performanceStats.setting.BaseCurrency}</Text>
  //           </View>
  //           <View style={styles.detailItem}>
  //             <Text style={styles.detailLabel}>Min Capital:</Text>
  //             <Text style={styles.detailValue}>${performanceStats.setting.min_capital.toLocaleString()}</Text>
  //           </View>
  //           <View style={styles.detailItem}>
  //             <Text style={styles.detailLabel}>Min Leverage:</Text>
  //             <Text style={styles.detailValue}>{performanceStats.setting.min_leverage}:1</Text>
  //           </View>
  //           <View style={styles.detailItem}>
  //             <Text style={styles.detailLabel}>Allow Short Sell:</Text>
  //           </View>
  //         </View>
  //       )}

  //       {/* Performance Metrics */}
  //       {loadingPerformance ? (
  //         <View style={styles.loadingContainer}>
  //           <ActivityIndicator size="large" color="#4FC3F7" />
  //         </View>
  //       ) : performanceStats ? (
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>PERFORMANCE METRICS</Text>
  //           <View style={styles.metricsGrid}>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Score</Text>
  //               <Text style={styles.detailValue}>{(performanceStats.Score_Total || 0).toFixed(2)}</Text>
  //             </View>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Trading Days</Text>
  //               <Text style={styles.detailValue}>{performanceStats.TradableDay|| 0}</Text>
  //             </View>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Sharpe Ratio</Text>
  //               <Text style={styles.detailValue}>{(performanceStats.AnnualSharpe || performanceStats.sharpe_ratio || 0).toFixed(2)}</Text>
  //             </View>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Sortino Ratio Ratio</Text>
  //               <Text style={styles.detailValue}>{(performanceStats.AnnualSortino || performanceStats.sortino_ratio || 0).toFixed(2)}</Text>
  //             </View>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Volatility</Text>
  //               <Text style={styles.detailValue}>{((performanceStats.AnnualVolatility || performanceStats.volatility || 0) * 100).toFixed(1)}%</Text>
  //             </View>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Annualized Return</Text>
  //               <Text style={styles.detailValue}>{((performanceStats.MeanAnnualReturn || performanceStats.annualized_return || 0) * 100).toFixed(1)}%</Text>
  //             </View>
  //             <View style={styles.metricItem}>
  //               <Text style={styles.detailLabel}>Max Drawdown</Text>
  //               <Text style={styles.detailValue}>{(performanceStats.maxDrawdown_pct * 100).toFixed(1)}%</Text>
  //             </View>
  //           </View>
  //         </View>
  //       ) : (
  //         <View style={styles.section}>
  //           <Text style={styles.description}>No performance data available</Text>
  //         </View>
  //       )}

  //       <View style={styles.section}>
  //         <Text style={styles.sectionTitle}>LAST 5 DAILY RETURNS</Text>
  //         {loadingDailyReturns ? (
  //           <View style={styles.loadingContainer}>
  //             <ActivityIndicator size="large" color="#4FC3F7" />
  //           </View>
  //         ) : dailyReturns ? (
  //           <View style={styles.tableContainer}>
  //             <View style={styles.tableHeader}>
  //               <Text style={[styles.tableHeaderText, styles.tableCell]}>Date</Text>
  //               <Text style={[styles.tableHeaderText, styles.tableCell]}>Daily Return (%)</Text>
  //               <Text style={[styles.tableHeaderText, styles.tableCell]}>Cumulative Return (%)</Text>
  //             </View>
  //             {dailyReturns.map((item, index) => (
  //               <View key={index} style={styles.tableRow}>
  //                 <Text style={[styles.tableCell, styles.tableText]}>{item.date}</Text>
  //                 <Text style={[styles.tableCell, styles.tableText]}>
  //                   {item.return > 0 ? `+${item.return.toFixed(2)}` : item.return.toFixed(2)}
  //                 </Text>
  //                 <Text style={[styles.tableCell, styles.tableText]}>
  //                   {item.cumulativeReturn > 0 ? `+${item.cumulativeReturn.toFixed(2)}` : item.cumulativeReturn.toFixed(2)}
  //                 </Text>
  //               </View>
  //             ))}
  //           </View>
  //         ) : (
  //           <Text style={styles.description}>No daily returns available</Text>
  //         )}
  //       </View>

  //       {/* Action Buttons */}
  //       <View style={styles.buttonContainer}>
  //         <TouchableOpacity
  //           style={[styles.button, isSubscribed ? styles.unsubscribeButton : styles.subscribeButton]}
  //           onPress={isSubscribed ? handleUnsubscribe : handleSubscribe}
  //         >
  //           <Text style={styles.buttonText}>
  //             {isSubscribed ? 'UNSUBSCRIBE' : 'SUBSCRIBE'}
  //           </Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
  //           <Text style={styles.closeButtonText}>CLOSE</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </ScrollView>
  //   </Modal>
  // );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.container}>
        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{currentStrategy.strategy}</Text>
            <Text style={styles.developer}>By {currentStrategy.developer}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {currentStrategy.price} {currentStrategy.cur}/month
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.description}>{currentStrategy.desc}</Text>
        </View>

        {/* Performance Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROLLING RETURNS (%)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Strategy Settings */}
        {performanceStats?.setting && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STRATEGY SETTINGS</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Asset Class:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.assetClass.join(', ')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Base Currency:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.BaseCurrency}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Min Capital:</Text>
              <Text style={styles.detailValue}>${performanceStats.setting.min_capital.toLocaleString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Min Leverage:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.min_leverage}:1</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Allow Short Sell:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.allowShortSell}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Strategy Name:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.strategyName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Subscribed Assets:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.subscribeList.join(', ')}</Text>
            </View>
          </View>
        )}

        {/* Performance Metrics */}
        {loadingPerformance ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4FC3F7" />
          </View>
        ) : performanceStats ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCE METRICS</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Score</Text>
                <Text style={styles.detailValue}>{(performanceStats.Score_Total || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Trading Days</Text>
                <Text style={styles.detailValue}>{performanceStats.TradableDay || 0}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Sharpe Ratio</Text>
                <Text style={styles.detailValue}>{(performanceStats.AnnualSharpe || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Sortino Ratio</Text>
                <Text style={styles.detailValue}>{(performanceStats.AnnualSortino || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Volatility</Text>
                <Text style={styles.detailValue}>{((performanceStats.PlainAnnStdDev || 0) * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Annualized Return</Text>
                <Text style={styles.detailValue}>{((performanceStats.MeanAnnualReturn || 0) * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Max Drawdown</Text>
                <Text style={styles.detailValue}>{((performanceStats.maxDrawdown_pct || 0) * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Win Rate</Text>
                <Text style={styles.detailValue}>{((performanceStats.WinRate || 0) * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Profit Factor</Text>
                <Text style={styles.detailValue}>{(performanceStats.profit_factor || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.description}>No performance data available</Text>
          </View>
        )}

        {/* Daily Returns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LAST 5 DAILY RETURNS</Text>
          {loadingDailyReturns ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4FC3F7" />
            </View>
          ) : dailyReturns ? (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.tableCell]}>Date</Text>
                <Text style={[styles.tableHeaderText, styles.tableCell]}>Daily Return (%)</Text>
                <Text style={[styles.tableHeaderText, styles.tableCell]}>Cumulative Return (%)</Text>
              </View>
              {dailyReturns.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableText]}>{item.date}</Text>
                  <Text style={[styles.tableCell, styles.tableText]}>
                    {item.return > 0 ? `+${item.return.toFixed(2)}` : item.return.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableText]}>
                    {item.cumulativeReturn > 0 ? `+${item.cumulativeReturn.toFixed(2)}` : item.cumulativeReturn.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.description}>No daily returns available</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isSubscribed ? styles.unsubscribeButton : styles.subscribeButton]}
            onPress={isSubscribed ? handleUnsubscribe : handleSubscribe}
          >
            <Text style={styles.buttonText}>
              {isSubscribed ? 'UNSUBSCRIBE' : 'SUBSCRIBE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 15,
  },
  titleContainer: {
    flex: 2,
  },
  priceContainer: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  developer: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  description: {
    fontSize: 15,
    color: '#E0E0E0',
    lineHeight: 22,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4FC3F7',
  },
  section: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9E9E9E',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButton: {
    backgroundColor: '#4FC3F7',
  },
  unsubscribeButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
  },
  tableText: {
    fontSize: 14,
  },
});

export default TradingModal;