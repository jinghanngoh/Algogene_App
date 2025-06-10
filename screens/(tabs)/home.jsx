import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from "react-native";
import WatchlistModal from "../components/WatchlistModal"; 
import NewsModal from "../components/NewsModal"; 
import HSI from "../../assets/img/hsi_icon.png";
import DXY from "../../assets/img/dollar_icon.png";
import NKY from "../../assets/img/225_icon.png";
import NDX from "../../assets/img/100_icon.png";
import DAX from "../../assets/img/dax_icon.png";
import SPX from "../../assets/img/spx_icon.png";
import FTSE from "../../assets/img/ftse_icon.png";
import ASX from "../../assets/img/asx_icon.png";
import CAC from "../../assets/img/cac_icon.png";

const { width: screenWidth } = Dimensions.get("window");

const newsItems = [
  { id: 1, title: "NEWS 1", heading: "Trade with ALGOGENE", description: "Provide full support for quantitative/algorithmic trading" },
  { id: 2, title: "NEWS 2", heading: "Market Trends", description: "Bullish patterns emerging in tech stocks this quarter" },
  { id: 3, title: "NEWS 3", heading: "Regulation Update", description: "New crypto market regulations effective next month" },
];

const allWatchlistItems = [
  { name: "Hang Seng Index", symbol: "HSI", icon: HSI },
  { name: "US Dollar Currency Index", symbol: "DXY", icon: DXY },
  { name: "Japan 225 Index", symbol: "NKY", icon: NKY },
  { name: "Nasdaq 100 Index", symbol: "NDX", icon: NDX },
  { name: "DAX Index", symbol: "DAX", icon: DAX },
  { name: "S&P 500 Index", symbol: "SPX", icon: SPX },
  { name: "FTSE 100 Index", symbol: "FTSE", icon: FTSE },
  { name: "ASX 200 Index", symbol: "ASX", icon: ASX },
  { name: "CAC 40 Index", symbol: "CAC", icon: CAC },
];

const Home = () => {
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState(["HSI", "DXY", "NKY", "NDX", "DAX"]);
  const scrollViewRef = useRef(null);

  const handleNewsScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setActiveNewsIndex(index);
  };

  const getRandomChange = () => {
    const change = (Math.random() * 2 - 1).toFixed(2);
    return `${change > 0 ? "+" : ""}${change}%`;
  };

  const getWatchlistItems = () => {
    return allWatchlistItems
      .filter((item) => selectedItems.includes(item.symbol))
      .map((item) => ({
        ...item,
        change: getRandomChange(),
      }));
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

            <NewsModal
              visible={newsModalVisible}
              onClose={() => setNewsModalVisible(false)}
              newsItem={selectedNews}
            /> 
        </ScrollView>

        <View style={styles.pagination}>
          {newsItems.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === activeNewsIndex && styles.activeDot]} />
          ))}
        </View>
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.watchlistHeader}>
        <Text style={styles.watchListText}>Watchlist</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {getWatchlistItems().map((item) => (
        <TouchableOpacity key={item.name} style={styles.watchlistItem} onPress={() => console.log(`${item.name} pressed`)}>
          <View style={styles.watchlistItemContent}>
            <Image source={item.icon} style={styles.icon} />
            <View style={styles.watchlistItemText}>
              <Text style={styles.indexName}>{item.name}</Text>
              <Text style={styles.indexSymbol}>{item.symbol}</Text>
            </View>
          </View>
          <Text style={[styles.indexChange, item.change.startsWith("+") ? styles.positiveChange : styles.negativeChange]}>
            {item.change}
          </Text>
        </TouchableOpacity>
      ))}

      <WatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        allItems={allWatchlistItems}
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
        fontSize: 16,
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
    // Modal styles
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