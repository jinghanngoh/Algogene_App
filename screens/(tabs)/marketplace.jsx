import React , { useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image, Modal , Alert, ActivityIndicator} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import placeholder from '../../assets/img/placeholder.png';
import TradingModal from '../components/TradingModal'; 
import { fetchPublicAlgos, fetchAlgoPerformance, fetchAlgoDailyReturns } from '../../services/MarketplaceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { debounce } from 'lodash';

const Marketplace = () => {
  const router = useRouter();
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
  //             const endDate = new Date('2025-06-27'); // Current date
  //             const dates = [];
  //             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  //               dates.push(new Date(d).toISOString().slice(0, 10));
  //             }

  //             // Map cumulative returns to dates
  //             const dateToCr = new Map(dailyReturnsResponse.map(item => [item.t, item.cr * 100]));
  //             const cumulativeReturns = dates.map(date => dateToCr.get(date) || 0);

  //             // Sample data to fit chart height (max 10 points)
  //             const step = Math.max(1, Math.floor(cumulativeReturns.length / 10));
  //             const sampledReturns = [];
  //             const sampledLabels = [];
  //             for (let i = 0; i < cumulativeReturns.length; i += step) {
  //               if (i < cumulativeReturns.length) {
  //                 sampledReturns.push(cumulativeReturns[i]);
  //                 sampledLabels.push(dates[i].slice(0, 7)); // Use YYYY-MM for labels
  //               }
  //             }

  //             // Determine y-axis bounds
  //             const maxAbsReturn = Math.max(...sampledReturns.map(Math.abs), 0);
  //             const yAxisBound = Math.ceil(maxAbsReturn);

  //             const chartData = sampledReturns.length > 0 ? {
  //               labels: sampledLabels,
  //               data: sampledReturns,
  //               yAxisBound: { min: -yAxisBound, max: yAxisBound }
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
              const dailyReturnsResponse = await fetchAlgoDailyReturns(algorithm.algo_id, null, false);
  
              // Get start and end years from performance settings
              const startDate = new Date(performanceResponse.setting?.period_start || algorithm.created_at);
              const endDate = new Date(performanceResponse.setting?.period_end || '2025-06-27');
              const startYear = startDate.getFullYear();
              const endYear = endDate.getFullYear();
  
              // Generate array of years for labels
              const years = [];
              for (let year = startYear; year <= endYear; year++) {
                years.push(year.toString());
              }
  
              // Map cumulative returns to years
              const dateToCr = new Map(dailyReturnsResponse.map(item => [item.t, item.cr * 100]));
              const yearlyReturns = years.map(year => {
                // Find the last return value for the given year
                const yearReturns = dailyReturnsResponse
                  .filter(item => item.t.startsWith(year))
                  .map(item => item.cr * 100);
                // Use the last return of the year, or 0 if no data
                return yearReturns.length > 0 ? yearReturns[yearReturns.length - 1] : 0;
              });
  
              // Determine y-axis bounds
              const maxAbsReturn = Math.max(...yearlyReturns.map(Math.abs), 0);
              const yAxisBound = Math.ceil(maxAbsReturn);
              const yAxisMin = Math.min(-yAxisBound, 0); // Ensure 0 is included
              const yAxisMax = Math.max(yAxisBound, 0);
  
              const chartData = yearlyReturns.length > 0 ? {
                labels: years,
                data: yearlyReturns,
                yAxisBound: { min: yAxisMin, max: yAxisMax }
              } : {
                labels: ['No Data'],
                data: [0],
                yAxisBound: { min: 0, max: 0 }
              };
  
              return {
                ...algorithm,
                performanceStats: performanceResponse.performance || { Score_Total: 0 },
                setting: performanceResponse.setting || {},
                chartData
              };
            } catch (error) {
              console.error(`Error fetching data for algo_id ${algorithm.algo_id}:`, error);
              return {
                ...algorithm,
                performanceStats: { Score_Total: 0 },
                setting: {},
                chartData: { labels: ['No Data'], data: [0], yAxisBound: { min: 0, max: 0 } }
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
    [isLoading, hasMore, page]
  );


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
      >
        {algorithms.length > 0 ? (
          algorithms.map((algorithm, index) => (
            <TouchableOpacity
              key={algorithm.algo_id}
              style={[styles.contentBox, index === 0 && styles.firstContentBox]}
              onPress={() => {
                setSelectedStrategy(algorithm);
                setModalVisible(true);
              }}
            >
              <View
                style={[
                  styles.categoryLabel,
                  { backgroundColor: ['#4FC3F7', '#81C784', '#FF8A65'][index % 3] }
                ]}
              >
                <Text style={styles.categoryLabelText}>
                  {algorithm.strategy.split(' ')[0] || 'Algorithm'}
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
                  labels: algorithm.chartData.labels.length ? algorithm.chartData.labels : ['No Data'],
                  datasets: [{
                    data: algorithm.chartData.data.length ? algorithm.chartData.data : [0],
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    strokeWidth: 2
                  }]
                }}
                width={Dimensions.get('window').width - 40}
                height={160}
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForLabels: {
                    fontSize: 10,
                    fontWeight: 'normal',
                    dy: -4,
                    dx: -10, 
                    textAnchor: 'start'
                  },
                  propsForBackgroundLines: {
                    strokeDashArray: (value) => value === 0 ? '' : '5, 5'
                  },
                  yAxisInterval: algorithm.chartData.yAxisBound?.max / 5 || 1
                }}
                yAxisLabel=""
                yAxisSuffix="%"
                yLabelsOffset={25} 
                xLabelsOffset={-5} 
                bezier
                style={[styles.chartStyle, { marginLeft: -15, paddingTop: 5 }]} 
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  selectionBanner: {
    backgroundColor: '#2196F3',
    padding: 10,
    alignItems: 'center',
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
});

export default Marketplace;
