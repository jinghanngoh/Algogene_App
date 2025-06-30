import { StyleSheet, Text, View, Image, TouchableOpacity , ScrollView, Dimensions, Modal} from "react-native";
import React from 'react'; 
import { useRouter } from 'expo-router';
import Logo from '../../assets/img/logo.png';
import { Ionicons } from '@expo/vector-icons'; 
import placeholder from '../../assets/img/placeholder.png';
import { LineChart } from 'react-native-chart-kit';
import { useSubscription } from '../../context/SubscriptionContext'; 

const Portfolio = () => {
    const router = useRouter();
    const { subscribedAlgorithm } = useSubscription(); 

    const menuItems = [
        { id: 1, name: "Account Manager"},
        { id: 2, name: "Sub Accounts"},
        { id: 3, name: "AI Portfolio Analysis"},
    ];

    const handleMenuItemPress = (itemName) => {
        switch (itemName) {
            case "Account Manager":
                router.push('/Portfolio/AccountManager');
                break; 
            case "Sub Accounts":
                router.push('/Portfolio/SubAccounts');
                break;
            case "AI Portfolio Analysis":
                router.push('/Portfolio/AIPortfolioAnalysis');
                break; 
            default:
                console.log(`${itemName} pressed`);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={Logo} style={styles.logo} />
                <Text style={styles.headerText}>Account Details</Text>
            </View>
            
            <ScrollView style={styles.scrollContainer}>
                {/* Subscribed Algorithm Section */}
                {subscribedAlgorithm && (
                    <View style={styles.subscribedContainer}>
                        <Text style={styles.subscribedTitle}>Your Subscribed Algorithm</Text>
                        <TouchableOpacity 
                            style={[
                                styles.contentBox,
                                styles.subscribedBox
                            ]}
                            onPress={() => {
                                // Optional: Add navigation to strategy details
                            }}
                        >
                            <View style={styles.subscribedBadge}>
                                <Text style={styles.subscribedText}>SUBSCRIBED</Text>
                            </View>

                            <View style={[
                                styles.categoryLabel,
                                { backgroundColor: getCategoryColor(subscribedAlgorithm.category) }
                            ]}>
                                <Text style={styles.categoryLabelText}>{subscribedAlgorithm.category}</Text>
                            </View>
                            
                            <View style={styles.userContainer}>
                                <Image source={placeholder} style={styles.userIcon} />
                                <Text style={styles.userName}>{subscribedAlgorithm.userName}</Text>
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.titleContainer}>
                                <Text style={styles.titleText}>{subscribedAlgorithm.title}</Text>
                                <View style={styles.performanceScore}>
                                    <Text style={styles.performanceScoreText}>
                                        {subscribedAlgorithm.performance?.score || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.graphContainer}>
                                <LineChart
                                    data={{
                                        labels: subscribedAlgorithm.chartData?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                                        datasets: [{
                                            data: subscribedAlgorithm.chartData?.data || [100, 110, 120, 150, 180, 210],
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
                        </TouchableOpacity>
                    </View>
                )}

            <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handleMenuItemPress(item.name)}
                    >
                        <View style={styles.menuItemContent}>
                            <Text style={styles.menuItemText}>{item.name}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            </ScrollView> 
        </View>
    );
};

const getCategoryColor = (category) => {
    switch(category) {
        case 'Forex': return '#4FC3F7';
        case 'Stocks': return '#81C784';
        case 'Crypto': return '#FF8A65';
        default: return '#9E9E9E';
    }
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 30,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    headerText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    menuContainer: {
        marginTop: 20,
        gap: 15, // Adds space between menu items
    },
    menuItem: {
        backgroundColor: '#333', // Gray background
        borderRadius: 10, // Rounded corners
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    menuItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    subscribedAlgorithmContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    // These should match your Marketplace styles:
    contentBox: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginTop: -10, 
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
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        zIndex: 1,
    },
    subscribedText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    categoryLabel: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    categoryLabelText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
    divider: {
        height: 1,
        backgroundColor: 'black',
        marginVertical: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    titleText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
        flex: 1,
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
    graphContainer: {
        marginBottom: 15,
    },
    chartStyle: {
        borderRadius: 5,
    },
});

export default Portfolio;