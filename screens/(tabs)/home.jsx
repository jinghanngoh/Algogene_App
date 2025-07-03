import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import WatchlistModal from "../components/WatchlistModal";
import NewsModal from "../components/NewsModal";

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
    change: "+0.09%"
  }
];

const Home = () => {
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState(["BTCUSD"]);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const useStaticData = true; // TOGGLE TO FALSE WHEN BACKEND IS RUNNING // SET TO TRUE FOR DEVELOPMENT WITHOUT BACKEND SERVERS


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

  const handleNewsScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setActiveNewsIndex(index);
  };

  const getWatchlistItems = () => {
    return watchlistItems.filter((item) => selectedItems.includes(item.symbol));
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
        <Text style={styles.watchListText}>Crypto Watchlist</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.noDataText}>Loading watchlist...</Text>
      ) : getWatchlistItems().length === 0 ? (
        <Text style={styles.noDataText}>No watchlist data available</Text>
      ) : (
        getWatchlistItems().map((item) => (
          <TouchableOpacity
            key={item.symbol}
            style={styles.watchlistItem}
            onPress={() => console.log(`${item.name} pressed`)}
          >
            <View style={styles.watchlistItemContent}>
              <Text style={styles.iconPlaceholder}>{item.symbol.slice(0, 3)}</Text>
              <View style={styles.watchlistItemText}>
                <Text style={styles.indexName}>{item.name}</Text>
                <Text style={styles.indexSymbol}>{item.symbol}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.indexPrice}>{item.price}</Text>
              <Text
                style={[
                  styles.indexChange,
                  item.change.startsWith("+") ? styles.positiveChange : styles.negativeChange,
                ]}
              >
                {item.change}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

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
});

export default Home;