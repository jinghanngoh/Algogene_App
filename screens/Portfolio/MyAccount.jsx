import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const MyAccount = () => {
    const accountData = {
        currency: 'USD',
        leverage: '5.0',
        subscriptionEnd: '2025-08-31 02:02:51',
        runningScript: 'NA',
        nav: '1,000,000.0',
        realizedPL: '0.0',
        unrealizedPL: '0.0',
        marginUsed: '0.0',
        availableBalance: '1,000,000.0',
    };

    const screenWidth = Dimensions.get('window').width;

    const cashBalanceData = {
        labels: [''],
        datasets: [
            {
                data: [1000000]
            },
        ],
    };

    return (
        <View style={styles.container}>
            {/* Box 1: Account Info */}
            <View style={styles.box}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>#1000</Text>
                    <Text style={styles.headerInactive}>INACTIVE</Text>
                </View>
                
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Currency:</Text>
                    <Text style={styles.detailsValue}>{accountData.currency}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Leverage:</Text>
                    <Text style={styles.detailsValue}>{accountData.leverage}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Subscription End:</Text>
                    <Text style={styles.detailsValue}>{accountData.subscriptionEnd}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Running Script:</Text>
                    <Text style={styles.detailsValue}>{accountData.runningScript}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>NAV:</Text>
                    <Text style={styles.detailsValue}>{accountData.nav}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Realized PL:</Text>
                    <Text style={styles.detailsValue}>{accountData.realizedPL}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Unrealized PL:</Text>
                    <Text style={styles.detailsValue}>{accountData.unrealizedPL}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Margin Used:</Text>
                    <Text style={styles.detailsValue}>{accountData.marginUsed}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Available Balance:</Text>
                    <Text style={styles.detailsValue}>{accountData.availableBalance}</Text>
                </View>
            </View>

            {/* Box 2: Position Size */}
            <View style={styles.box}>
                <Text style={styles.sectionTitle}>Position Size</Text>
                <View style={styles.ovalContainer}>
                    <View style={styles.outerOval}>
                        <Text style={styles.ovalLabel}>Total</Text>
                        <View style={styles.innerOval}>
                            <Text style={styles.ovalValue}>1000</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Box 3: Cash Balance */}
            <View style={styles.box}>
                <Text style={styles.sectionTitle}>Cash Balance</Text>
                <BarChart
                    data={cashBalanceData}
                    width={screenWidth - 60}
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    yAxisInterval={1}
                    fromZero
                    showBarTops={false}
                    withHorizontalLabels={true}
                    withVerticalLabels={false}
                    chartConfig={{
                        backgroundColor: '#000000',
                        backgroundGradientFrom: '#000000',
                        backgroundGradientTo: '#000000',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: "0"
                        },
                        barPercentage: 0.8,
                        propsForLabels: {
                            fontSize: 10
                        }
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
                <View style={styles.yAxisLabels}>
                    <Text style={styles.yAxisLabel}>0</Text>
                    <Text style={styles.yAxisLabel}>200K</Text>
                    <Text style={styles.yAxisLabel}>400K</Text>
                    <Text style={styles.yAxisLabel}>600K</Text>
                    <Text style={styles.yAxisLabel}>800K</Text>
                    <Text style={styles.yAxisLabel}>1M</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    box: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    headerInactive: {
        fontSize: 16,
        color: 'gray',
        alignSelf: 'center',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailsLabel: {
        color: 'lightgray',
        fontSize: 14,
    },
    detailsValue: {
        color: 'white',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: 'white',
    },
    ovalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    outerOval: {
        width: 200,
        height: 100,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#1e90ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerOval: {
        width: 120,
        height: 60,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#1e90ff',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(30, 144, 255, 0.2)',
    },
    ovalLabel: {
        color: 'white',
        fontSize: 16,
        position: 'absolute',
        top: -10,
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 10,
    },
    ovalValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    yAxisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: -20,
    },
    yAxisLabel: {
        color: 'white',
        fontSize: 10,
    },
});

export default MyAccount;