import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  ActivityIndicator
} from "react-native";
import WatchlistModal from "../components/WatchlistModal";
import NewsModal from "../components/NewsModal";
import bitcoin from '../../assets/img/bitcoin.png';
import ethereum from '../../assets/img/ethereum.png';

const { width: screenWidth } = Dimensions.get("window");

const newsItems = [
  { id: 1, title: "NEWS 1", heading: "Trade with ALGOGENE", description: "Provide full support for quantitative/algorithmic trading" },
  { id: 2, title: "NEWS 2", heading: "Market Trends", description: "Bullish patterns emerging in crypto markets this quarter" },
  { id: 3, title: "NEWS 3", heading: "Regulation Update", description: "New crypto market regulations effective next month" },
];

// Static fallback data for BTCUSD
const staticWatchlistData = [
  {
    name: "BTC / USD",
    symbol: "BTCUSD",
    price: "108703.00",
    change: "+0.09%",
  },
  {
    name: "ETH / USD",
    symbol: "ETHUSD",
    price: "108704.00",
    change: "-0.10%"
  }
];

const getCryptoIcon = (symbol) => {
  switch (symbol) {
    case 'BTCUSD':
      return bitcoin;
    case 'ETHUSD':
      return ethereum;
    default:
      return null;
  }
};

