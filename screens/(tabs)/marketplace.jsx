import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image, Modal , Alert, ActivityIndicator} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import placeholder from '../../assets/img/placeholder.png';
import TradingModal from '../components/TradingModal'; 
import { fetchPublicAlgos } from '../../services/testApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { polyfillWebCrypto } from 'expo-standard-web-crypto'; 

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
  const itemsPerPage = 10; 

  // const loadAlgorithms = async (retryCount = 2) => {
  // // const loadAlgorithms = async () => {
  //   if (isLoading || !hasMore) return;
    
  //   setIsLoading(true);
  //   try {
  //     const result = await fetchPublicAlgos();
  //     // console.log("API Response:", result);
      
  //     // Check if response has the expected structure
  //     if (!result || !result.data || !Array.isArray(result.data)) {
  //       throw new Error('Invalid API response format');
  //     }
  
  //     const startIndex = (page - 1) * itemsPerPage;
  //     const paginatedData = result.data.slice(startIndex, startIndex + itemsPerPage);
      
  //     setAlgorithms((prev) => [...prev, ...paginatedData]);
  //     setHasMore(result.data.length > page * itemsPerPage);
  //     setPage(prev => prev + 1);
  //   } catch (error) {
  //     console.error('Error loading algorithms:', error);
  //     if (retryCount > 0 && error.message.includes('Invalid session')) {
  //       console.log(`Retrying loadAlgorithms (${retryCount - 1} left)...`);
  //       await AsyncStorage.removeItem('sessionId');
  //       setIsLoading(false);
  //       return loadAlgorithms(retryCount - 1);
  //     // console.error('Error loading algorithms:', error);
  //     // Alert.alert('Error', error.message || 'Failed to load algorithms');
  //   } 
  //   Alert.alert('Error', error.message || 'Failed to load algorithms');
  //   }finally {
  //     setIsLoading(false);
  //   }
  // };
  const loadAlgorithms = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const sessionId = await AsyncStorage.getItem('sessionId');
      console.log('Marketplace sessionId:', sessionId);
      const result = await fetchPublicAlgos();
      console.log('API Response:', result);

      if (!result || !result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid API response format');
      }

      const startIndex = (page - 1) * itemsPerPage;
      const paginatedData = result.data.slice(startIndex, startIndex + itemsPerPage);

      setAlgorithms((prev) => [...prev, ...paginatedData]);
      setHasMore(result.data.length > page * itemsPerPage);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading algorithms:', error);
      Alert.alert('Error', error.message || 'Failed to load algorithms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   loadAlgorithms();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadAlgorithms(), 1000); // Delay 1s
    return () => clearTimeout(timer);
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

  // Generate random performance score (60-99) for each algorithm
  const getRandomPerformance = () => ({
    score: Math.floor(Math.random() * 40) + 60
  });

  // Generate chart data for visualization
  const generateChartData = () => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseValue = Math.floor(Math.random() * 50) + 50;
    return {
      labels,
      data: labels.map((_, i) => baseValue + (i * 10) + Math.floor(Math.random() * 10))
    };
  };

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
          algorithms.map((algorithm, index) => {
            const performance = getRandomPerformance();
            const chartData = generateChartData();
            
            return (
              <TouchableOpacity
                key={algorithm.algo_id}
                style={[styles.contentBox, index === 0 && styles.firstContentBox]}
                onPress={() => {
                  setSelectedStrategy({
                    ...algorithm,
                    performance,
                    chartData
                  });
                  setModalVisible(true);
                }}
              >
                {/* Category label - using first word of strategy name or 'Algorithm' */}
                <View
                  style={[
                    styles.categoryLabel,
                    { backgroundColor: ["#4FC3F7", "#81C784", "#FF8A65"][index % 3] }
                  ]}
                >
                  <Text style={styles.categoryLabelText}>
                    {algorithm.strategy.split(' ')[0] || 'Algorithm'}
                  </Text>
                </View>

                {/* User info section */}
                <View style={styles.userContainer}>
                  <Image source={placeholder} style={styles.userIcon} />
                  <Text style={styles.userName}>{algorithm.developer}</Text>
                </View>

                {/* Black line divider */}
                <View style={styles.divider} />

                {/* Title section */}
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>{algorithm.strategy}</Text>
                  <View style={styles.performanceScore}>
                    <Text style={styles.performanceScoreText}>{performance.score}</Text>
                  </View>
                </View>

                {/* Price section */}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>Price: {algorithm.cur} {algorithm.price}</Text>
                </View>

                {/* Content section */}
                <View style={styles.graphContainer}>
                  <LineChart
                    data={{
                      labels: chartData.labels,
                      datasets: [{
                        data: chartData.data,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        strokeWidth: 2
                      }]
                    }}
                    width={Dimensions.get('window').width - 70}
                    height={120}
                    withDots={false}
                    withShadow={false}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForDots: {
                        r: "0"
                      }
                    }}
                    bezier
                    style={styles.chartStyle}
                  />
                </View>

                {/* Read more button */}
                <TouchableOpacity
                  style={styles.readMoreButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedStrategy({
                      ...algorithm,
                      performance,
                      chartData
                    });
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.readMoreText}>Read more</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
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
    backgroundColor: 'black',
  },
  spacer: {
    height: 20, 
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  contentBox: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginTop: 10, 
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
  descriptionText: {
    color: 'black',
    marginBottom: 15,
    lineHeight: 20,
  },
  readMoreButton: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  readMoreText: {
    color: 'white',
  },
  graphContainer: {
    marginBottom: 15,
    overflow: 'hidden', 
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
  chartStyle: {
    borderRadius: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    color: '#FFD700',
    marginLeft: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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