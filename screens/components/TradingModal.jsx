import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Linking } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSubscription } from '../../context/SubscriptionContext';
import { fetchAlgoDailyReturns, fetchAlgoPerformance, subscribeToAlgorithm as apiSubscribeToAlgorithm, checkPaymentStatus} from '../../services/MarketplaceApi';
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TradingModal = ({ visible, onClose, strategy, isSelectingForSubAccount = false}) => {
  const router = useRouter();
  const { subscribedAlgorithm, subscribeToAlgorithm: contextSubscribeToAlgorithm } = useSubscription();
  const [performanceStats, setPerformanceStats] = useState(null);
  const [dailyReturns, setDailyReturns] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [loadingDailyReturns, setLoadingDailyReturns] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // console.log('Strategy:', strategy);
    if (strategy?.algo_id) {
      fetchPerformanceStats(strategy.algo_id);
      fetchDailyReturnsData(strategy.algo_id);
    }
  }, [strategy]);

  const fetchPerformanceStats = async (algoId) => {
    setLoadingPerformance(true);
    setErrorMessage(null);
    try {
      const response = await fetchAlgoPerformance(algoId);
      // console.log('Fetched performanceStats:', response);
      setPerformanceStats(response);
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

  const handleSelectForSubAccount = async () => {
    if (!strategy) {
      console.error('No strategy selected for subscription');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the strategy's algo_id
      const algo_id = 'jjvp5_qrwkyntz_6194';
      const accountId = 'GLKPZPXmtwmMP_qrwkyntz_6195'; 
      const userEmail = 'thegohrilla@gmail.com';

      console.log('Initiating subscription with:', { algo_id, accountId, userEmail });
      
      // Call the subscribeToAlgorithm function
      const result = await apiSubscribeToAlgorithm(
        algo_id,
        accountId,
        userEmail
      );

      console.log('Subscription API Full Response TTTTTTT:', JSON.stringify(result, null, 2));
      
      // For boolean responses
      if (typeof result === 'boolean') {
        if (result) {
          Alert.alert('Success', 'Successfully subscribed to algorithm');
          onClose();
        } else {
          throw new Error('Subscription request failed');
        }
      } else if (result && typeof result === 'object') {
        const { status, paymentLink, ticketId } = result;
  
        if (!status) {
          throw new Error('Subscription request failed');
        }
        
        if (paymentLink) {
          Alert.alert(
            'Subscription Successful',
            'You will be redirected to complete payment.',
            [
              {
                text: 'Continue to Payment',
                onPress: () => {
                  console.log('Opening payment link:', paymentLink);
                  Linking.openURL(paymentLink).catch(err => {
                    console.error('Failed to open payment link:', err);
                    setError('Failed to open payment link');
                  });
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => console.log('Payment cancelled by user'),
              },
            ]
          );

          // Set up payment status polling
        if (ticketId) {
          const maxDurationMs = 15 * 60 * 1000; // 15 minutes
          const pollIntervalMs = 10 * 1000; // 10 seconds
          let elapsedTimeMs = 0;
          
          const pollPaymentStatus = async () => {
            try {
              const response = await checkPaymentStatus(ticketId, userEmail);
              console.log('Payment Status Check:', JSON.stringify(response, null, 2));
              
              if (response.success && response.paymentStatus === 'completed') {
                console.log('Payment completed successfully');
                console.log(`Payment details: ${response.currency} ${response.amount}, settled at ${response.settleTime}`);
                
                clearInterval(pollInterval);
                setLoading(false);
                
                Alert.alert(
                  'Payment Successful',
                  `Your payment of ${response.currency} ${response.amount} was completed successfully.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Close the modal
                        onClose();
                        
                        // Try to navigate to a main screen if possible
                        if (navigation) {
                          try {
                            navigation.navigate('Home');
                          } catch (navError) {
                            console.log('Navigation to Home failed, trying Dashboard...');
                            try {
                              navigation.navigate('Dashboard');
                            } catch (navError2) {
                              console.log('Navigation to Dashboard failed, trying Marketplace...');
                              try {
                                navigation.navigate('Marketplace');
                              } catch (navError3) {
                                console.log('Could not navigate automatically.');
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                );
                return;
              }

              elapsedTimeMs += pollIntervalMs;
              if (elapsedTimeMs >= maxDurationMs) {
                console.log('Payment timeout after 15 minutes');
                clearInterval(pollInterval);
                setLoading(false);
                Alert.alert(
                  'Payment Timeout', 
                  'Payment not completed within 15 minutes. You can try again later.',
                  [{ text: 'OK', onPress: () => onClose() }]
                );
              }
            } catch (error) {
              console.error('Error polling payment status:', error);
              // Don't stop polling on error, just log it
            }
          };
                    
          const pollInterval = setInterval(pollPaymentStatus, pollIntervalMs);
        }
      } else {
        Alert.alert('Success', 'Successfully subscribed to algorithm');
        onClose();
      }
    } else {
      throw new Error('Invalid response format from subscription API');
    }
  } catch (error) {
    console.error('Error in subscription process:', error);
    setError('Failed to initiate subscription: ' + error.message);
    setLoading(false);
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

  const chartData = performanceStats ? {
    labels: ['7d', '30d', '90d', '180d', '365d'],
    datasets: [{
      data: [
        Number.isFinite(performanceStats.performance.rolling_return_7d) ? performanceStats.performance.rolling_return_7d * 100 : 0,
        Number.isFinite(performanceStats.performance.rolling_return_30d) ? performanceStats.performance.rolling_return_30d * 100 : 0,
        Number.isFinite(performanceStats.performance.rolling_return_90d) ? performanceStats.performance.rolling_return_90d * 100 : 0,
        Number.isFinite(performanceStats.performance.rolling_return_180d) ? performanceStats.performance.rolling_return_180d * 100 : 0,
        Number.isFinite(performanceStats.performance.rolling_return_365d) ? performanceStats.performance.rolling_return_365d * 100 : 0
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
  // This to test 3.5) Payment Status
  // const testPaymentStatus = async (ticketId) => {
  //   try {
  //     const email = 'thegohrilla@gmail.com';
  //     const result = await checkPaymentStatus(ticketId, email);
  //     console.log('Test Payment Status Result:', JSON.stringify(result, null, 2));
  //   } catch (error) {
  //     console.error('Test Payment Status Error:', error);
  //   }
  // };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      
      <ScrollView style={styles.container}>
        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4FC3F7" />
            <Text style={styles.loadingText}>Processing subscription...</Text>
          </View>
        )}

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{strategy?.strategy || 'Algorithm Details'}</Text>
            <Text style={styles.developer}>By {strategy?.developer || 'N/A'}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {strategy?.price ? `${strategy.price} ${strategy.cur}/month` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.description}>{strategy?.desc || 'No description available'}</Text>
        </View>

        {/* Updated Code: Performance Chart (Rolling Returns) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROLLING RETURNS (%)</Text>
          <View style={styles.graphContainer}>
            <LineChart
              data={{
                labels: strategy?.chartData?.labels?.length
                  ? strategy.chartData.labels
                  : ['No Data'],
                datasets: [{
                  data: strategy?.chartData?.data?.length
                    ? strategy.chartData.data
                    : [0],
                  color: (opacity = 1) => `rgba(79, 195, 247, ${opacity})`,
                  strokeWidth: 2
                }]
              }}
              width={Dimensions.get('window').width - 40}
              height={150}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              chartConfig={{
                backgroundColor: '#1E1E1E',
                backgroundGradientFrom: '#121212',
                backgroundGradientTo: '#1E1E1E',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                propsForLabels: {
                  fontSize: 10,
                  fontWeight: 'normal',
                  dy: -4,
                  dx: -10,
                  textAnchor: 'start'
                },
                propsForBackgroundLines: {
                  strokeDashArray: (value) => value === 0 ? '' : '5, 5',
                  stroke: 'rgba(255, 255, 255, 0.1)'
                },
                yAxisInterval: strategy?.chartData?.yAxisBound?.max / 5 || 1
              }}
              yAxisLabel=""
              yAxisSuffix="%"
              yLabelsOffset={25}
              xLabelsOffset={-5}
              bezier
              style={styles.chartStyle}
            />
          </View>
        </View>
        {/* End of Updated Code */}

        {loadingPerformance ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4FC3F7" />
          </View>
        ) : performanceStats?.performance ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCE METRICS</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Score</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.Score_Total) ? performanceStats.performance.Score_Total.toFixed(2) : 'N/A'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Trading Days</Text>
                <Text style={styles.detailValue}>{performanceStats.performance.TradableDay || 0}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Sharpe Ratio</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.AnnualSharpe) ? performanceStats.performance.AnnualSharpe.toFixed(2) : 'N/A'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Sortino Ratio</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.AnnualSortino) ? performanceStats.performance.AnnualSortino.toFixed(2) : 'N/A'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Volatility</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.PlainAnnStdDev) ? (performanceStats.performance.PlainAnnStdDev * 100).toFixed(1) : 'N/A'}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Annualized Return</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.MeanAnnualReturn) ? (performanceStats.performance.MeanAnnualReturn * 100).toFixed(1) : 'N/A'}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Max Drawdown</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.maxDrawdown_pct) ? (performanceStats.performance.maxDrawdown_pct * 100).toFixed(1) : 'N/A'}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Win Rate</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.WinRate) ? (performanceStats.performance.WinRate * 100).toFixed(1) : 'N/A'}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.detailLabel}>Profit Factor</Text>
                <Text style={styles.detailValue}>{Number.isFinite(performanceStats.performance.profit_factor) ? performanceStats.performance.profit_factor.toFixed(2) : 'N/A'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.description}>No performance data available</Text>
          </View>
        )}

        {performanceStats?.setting && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRADING REQUIREMENTS</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Asset Class:</Text>
              <Text style={styles.detailValue}>
                {performanceStats.setting.assetClass?.length > 0 ? performanceStats.setting.assetClass.join(', ') : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Base Currency:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.BaseCurrency || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Min Capital:</Text>
              <Text style={styles.detailValue}>
                {performanceStats.setting.min_capital ? `$${performanceStats.setting.min_capital.toLocaleString()}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Min Leverage:</Text>
              <Text style={styles.detailValue}>
                {performanceStats.setting.min_leverage ? `${performanceStats.setting.min_leverage}:1` : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Allow Short Sell:</Text>
              <Text style={styles.detailValue}>{performanceStats.setting.allowShortSell || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Subscribed Assets:</Text>
              <Text style={styles.detailValue}>
                {performanceStats.setting.subscribeList?.length > 0 ? performanceStats.setting.subscribeList.join(', ') : 'N/A'}
              </Text>
            </View>
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

        {/* Action Buttons - Modified as per request */}
        <View style={styles.buttonContainer}>
          {/* Only show SUBSCRIBE button when accessed from SubAccountCreationModal */}
          {isSelectingForSubAccount && (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleSelectForSubAccount}
              disabled={loading}
            >
              <Text style={styles.buttonText}>SUBSCRIBE</Text>
            </TouchableOpacity>
          )}
          {/* This is to test 3.5, the payment status */}
          {/* <TouchableOpacity onPress={() => testPaymentStatus('210737526')} style={styles.testButton}>
            <Text>Test Payment Status</Text>
          </TouchableOpacity> */}


          <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={loading}>
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
  selectButton: {
    backgroundColor: '#4FC3F7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#000000', // Black background as per previous request
    borderRadius: 10,
    padding: 20,
    width: Dimensions.get('window').width - 40,
    maxHeight: Dimensions.get('window').height - 100,
  },
  modalTitle: {
    color: '#ffffff', // White text for dark theme
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  graphContainer: {
    marginBottom: 15,
    marginTop: 15,
    alignItems: 'center', 
    overflow: 'hidden',
  },
  chartStyle: {
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default TradingModal;