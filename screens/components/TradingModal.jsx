import React , {useState, useEffect} from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions , Alert} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSubscription } from '../../context/SubscriptionContext';
import { fetchStrategyStats } from '../../services/testApi';

const TradingModal = ({ visible, onClose, strategy = null }) => {
  const { subscribedAlgorithm, subscribeToAlgorithm, unsubscribeFromAlgorithm } = useSubscription();
  const [performanceData, setPerformanceData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (visible && strategy?.algo_id) {
      fetchPerformanceData(strategy.algo_id);
    }
  }, [visible, strategy]);

  const fetchPerformanceData = async (algoId) => {
    setIsLoadingStats(true);
    try {
      const data = await fetchStrategyStats(algoId);
      setPerformanceData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load performance data');
      console.error('Error fetching performance data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getDefaultStrategy = () => ({
    id: strategy?.algo_id || 'default-strategy',
    title: strategy?.strategy || 'Unnamed Strategy',
    developer: strategy?.developer || 'Unknown Developer',
    category: strategy?.category || 'Algorithm',
    description: strategy?.description || 'No description available for this algorithm.',
    assetClass: strategy?.asset_class || 'Various',
    tradingInstruments: strategy?.instruments || 'Not specified',
    supportedBrokers: strategy?.supported_brokers || 'Not specified',
    tradingRequirements: strategy?.requirements || 'None specified',
    performance: {
      score: strategy?.performance?.score || Math.floor(Math.random() * 40) + 60,
      tradingDays: strategy?.performance?.tradingDays || 'N/A',
      sharpeRatio: strategy?.performance?.sharpeRatio || 'N/A',
      sortinoRatio: strategy?.performance?.sortinoRatio || 'N/A',
      volatility: strategy?.performance?.volatility || 'N/A',
      annualReturn: strategy?.performance?.annualReturn || 'N/A',
      maxDrawdown: strategy?.performance?.maxDrawdown || 'N/A',
    },
    price: strategy?.price || 0,
    cur: strategy?.cur || 'USD',
    settings: performanceData?.setting || {}
  });

  const currentStrategy = strategy ? getDefaultStrategy() : getDefaultStrategy();
  const isSubscribed = subscribedAlgorithm?.id === currentStrategy.id;

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      data: [100, 110, 120, 150, 180, 210],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2196F3"
    }
  };

  const handleUnsubscribe = () => {
    Alert.alert(
      'Confirm Unsubscribe',
      'Are you sure you want to unsubscribe from this strategy?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unsubscribe',
          onPress: () => {
            unsubscribeFromAlgorithm();
            onClose();
          },
          style: 'destructive',
        },
      ],
    );
  }

  // In TradingModal.jsx
  const handleSubscribe = () => {
    if (subscribedAlgorithm && subscribedAlgorithm.id !== currentStrategy.id) {
      Alert.alert(
        "Subscription Conflict",
        "You're already subscribed to another algorithm. Please unsubscribe first.",
        [{ text: "OK" }]
      );
      return;
    }
    subscribeToAlgorithm(currentStrategy);
    onClose();
  };


  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.strategyTitle}>{currentStrategy.title}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{currentStrategy.performance.score}</Text>
            </View>
          </View>

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

          <View style={styles.userSection}>
            <Text style={styles.userName}>{currentStrategy.userName}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{currentStrategy.category}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STRATEGY DESCRIPTION:</Text>
            <Text style={styles.sectionContent}>{currentStrategy.description}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ASSET CLASS:</Text>
              <Text style={styles.detailValue}>{currentStrategy.assetClass}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TRADING INSTRUMENTS:</Text>
              <Text style={styles.detailValue}>{currentStrategy.tradingInstruments}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SUPPORTED BROKERS:</Text>
              <Text style={styles.detailValue}>{currentStrategy.supportedBrokers}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TRADING REQUIREMENTS:</Text>
              <Text style={styles.detailValue}>{currentStrategy.tradingRequirements}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCE</Text>
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>score</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.score}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>trading days</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.tradingDays}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>sharpe ratio</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.sharpeRatio}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>sortino ratio</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.sortinoRatio}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>volatility</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.volatility}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>ann. return</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.annualReturn}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>max. drawdown</Text>
                <Text style={styles.performanceValue}>{currentStrategy.performance.maxDrawdown}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingText}>HKD {currentStrategy.price} / mo</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton, 
              isSubscribed && styles.unsubscribeButton
            ]}
            onPress={isSubscribed ? handleUnsubscribe : handleSubscribe}
          >
            <Text style={styles.subscribeButtonText}>
              {isSubscribed ? 'Unsubscribe' : `Subscribe (${currentStrategy.cur} ${currentStrategy.price}/mo)`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { useSubscription } from '../../context/SubscriptionContext';
// import { fetchAlgoPerformance } from '../../services/testApi';

// const TradingModal = ({ visible, onClose, strategy = null }) => {
//   const { subscribedAlgorithm, subscribeToAlgorithm, unsubscribeFromAlgorithm } = useSubscription();
//   const [performanceStats, setPerformanceStats] = useState(null);
//   const [loadingPerformance, setLoadingPerformance] = useState(false);

//   useEffect(() => {
//     if ( visible && strategy?.algo_id) {
//       fetchPerformanceStats(strategy.algo_id);
//     }
//   }, [visible, strategy]);

//   const fetchPerformanceStats = async (algoId) => {
//     setLoadingPerformance(true);
//     try {
//       const performance = await fetchAlgoPerformance(algoId);
//       setPerformanceStats(performance);
//     } catch (error) {
//       console.error('Error fetching performance stats:', error);
//       Alert.alert('Error', 'Failed to fetch performance stats.');
//     } finally {
//       setLoadingPerformance(false);
//     }
//   };

//   const currentStrategy = strategy || {
//     id: 'default-strategy',
//     title: 'Unnamed Strategy',
//     developer: 'Unknown Developer',
//     description: 'No description available.',
//     price: 0,
//     cur: 'USD'
//   };

//   //   const getDefaultStrategy = () => ({
// //     id: strategy?.algo_id || 'default-strategy',
// //     title: strategy?.strategy || 'Unnamed Strategy',
// //     developer: strategy?.developer || 'Unknown Developer',
// //     category: strategy?.category || 'Algorithm',
// //     description: strategy?.description || 'No description available for this algorithm.',
// //     assetClass: strategy?.asset_class || 'Various',
// //     tradingInstruments: strategy?.instruments || 'Not specified',
// //     supportedBrokers: strategy?.supported_brokers || 'Not specified',
// //     tradingRequirements: strategy?.requirements || 'None specified',
// //     performance: {
// //       score: strategy?.performance?.score || Math.floor(Math.random() * 40) + 60,
// //       tradingDays: strategy?.performance?.tradingDays || 'N/A',
// //       sharpeRatio: strategy?.performance?.sharpeRatio || 'N/A',
// //       sortinoRatio: strategy?.performance?.sortinoRatio || 'N/A',
// //       volatility: strategy?.performance?.volatility || 'N/A',
// //       annualReturn: strategy?.performance?.annualReturn || 'N/A',
// //       maxDrawdown: strategy?.performance?.maxDrawdown || 'N/A',
// //     },
// //     price: strategy?.price || 0,
// //     cur: strategy?.cur || 'USD',
// //     settings: performanceData?.setting || {}
// //   });

// //   const currentStrategy = strategy ? getDefaultStrategy() : getDefaultStrategy();
//   const isSubscribed = subscribedAlgorithm?.id === currentStrategy.id;

//   const handleSubscribe = () => {
//     if (subscribedAlgorithm && subscribedAlgorithm.id !== currentStrategy.id) {
//       Alert.alert(
//         'Subscription Conflict',
//         "You're already subscribed to another algorithm. Please unsubscribe first.",
//         [{ text: 'OK' }]
//       );
//       return;
//     }
//     subscribeToAlgorithm(currentStrategy);
//     onClose();
//   };

//   const handleUnsubscribe = () => {
//     Alert.alert(
//       'Confirm Unsubscribe',
//       'Are you sure you want to unsubscribe from this strategy?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Unsubscribe', onPress: () => {
//             unsubscribeFromAlgorithm();
//             onClose();
//           }, style: 'destructive' }
//       ]
//     );
//   };

//   const chartData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [{
//       data: performanceStats?.rolling_return_30d || [100, 110, 120, 150, 180, 210],
//       color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
//       strokeWidth: 2
//     }],
//   };

//   const chartConfig = {
//     backgroundColor: '#ffffff',
//     backgroundGradientFrom: '#ffffff',
//     backgroundGradientTo: '#ffffff',
//     decimalPlaces: 2,
//     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     style: { borderRadius: 16 },
//     propsForDots: {
//       r: "4",
//       strokeWidth: "2",
//       stroke: "#2196F3"
//     }
//   };

//   return (
//     <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
//       <View style={styles.container}>
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           <View style={styles.header}>
//             <TouchableOpacity onPress={onClose}>
//               <Text style={styles.closeButton}>×</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.titleSection}>
//             <Text style={styles.strategyTitle}>{currentStrategy.title}</Text>
//           </View>

//           {loadingPerformance ? (
//             <ActivityIndicator size="large" color="#2196F3" />
//           ) : (
//             <View style={styles.performanceSection}>
//               <Text style={styles.sectionTitle}>Performance Statistics:</Text>
//               <Text>Sharpe Ratio: {performanceStats?.AnnualSharpe || 'N/A'}</Text>
//               <Text>Sortino Ratio: {performanceStats?.AnnualSortino || 'N/A'}</Text>
//               <Text>Max Drawdown: {performanceStats?.maxDrawdown_pct || 'N/A'}%</Text>
//               <Text>Annual Return: {(performanceStats?.MeanAnnualReturn * 100).toFixed(2) || 'N/A'}%</Text>
//             </View>
//           )}

//           <View style={styles.chartContainer}>
//             <LineChart
//               data={chartData}
//               width={Dimensions.get('window').width - 40}
//               height={220}
//               chartConfig={chartConfig}
//               bezier
//               style={styles.chart}
//             />
//           </View>

//           <TouchableOpacity
//             style={[styles.subscribeButton, isSubscribed && styles.unsubscribeButton]}
//             onPress={isSubscribed ? handleUnsubscribe : handleSubscribe}
//           >
//             <Text style={styles.subscribeButtonText}>
//               {isSubscribed ? 'Unsubscribe' : `Subscribe (${currentStrategy.cur} ${currentStrategy.price}/mo)`}
//             </Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20, 
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 30,
    color: '#333',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  strategyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContainer: {
    backgroundColor: '#4FC3F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 10,
  },
  performanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryTag: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  detailsContainer: {
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 160,
    fontSize: 14,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '30%',
    marginBottom: 15,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pricingSection: {
    marginVertical: 20,
    alignItems: 'center',
  },
  pricingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subscribeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  unsubscribeButton: {
    backgroundColor: '#F44336',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TradingModal;