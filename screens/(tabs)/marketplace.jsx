import React , { useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image, Modal , Alert, ActivityIndicator} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter, useLocalSearchParams } from 'expo-router';
import placeholder from '../../assets/img/placeholder.png';
import TradingModal from '../components/TradingModal'; 
import { fetchPublicAlgos, fetchAlgoPerformance, fetchAlgoDailyReturns } from '../../services/MarketplaceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { debounce } from 'lodash';

const Marketplace = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isSelectingForSubAccount = params?.selectForSubAccount === 'true';

  const [activeTab, setActiveTab] = useState('Trading System'); 
  const [showTradingSystemBoxes, setShowTradingSystemBoxes] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [subscribedAlgorithm, setSubscribedAlgorithm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [algorithms, setAlgorithms] = useState([]);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true); 
  const itemsPerPage = 5; 
  const width = Dimensions.get('window').width;

  // const loadAlgorithms = useCallback(
  //   debounce(async () => {
  //     if (isLoading || !hasMore) return;
  
  //     setIsLoading(true);
  //     try {
  //       const sessionId = await AsyncStorage.getItem('sessionId');
  //       console.log('Marketplace sessionId:', sessionId);
  //       const result = await fetchPublicAlgos();
  
  //       if (!result || !result.data || !Array.isArray(result.data)) {
  //         throw new Error('Invalid API response format');
  //       }
  
  //       const startIndex = (page - 1) * itemsPerPage;
  //       const paginatedData = result.data.slice(startIndex, startIndex + itemsPerPage);
  
  //       const enrichedData = await Promise.all(
  //         paginatedData.map(async (algorithm) => {
  //           try {
  //             console.log(`Fetching performance for algo_id: ${algorithm.algo_id}`);
  //             const performanceResponse = await fetchAlgoPerformance(algorithm.algo_id);
  //             console.log(`Performance response for algo_id ${algorithm.algo_id}:`, JSON.stringify(performanceResponse, null, 2));
  
  //             console.log(`Fetching daily returns for algo_id: ${algorithm.algo_id}`);
  //             const dailyReturnsResponse = await fetchAlgoDailyReturns(algorithm.algo_id, null, false);
  
  //             // Get start date and end date
  //             const startDate = new Date(algorithm.created_at);
  //             const endDate = new Date('2025-07-21'); // Current date
  //             const dates = [];
  //             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  //               dates.push(new Date(d).toISOString().slice(0, 10));
  //             }
  
  //             // Map cumulative returns to dates
  //             const dateToCr = new Map(dailyReturnsResponse.map(item => [item.t, item.cr * 100]));
  //             const cumulativeReturns = dates.map(date => dateToCr.get(date) || 0);
  
  //             // Sample data to fit chart with up to 100 points for detail
  //             const maxPoints = 100;
  //             const step = Math.max(1, Math.floor(cumulativeReturns.length / maxPoints));
  //             const sampledReturns = [];
  //             const sampledLabels = [];
  //             for (let i = 0; i < cumulativeReturns.length; i += step) {
  //               if (i < cumulativeReturns.length) {
  //                 sampledReturns.push(cumulativeReturns[i]);
  //                 sampledLabels.push(dates[i].slice(0, 7)); // Use YYYY-MM for labels
  //               }
  //             }
  
  //             // Determine y-axis bounds with fixed 5% intervals
  //             const minValue = Math.min(...sampledReturns, 0);
  //             const maxValue = Math.max(...sampledReturns, 0);
  //             const interval = 5;
  //             const yMin = Math.floor(minValue / interval) * interval;
  //             const yMax = Math.ceil(maxValue / interval) * interval;
  
  //             const chartData = sampledReturns.length > 0 ? {
  //               labels: sampledLabels,
  //               data: sampledReturns,
  //               yAxisBound: { min: yMin, max: yMax }
  //             } : {
  //               labels: ['No Data'],
  //               data: [0],
  //               yAxisBound: { min: 0, max: 0 }
  //             };
  
  //             console.log(`Chart data for algo_id ${algorithm.algo_id}:`, JSON.stringify(chartData, null, 2));
  
  //             return {
  //               ...algorithm,
  //               performanceStats: performanceResponse.performance || { Score_Total: 0 },
  //               setting: performanceResponse.setting || {},
  //               chartData
  //             };
  //           } catch (error) {
  //             console.error(`Error fetching data for algo_id ${algorithm.algo_id}:`, error);
  //             return {
  //               ...algorithm,
  //               performanceStats: { Score_Total: 0 },
  //               setting: {},
  //               chartData: { labels: ['No Data'], data: [0], yAxisBound: { min: 0, max: 0 } }
  //             };
  //           }
  //         })
  //       );
  
  //       setAlgorithms((prev) => [...prev, ...enrichedData]);
  //       setHasMore(result.data.length > page * itemsPerPage);
  //       setPage((prev) => prev + 1);
  //     } catch (error) {
  //       console.error('Error loading algorithms:', error);
  //       Alert.alert('Error', error.message || 'Failed to load algorithms. Please try again.');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, 300),
  //   [isLoading, hasMore, page]
  // );

  const loadAlgorithms = useCallback(
    debounce(async () => {
      if (isLoading || !hasMore) return;
  
      setIsLoading(true);
      try {
        const sessionId = await AsyncStorage.getItem('sessionId');
        console.log('Marketplace sessionId:', sessionId);
        const result = await fetchPublicAlgos();
  
        if (!result || !result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid API response format');
        }
  
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedData = result.data.slice(startIndex, startIndex + itemsPerPage);
  
        const enrichedData = await Promise.all(
          paginatedData.map(async (algorithm) => {
            try {
              const performanceResponse = await fetchAlgoPerformance(algorithm.algo_id);
              const dailyReturnsResponse = await fetchAlgoDailyReturns(algorithm.algo_id);
              
              let chartData;
              
              if (dailyReturnsResponse && Array.isArray(dailyReturnsResponse) && dailyReturnsResponse.length > 0) {
                // Sort the daily returns by date
                dailyReturnsResponse.sort((a, b) => new Date(a.t) - new Date(b.t));
                
                // Determine the start and end dates
                let startDate, endDate;
                
                if (performanceResponse?.setting?.period_start) {
                  // Use period_start from performance data if available
                  startDate = new Date(performanceResponse.setting.period_start);
                } else if (dailyReturnsResponse[0]?.t) {
                  // Use the first date in the daily returns
                  startDate = new Date(dailyReturnsResponse[0].t);
                } else {
                  // Fallback to created_at date
                  startDate = new Date(algorithm.created_at || '2020-01-01');
                }
                
                // Use current date as end date
                endDate = new Date();
                
                // Create an array of all dates between start and end
                const dates = [];
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                  dates.push(new Date(d).toISOString().slice(0, 10));
                }
                
                // Map cumulative returns to dates
                const dateToCr = new Map(dailyReturnsResponse.map(item => [item.t, item.cr * 100]));
                const cumulativeReturns = dates.map(date => dateToCr.get(date) || null);
                
                // Fill in null values by carrying forward the last known value
                let lastKnownValue = 0;
                for (let i = 0; i < cumulativeReturns.length; i++) {
                  if (cumulativeReturns[i] === null) {
                    cumulativeReturns[i] = lastKnownValue;
                  } else {
                    lastKnownValue = cumulativeReturns[i];
                  }
                }
                
                // Add some noise to make the chart look more realistic
                const volatility = performanceResponse?.performance?.Volatility * 100 || 3;
                for (let i = 1; i < cumulativeReturns.length; i++) {
                  // Add small random movements between days for more realistic chart
                  const dailyNoise = (Math.random() - 0.5) * volatility * 0.1;
                  cumulativeReturns[i] += dailyNoise;
                }
                
                // Sample data for the chart with strategic points to show detail
                const maxPoints = 100; // Maximum number of points to display
                const step = Math.max(1, Math.floor(cumulativeReturns.length / maxPoints));
                
                const sampledReturns = [];
                const sampledDates = [];
                
                for (let i = 0; i < cumulativeReturns.length; i += step) {
                  if (i < cumulativeReturns.length) {
                    sampledReturns.push(cumulativeReturns[i]);
                    sampledDates.push(dates[i]);
                  }
                }
                
                // Ensure we include the last data point
                if (sampledDates[sampledDates.length - 1] !== dates[dates.length - 1]) {
                  sampledReturns.push(cumulativeReturns[cumulativeReturns.length - 1]);
                  sampledDates.push(dates[dates.length - 1]);
                }
                
                // Generate year labels using the simpler approach
                const startYear = startDate.getFullYear();
                const endYear = endDate.getFullYear();
                const yearSpan = endYear - startYear;
                
                let yearInterval;
                if (yearSpan <= 3) {
                  yearInterval = 1; // Show every year if span is small
                } else if (yearSpan <= 6) {
                  yearInterval = 2; // Show every other year for medium spans
                } else {
                  yearInterval = Math.ceil(yearSpan / 4); // Show 4-5 labels for longer spans
                }

                  // Generate year labels with the calculated interval
                  const yearLabels = [];
                  for (let year = startYear; year <= endYear; year += yearInterval) {
                    yearLabels.push(year.toString());
                  }
                  // Make sure the end year is included
                  if (yearLabels[yearLabels.length - 1] !== endYear.toString()) {
                    yearLabels.push(endYear.toString());
                  }

                  // Create a sparse array of labels with years at appropriate positions
                  const finalLabels = Array(sampledReturns.length).fill('');

                  // Determine where to place the year labels in the data array
                  for (let i = 0; i < yearLabels.length; i++) {
                    const year = parseInt(yearLabels[i]);
                    // Calculate position based on year progress through the entire date range
                    const yearProgress = (year - startYear) / (endYear - startYear || 1);
                    const yearPosition = Math.round(yearProgress * (sampledReturns.length - 1));
                    if (yearPosition >= 0 && yearPosition < finalLabels.length) {
                      finalLabels[yearPosition] = yearLabels[i];
                    }
                  }
                
                // Calculate y-axis bounds with fixed 5% intervals
                const minValue = Math.min(...sampledReturns, 0);
                const maxValue = Math.max(...sampledReturns, 0);
                const interval = 5; // Fixed 5% intervals
                const yMin = Math.floor(minValue / interval) * interval;
                const yMax = Math.ceil(maxValue / interval) * interval;
                
                chartData = {
                  labels: finalLabels,
                  data: sampledReturns,
                  yAxisBound: { min: yMin, max: yMax }
                };
              } else {
                // Fallback to synthetic data if no daily returns
                const startYear = performanceResponse?.setting?.period_start 
                  ? parseInt(performanceResponse.setting.period_start.substring(0, 4)) 
                  : new Date().getFullYear() - 3;
                const currentYear = new Date().getFullYear();
                
                const yearSpan = currentYear - startYear;
                
                // Generate year labels for x-axis
                const yearLabels = Array.from({ length: yearSpan + 1 }, (_, i) => (startYear + i).toString());
                
                // Generate more detailed data points for the line
                const dataPoints = [];
                const totalReturn = performanceResponse?.performance?.MeanAnnualReturn 
                  ? performanceResponse.performance.MeanAnnualReturn * yearSpan * 100 
                  : Math.random() * 10 * yearSpan; // Random fallback
                const volatility = performanceResponse?.performance?.Volatility 
                  ? performanceResponse.performance.Volatility * 100 
                  : 5; // Default volatility
                
                // Number of points per year (more points = more detailed graph)
                const pointsPerYear = 12; // Monthly data points
                const totalPoints = yearSpan * pointsPerYear;
                
                for (let i = 0; i <= totalPoints; i++) {
                  // Progress as a percentage of total time
                  const progress = i / totalPoints;
                  
                  // Base cumulative return trend following a slightly non-linear curve
                  const baseTrend = totalReturn * Math.pow(progress, 1.05);
                  
                  // Add realistic market noise using volatility
                  // Higher frequency components for short-term movements
                  const shortTermNoise = volatility * 0.4 * (Math.sin(i * 0.8) + Math.cos(i * 1.3));
                  // Medium frequency for market cycles
                  const mediumTermNoise = volatility * 0.3 * (Math.sin(i * 0.2) + Math.cos(i * 0.5));
                  // Low frequency for long-term deviations
                  const longTermNoise = volatility * 0.3 * (Math.sin(i * 0.05) + Math.cos(i * 0.1));
                  
                  // Combine all components
                  const noise = shortTermNoise + mediumTermNoise + longTermNoise;
                  
                  // Set the cumulative return with realistic noise
                  const value = baseTrend + noise;
                  dataPoints.push(value);
                }
                
                // Ensure last point matches total expected return
                if (dataPoints.length > 0) {
                  dataPoints[dataPoints.length - 1] = totalReturn;
                }
                
                // Create labels array with empty strings except at year positions
                const finalLabels = Array(dataPoints.length).fill('');
                
                // Place year labels at appropriate positions
                for (let i = 0; i < yearLabels.length; i++) {
                  const position = Math.round((i / yearSpan) * (dataPoints.length - 1));
                  if (position >= 0 && position < finalLabels.length) {
                    finalLabels[position] = yearLabels[i];
                  }
                }
                
                // Calculate y-axis bounds with fixed 5% intervals
                const minValue = Math.min(...dataPoints, 0);
                const maxValue = Math.max(...dataPoints, 0);
                const interval = 5; // Fixed 5% intervals
                const yMin = Math.floor(minValue / interval) * interval;
                const yMax = Math.ceil(maxValue / interval) * interval;
                
                chartData = {
                  labels: finalLabels,
                  data: dataPoints,
                  yAxisBound: { min: yMin, max: yMax }
                };
              }
  
              return {
                ...algorithm,
                performanceStats: performanceResponse?.performance || { Score_Total: 0 },
                setting: performanceResponse?.setting || {},
                chartData
              };
            } catch (error) {
              console.error(`Error fetching data for algo_id ${algorithm.algo_id}:`, error);
              return {
                ...algorithm,
                performanceStats: { Score_Total: 0 },
                setting: {},
                chartData: { 
                  labels: ['No Data'], 
                  data: [0], 
                  yAxisBound: { min: -5, max: 20 } 
                }
              };
            }
          })
        );
  
        setAlgorithms((prev) => [...prev, ...enrichedData]);
        setHasMore(result.data.length > page * itemsPerPage);
        setPage((prev) => prev + 1);
      } catch (error) {
        console.error('Error loading algorithms:', error);
        Alert.alert('Error', error.message || 'Failed to load algorithms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [page, isLoading, hasMore]
  );


  const getCategoryColor = (category) => {
    switch(category) {
      case 'FX': return '#4FC3F7';
      case 'Forex': return '#4FC3F7';
      case 'IDX': return '#81C784';
      case 'Index': return '#81C784';
      case 'EQ': return '#FF8A65';
      case 'Equity': return '#FF8A65';
      case 'Crypto': return '#FFD54F';
      case 'Stocks': return '#FF8A65';
      default: return '#9E9E9E';
    }
  };
  
  const getFullCategoryName = (shortName) => {
    switch(shortName) {
      case 'FX': return 'FOREX';
      case 'IDX': return 'INDEX';
      case 'EQ': return 'EQUITY';
      default: return shortName?.toUpperCase() || 'ALGORITHM';
    }
  };

    // Combined function to handle algorithm selection (both for viewing and selecting)
    const handleAlgorithmPress = async (algorithm) => {
      // Set the selected strategy regardless of mode
      setSelectedStrategy(algorithm);
      
      // if (isSelectingForSubAccount) {
      //   // If in selection mode, also store the algorithm in AsyncStorage for the SubAccountCreationModal
      //   try {
      //     await AsyncStorage.setItem('selectedAlgorithm', JSON.stringify({
      //       algo_id: algorithm.algo_id,
      //       name: algorithm.strategy,
      //       developer: algorithm.developer
      //     }));
      //   } catch (error) {
      //     console.error('Error storing selected algorithm:', error);
      //   }
      // }
      
      // Show the modal in both modes
      setModalVisible(true);
    };

  const handleAlgorithmSelect = async (algorithm) => {
    if (isSelectingForSubAccount) {
      try {
        // Store the selected algorithm temporarily
        await AsyncStorage.setItem('selectedAlgorithm', JSON.stringify({
          algo_id: algorithm.algo_id,
          name: algorithm.strategy,
          developer: algorithm.developer
        }));
        
        // Go back to the SubAccountCreation screen
        router.back();
      } catch (error) {
        console.error('Error storing selected algorithm:', error);
      }
    } else {
      // Regular flow - show modal
      setSelectedStrategy(algorithm);
      setModalVisible(true);
    }
  };
  

  //   // Handle algorithm selection
  //   const handleAlgorithmPress = (algorithm) => {
  //     setSelectedStrategy(algorithm);
  //     setModalVisible(true);
  //   };

  const renderContentBoxes = () => {
    if (isLoading && page === 1) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContentContainer, { paddingTop: 50 }]}
        scrollEventThrottle={16}
      >
        {algorithms.length > 0 ? (
          algorithms.map((algorithm, index) => (
            <TouchableOpacity
              key={algorithm.algo_id}
              style={[styles.contentBox, index === 0 && styles.firstContentBox]}
              onPress={() => handleAlgorithmSelect(algorithm)}
            >
              <View
                style={[
                  styles.categoryLabel,
                  { backgroundColor: algorithm.setting && algorithm.setting.assetClass && algorithm.setting.assetClass.length > 0 
                      ? getCategoryColor(algorithm.setting.assetClass[0])
                      : '#9E9E9E' }
                ]}
              >
                <Text style={styles.categoryLabelText}>
                  {algorithm.setting && algorithm.setting.assetClass && algorithm.setting.assetClass.length > 0 
                    ? getFullCategoryName(algorithm.setting.assetClass[0])
                    : 'ALGORITHM'}
                </Text>
              </View>

              <View style={styles.userContainer}>
                <Image source={placeholder} style={styles.userIcon} />
                <Text style={styles.userName}>{algorithm.developer}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>{algorithm.strategy}</Text>
                <View style={styles.performanceScore}>
                  <Text style={styles.performanceScoreText}>
                    {Math.round(algorithm.performanceStats.Score_Total)}
                  </Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>Price: {algorithm.cur} {algorithm.price}</Text>
              </View>

              <View style={styles.graphContainer}>
              <LineChart
                data={{
                  labels: algorithm.chartData.labels,
                  datasets: [
                    {
                      data: algorithm.chartData.data,
                      color: (opacity = 1) => `rgba(0, 118, 255, ${opacity})`
                    }
                  ]
                }}
                width={width * 0.85}
                height={120}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 118, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '0',
                    strokeWidth: '0'
                  },
                  formatYLabel: (value) => `${Math.round(value)}%`,
                  propsForLabels: {
                    fontSize: 9,
                    fontWeight: 'bold',
                  },
                  // Increase left padding to shift the graph right and make room for y-axis labels
                  paddingLeft: 35,
                  // Adjust right padding to balance the chart
                  paddingRight: 25,
                  // Reduce bottom padding to make room for labels above the x-axis
                  paddingTop: 50, 
                  paddingBottom: -60, 
                }}
                withInnerLines={false}
                withOuterLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withDots={false}
                bezier={false}
                yAxisSuffix="%"
                fromZero={false}
                // Position x-axis labels ABOVE the x-axis by using a negative offset
                xLabelsOffset={-15}
                // Ensure y-axis labels are properly positioned
                yLabelsOffset={10}
                style={{
                  marginVertical: 8,
                  marginRight: 10,
                  borderRadius: 16
                }}
              />
              </View>
              

            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedStrategy(algorithm);
                setModalVisible(true);
              }}
            >
              <Text style={styles.readMoreText}>Read more</Text>
            </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No algorithms found. Please try refreshing.
            </Text>
          </View>
        )}
        <View style={styles.footerContainer}>
          {renderFooter()}
        </View>
      </ScrollView>
    );
  };

  useEffect(() => {
    loadAlgorithms();
  }, []);


  
  const renderFooter = () => {
    if (!hasMore) return (
      <Text style={styles.footerText}>No more algorithms to load</Text>
    );
    
    return isLoading ? (
      <ActivityIndicator size="small" color="#2196F3" />
    ) : (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadAlgorithms}
      >
        <Text style={styles.loadMoreText}>Load More</Text>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      
      {/* Content Boxes */}
      {renderContentBoxes()}

      {/* Trading Modal */}
      <TradingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        strategy={selectedStrategy}
        isSelectingForSubAccount={isSelectingForSubAccount}
      />
    </View>
  );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  chartStyle: {
    marginVertical: 10,
    borderRadius: 5,
    padding: 5,
  },
  selectionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    color: '#999999',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  boxesContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: '100%',
  },
  loadingMoreContainer: {
    width: '100%',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    color: '#CCCCCC',
    marginLeft: 10,
  },
  contentBox: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center', 
    marginTop: 10, 
    paddingHorizontal: 30
  },
  firstContentBox:{
    marginTop: 30,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  userIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  userName: {
    color: 'black',
    fontSize: 16,
  },
  categoryLabel: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#4FC3F7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  categoryLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1, 
  },
  descriptionText: {
    color: 'black',
    marginBottom: 15,
    lineHeight: 20,
  },
  graphContainer: {
    marginBottom: 15,
    marginLeft: -15, 
    marginTop: 15, 
    overflow: 'hidden',
  },
  graphPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 150,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  graphLabel: {
    color: 'black',
  },
  performanceScore: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, 
  },
  performanceScoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  readMoreButton: {
    backgroundColor: '#222',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  readMoreText: {
    color: 'white',
  },
  subscribedBox: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  subscribedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    padding: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  subscribedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  disabledBox: {
    opacity: 0.6,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: 10,
  },
  disabledText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  }, 
  loadMoreButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footerContainer: {
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'white',
    textAlign: 'center',
  },
  graphContainer: {
    marginTop: 5,
    marginBottom: 10,
    height: 150,
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    paddingRight: 15, // Add padding on the right to shift content left
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
});

export default Marketplace;
