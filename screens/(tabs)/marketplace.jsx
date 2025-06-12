import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import placeholder from '../../assets/img/placeholder.png';
import TradingModal from '../components/TradingModal'; 
import AppModal from '../components/AppModal';
import DataModal from '../components/DataModal';

const Marketplace = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Trading System'); 
  const [showTradingSystemBoxes, setShowTradingSystemBoxes] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [appModalVisible, setAppModalVisible] = useState(false);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [subscribedAlgorithm, setSubscribedAlgorithm] = useState(null);


  const buttons = [
    { label: 'Trading System' },
    { label: 'App Collection' },
    { label: 'Data Marketplace' },
  ];

  const tradingSystemTabs = [
    { label: 'Tab 1' },
    { label: 'Tab 2' },
    { label: 'Tab 3' },
    { label: 'Tab 4' },
    { label: 'Tab 5' },
    { label: 'Tab 6' },
  ];

  const handleButtonPress = (button) => {
    setActiveTab(button.label);
    setShowTradingSystemBoxes(button.label === 'Trading System');
    console.log(`Button pressed: ${button.label}`);
  };

  // Sample strategy data

  const sampleStrategies = [
    {
      id: 'algo-1',
      title: '定海神針',
      userName: 'Trader Pro',
      category: 'Forex',
      description: 'Forex strategy with 85% accuracy',
      performance: { score: '92' },
      price: 999,
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [100, 110, 120, 150, 180, 210]
      }
    },
    {
      id: 'algo-2',
      title: 'Golden Cross',
      userName: 'Quant Master',
      category: 'Stocks',
      description: 'Stock trading using moving averages',
      performance: { score: '88' },
      price: 799,
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [80, 95, 110, 130, 150, 170]
      }
    },
    {
      id: 'algo-3',
      title: 'Crypto Surfer',
      userName: 'Blockchain Trader',
      category: 'Crypto',
      description: 'BTC/ETH volatility strategy',
      performance: { score: '85' },
      price: 1299,
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [120, 135, 150, 170, 190, 220]
      }
    }
  ];

  // Sample app data
  const sampleApp = {
    name: "AI Risk Analyst",
    userName: "FinTech Solutions",
    rating: 4,
    introduction: "In today's fast-paced financial landscape, staying informed about market trends and economic developments is crucial for managing your investments effectively. Our innovative AI product is designed to analyze market risks and provide real-time insights.",
    technicalImplementation: "The app uses machine learning algorithms to process market data and identify potential risks. It integrates with major financial data providers through REST APIs.",
    requestHeaders: "Authorization: Bearer {token}\nContent-Type: application/json",
    requestBody: "{\n  \"market\": \"NASDAQ\",\n  \"timeframe\": \"1h\",\n  \"indicators\": [\"RSI\", \"MACD\"]\n}",
    responses: "200: Successful response\n400: Bad request\n401: Unauthorized",
    responseBody: "{\n  \"risk_score\": 0.75,\n  \"trend\": \"bearish\",\n  \"recommendation\": \"reduce position\"\n}",
    price: 999
  };

  const sampleData = {
    name: "Dow Jones Index Composite History",
    userName: "Market Data Inc.",
    rating: 5,
    introduction: "The Dow Jones Industrial Average (DJIA) is a stock market index of 30 prominent companies listed on stock exchanges in the United States. Unlike other stock indices which use market capitalization, it is price-weighted.",
    description: "The composite data is important for investment analysis, portfolio management and hedging. It can help you to understand the composition of the index, evaluate the performance of individual stocks, and assess the overall market trends.",
    technicalImplementation: "This API enables you to download historical constitutes of the stock index, its weighting and sensitivity.",
    requestParameters: "date: YYYY-MM-DD\nformat: json/csv",
    responses: "200: Successful response\n400: Invalid date format\n404: Data not found",
    price: 1499
  };

  const renderContentBoxes = () => {
    const isTradingSystem = activeTab === 'Trading System';
    const isAppCollection = activeTab === 'App Collection';
    const isDataMarketplace = activeTab === 'Data Marketplace';
    
    return (
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {isTradingSystem ? (
          // Render trading strategies with subscription capability
          sampleStrategies.map((strategy, index) => {
            const isSubscribed = subscribedAlgorithm?.id === strategy.id;
            const isAnotherSubscribed = subscribedAlgorithm && !isSubscribed;

            return (
              <TouchableOpacity 
                key={strategy.id} 
                style={[
                  styles.contentBox,
                  isSubscribed && styles.subscribedBox,
                  isAnotherSubscribed && styles.disabledBox
                ]}
                onPress={() => {
                  if (isAnotherSubscribed) {
                    Alert.alert(
                      "Subscription Limit",
                      "You're already subscribed to another algorithm. Please unsubscribe first.",
                      [{ text: "OK" }]
                    );
                    return;
                  }
                  setSelectedStrategy(strategy);
                  setModalVisible(true);
                }}
                disabled={isAnotherSubscribed}
              >
                {isSubscribed && (
                  <View style={styles.subscribedBadge}>
                    <Text style={styles.subscribedText}>SUBSCRIBED</Text>
                  </View>
                )}

                {isAnotherSubscribed && (
                  <View style={styles.disabledOverlay}>
                    <Text style={styles.disabledText}>Unsubscribe from current algorithm first</Text>
                  </View>
                )}
  
                {/* Category label */}
                <View style={[
                  styles.categoryLabel,
                  { backgroundColor: ["#4FC3F7", "#81C784", "#FF8A65"][index % 3] }
                ]}>
                  <Text style={styles.categoryLabelText}>{strategy.category}</Text>
                </View>
                
                {/* User info section */}
                <View style={styles.userContainer}>
                  <Image source={placeholder} style={styles.userIcon} />
                  <Text style={styles.userName}>{strategy.userName}</Text>
                </View>
                
                {/* Black line divider */}
                <View style={styles.divider} />
                
                {/* Title section */}
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>{strategy.title}</Text>
                  <View style={styles.performanceScore}>
                    <Text style={styles.performanceScoreText}>{strategy.performance.score}</Text>
                  </View>
                </View>
                
                {/* Content section */}
                <View style={styles.graphContainer}>
                  <LineChart
                    data={{
                      labels: strategy.chartData.labels,
                      datasets: [{
                        data: strategy.chartData.data,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        strokeWidth: 2
                      }]
                    }}
                    width={Dimensions.get('window').width - 70}
                    height={120}
                    withDots={false}
                    withShadow={false} // 
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false} // 
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
                    setSelectedStrategy(strategy);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.readMoreText}>Read more</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          // Render App Collection or Data Marketplace
          tradingSystemTabs.map((tab, index) => {
            const boxData = {
              title: isAppCollection ? `App ${index + 1}` : `Strategy ${index + 1}`,
              category: ["Forex", "Stocks", "Crypto"][index % 3],
              userName: isAppCollection ? `Developer ${index + 1}` : `Trader ${index + 1}`,
              performance: isAppCollection ? sampleApp.price : 65 + (index * 5),
              rating: 3 + (index % 3),
              chartData: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                data: [100, 110, 120, 150, 180, 210].map(val => val + (index * 10))
              }
            };
  
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.contentBox}
                onPress={() => {
                  if (isAppCollection) {
                    setSelectedApp(sampleApp);
                    setAppModalVisible(true);
                  } else if (isDataMarketplace) {
                    setSelectedData(sampleData);
                    setDataModalVisible(true);
                  }
                }}
              >
                {/* User info section */}
                <View style={styles.userContainer}>
                  <Image source={placeholder} style={styles.userIcon} />
                  <Text style={styles.userName}>{boxData.userName}</Text>
                </View>
                
                {/* Black line divider */}
                <View style={styles.divider} />
                
                {/* Title section */}
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>{boxData.title}</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Text key={i} style={styles.star}>
                        {i <= boxData.rating ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
                
                {/* Content section */}
                <Text style={styles.descriptionText}>
                  {isAppCollection 
                    ? "This app provides advanced financial analysis tools for traders and investors."
                    : "This dataset provides comprehensive historical market data for analysis."}
                </Text>
                
                {/* Read more button */}
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (isAppCollection) {
                      setSelectedApp(sampleApp);
                      setAppModalVisible(true);
                    } else if (isDataMarketplace) {
                      setSelectedData(sampleData);
                      setDataModalVisible(true);
                    }
                  }}
                >
                  <Text style={styles.readMoreText}>Read more</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              {
                backgroundColor: activeTab === button.label ? 'white' : 'lightgray',
                borderColor: activeTab === button.label ? 'lightblue' : 'lightgray',
                borderWidth: activeTab === button.label ? 3 : 0,
                width: Dimensions.get('window').width / 3 - 25,
              }
            ]}
            onPress={() => handleButtonPress(button)}
          >
            <Text style={{ color: 'black', flexWrap: 'wrap', textAlign: 'center' }}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer to maintain black space */}
      <View style={styles.spacer} />

      {/* Content Boxes */}
      {renderContentBoxes()}

      {/* Trading Modal */}
      <TradingModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        strategy={selectedStrategy} 
      />

      {/* App Modal */}
      <AppModal
        visible={appModalVisible}
        onClose={() => setAppModalVisible(false)}
        app={selectedApp || sampleApp}
      />

      <DataModal
        visible={dataModalVisible}
        onClose={() => setDataModalVisible(false)}
        data={selectedData || sampleData}
      />

    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingHorizontal: 10,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    marginHorizontal: 10, 
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
    overflow: 'hidden', // Prevent chart from protruding
  },
  performanceScore: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Add some space between title and score
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
});

export default Marketplace;