const Home = () => {
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState(["BTCUSD", "ETHUSD"]);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const useStaticData = false; // TOGGLE TO FALSE WHEN BACKEND IS RUNNING // SET TO TRUE FOR DEVELOPMENT WITHOUT BACKEND SERVERS

  // Fetch watchlist data from FastAPI
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (useStaticData) {
        setWatchlistItems(staticWatchlistData);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("http://10.89.8.201:8000/watchlist"); // My IP address 
        const data = await response.json();
        setWatchlistItems(data.length > 0 ? data : staticWatchlistData);
      } catch (error) {
        console.error("Error fetching watchlist data:", error);
        setWatchlistItems(staticWatchlistData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    const updateWatchlist = async () => {
      if (useStaticData) return;
      try {
        await fetch("http://10.89.8.201:8000/watchlist/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: selectedItems })
        });
      } catch (error) {
        console.error("Error updating watchlist:", error);
      }
    };
    updateWatchlist();
  }, [selectedItems]);

  useEffect(() => {
    if (useStaticData) return;
  
    const ws = new WebSocket("ws://10.89.8.201:8000/ws/watchlist");
    ws.onopen = () => console.log("WebSocket connected for watchlist");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket data received:", data);
        setWatchlistItems(data.length > 0 ? data : staticWatchlistData);
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket disconnected");
  
    return () => ws.close();
  }, []);


  const handleNewsScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setActiveNewsIndex(index);
  };


  const getWatchlistItems = () => {
    if (watchlistItems.length === 0) return [];
    
    const filtered = watchlistItems.filter((item) => 
      selectedItems.includes(item.symbol)
    ).map(item => ({
      ...item,
      localIcon: getCryptoIcon(item.symbol)
    }));
    
    console.log("Filtered items:", filtered);
    return filtered;
  };

  const renderWatchlistItem = (item) => {
    return (
      <TouchableOpacity key={item.symbol} style={styles.watchlistItem}>
        <View style={styles.watchlistItemContent}>
          <Image source={getCryptoIcon(item.symbol)} style={styles.watchlistIcon} />
          <View style={styles.watchlistItemText}>
            <Text style={styles.watchlistItemName}>{item.name}</Text>
            <Text style={styles.watchlistItemSymbol}>{item.symbol}</Text>
          </View>
        </View>
        <View style={styles.watchlistItemRight}>
          <Text style={styles.watchlistItemPrice}>{item.price}</Text>
          <Text
            style={[
              styles.watchlistItemChange,
              { color: item.change.startsWith("+") ? "#4CAF50" : "#F44336" },
            ]}
          >
            {item.change}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.latestNewsText}>Latest News</Text>

      <View style={styles.newsSection}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleNewsScroll}
          scrollEventThrottle={16}
        >
          {newsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.slide}
              onPress={() => {
                setSelectedNews(item);
                setNewsModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.newsContainer}>
                <Text style={styles.newsText}>{item.title}</Text>
              </View>
              <View style={styles.captionContainer}>
                <Text style={styles.captionHeading}>{item.heading}</Text>
                <Text style={styles.captionText}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <NewsModal
          visible={newsModalVisible}
          onClose={() => setNewsModalVisible(false)}
          newsItem={selectedNews}
        />
        <View style={styles.pagination}>
          {newsItems.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === activeNewsIndex && styles.activeDot]} />
          ))}
        </View>
      </View>

      <View style={styles.sectionDivider} />
      <View style={styles.watchlistHeader}>
        <Text style={styles.watchListText}>My Watchlist</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>
        
      <View style={styles.watchlistItemsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4682B4" />
        ) : (
          getWatchlistItems().map(item => renderWatchlistItem(item))
        )
        }
      </View>

      <WatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        allItems={watchlistItems}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: 'black',
  },
  scrollContainer: {
      paddingBottom: 20,
      marginTop: 50
  },
  latestNewsText: {
      fontWeight: 'bold',
      fontSize: 30,
      textAlign: 'center',
      color: 'white',
      marginTop: 40, 
  },
  newsSection: {
      position: 'relative',
      marginBottom: 20,
  },
  slide: {
      width: screenWidth,
      paddingHorizontal: 20,
      alignItems: 'center',
  },
  newsContainer: {
      backgroundColor: '#4682B4',
      width: '85%',
      height: 270,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
  },
  newsText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
  },
  captionContainer: {
      width: '85%',
      marginTop: 15,
  },
  captionHeading: {
      fontSize: 20,
      color: '#ADD8E6',
      fontWeight: 'bold',
      marginBottom: 5,
  },
  captionText: {
      fontSize: 14,
      color: 'white',
  },
  sectionDivider: {
      borderTopWidth: 1,
      borderTopColor: 'gray',  
      marginHorizontal: 10,
      marginTop: 40, 
  },
  watchlistHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
  },
  watchListText: {
      fontSize: 22,
      color: 'white',
      fontWeight: 'bold',
  },
  addButton: {
      fontSize: 30,
      color: 'white',
      paddingHorizontal: 10,
  },
  watchlistItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginBottom: 5,
  },
  watchlistItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  icon: {
      width: 20,
      height: 20,
      marginRight: 10,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    marginRight: 10,
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  watchlistItemText: {
      justifyContent: 'space-between',
  },
  indexName: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
  indexSymbol: {
      color: 'gray',
      fontSize: 12,
  },
  indexChange: {
    fontSize: 14,
    textAlign: "right",
  },
  indexPrice: {
    color: "white",
    fontSize: 16,
    textAlign: "right",
  },
  positiveChange: {
      color: 'green',
  },
  negativeChange: {
      color: 'red',
  },
  pagination: {
      position: 'absolute',
      bottom: -30,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'gray',
      marginHorizontal: 4,
  },
  activeDot: {
      backgroundColor: 'white',
      width: 12,
  },

  modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: '#1E1E1E',
      borderRadius: 10,
      padding: 20,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 15,
      textAlign: 'center',
  },
  modalScrollView: {
      maxHeight: '80%',
  },
  modalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
  },
  modalItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  modalIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
  },
  modalItemText: {
      justifyContent: 'space-between',
  },
  modalItemName: {
      color: 'white',
      fontSize: 16,
  },
  modalItemSymbol: {
      color: 'gray',
      fontSize: 12,
  },
  selectedIndicator: {
      color: '#4682B4',
      fontSize: 18,
      fontWeight: 'bold',
  },
  modalCloseButton: {
      backgroundColor: '#4682B4',
      padding: 12,
      borderRadius: 5,
      marginTop: 15,
      alignItems: 'center',
  },
  modalCloseButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
  watchlistItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12,
  },


  watchlistSection: {
    marginVertical: 15,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    color: '#4682B4',
    fontSize: 14,
  },
  
  // Watchlist item styles (matching modal styles)
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  watchlistItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchlistIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 18,
  },
  watchlistItemText: {
    justifyContent: 'space-between',
  },
  watchlistItemName: {
    color: 'white',
    fontSize: 16,
  },
  watchlistItemSymbol: {
    color: 'gray',
    fontSize: 12,
  },
  watchlistItemRight: {
    alignItems: 'flex-end',
  },
  watchlistItemPrice: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  watchlistItemChange: {
    fontSize: 14,
    // Color will be applied dynamically based on value
  },
  watchlistItemsContainer: {
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 15,
  },

});

export default Home;