import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRef, useState } from 'react';
import HSI from '../../assets/img/hsi_icon.png';
import DXY from '../../assets/img/dollar_icon.png';
import NKY from '../../assets/img/225_icon.png';
import NDX from '../../assets/img/100_icon.png';
import DAX from '../../assets/img/dax_icon.png';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const newsItems = [
  {
    id: 1,
    title: "NEWS 1",
    heading: "Trade with ALGOGENE",
    description: "provide full support for quantitative/algorithmic trading"
  },
  {
    id: 2,
    title: "NEWS 2",
    heading: "Market Trends",
    description: "Bullish patterns emerging in tech stocks this quarter"
  },
  {
    id: 3,
    title: "NEWS 3",
    heading: "Regulation Update",
    description: "New crypto market regulations effective next month"
  }
];

const watchlistItems = [
    { name: "Hang Seng Index", symbol: "HSI", change: "-1.20%", icon: HSI },
    { name: "US Dollar Currency Index", symbol: "DXY", change: "0.11%", icon: DXY },
    { name: "Japan 225 Index", symbol: "NKY", change: "-1.22%", icon: NKY },
    { name: "Nasdaq 100 Index", symbol: "NDX", change: "-0.11%", icon: NDX },
    { name: "DAX Index", symbol: "DAX", change: "-0.47%", icon: DAX },
];

const Home = () => {
    const [activeNewsIndex, setActiveNewsIndex] = useState(0);
    const scrollViewRef = useRef(null);

    const handleNewsScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / screenWidth);
        setActiveNewsIndex(index);
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
                        <View key={item.id} style={styles.slide}>
                            <View style={styles.newsContainer}>
                                <Text style={styles.newsText}>{item.title}</Text>
                            </View>
                            <View style={styles.captionContainer}>
                                <Text style={styles.captionHeading}>{item.heading}</Text>
                                <Text style={styles.captionText}>{item.description}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
                
                <View style={styles.pagination}>
                    {newsItems.map((_, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.paginationDot, 
                                index === activeNewsIndex && styles.activeDot
                            ]} 
                        />
                    ))}
                </View>
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.watchListText}>Watchlist</Text>
            {watchlistItems.map((item) => (
                <TouchableOpacity 
                    key={item.name}
                    style={styles.watchlistItem} 
                    onPress={() => console.log(`${item.name} pressed`)}
                >
                    <View style={styles.watchlistItemContent}>
                        <Image source={item.icon} style={styles.icon} />
                        <View style={styles.watchlistItemText}>
                            <Text style={styles.indexName}>{item.name}</Text>
                            <Text style={styles.indexSymbol}>{item.symbol}</Text>
                        </View>
                    </View>
                    <Text style={styles.indexChange}>{item.change}</Text>
                </TouchableOpacity>
            ))}
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
    watchListText: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
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
        color: 'red',
        fontSize: 16,
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
});

export default Home;
