import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const RealTrade = () => {
    const accountData = {
        broker: '',
        baseCurrency: '',
        leverage: '1.0',
        nav: '0.0',
        algoId: '',
        subscriptionEnd: '2025-07-02 02:02:51',
    };

    const actionButtons = [
        'Connect Broker',
        'Webhook Setup',
        'Download Statement',
        'Strategy Configs',
        'Execute My Algo',
        'Share Signal',
        'Copy Trade'
    ];

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.box}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>#1000</Text>
                    <Text style={styles.headerInactive}>INACTIVE</Text>
                </View>
                
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Broker:</Text>
                    <Text style={styles.detailsValue}>{accountData.broker}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Base Currency:</Text>
                    <Text style={styles.detailsValue}>{accountData.baseCurrency}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Leverage:</Text>
                    <Text style={styles.detailsValue}>{accountData.leverage}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>NAV:</Text>
                    <Text style={styles.detailsValue}>{accountData.nav}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Running Script:</Text>
                    <Text style={styles.detailsValue}>{accountData.algoId}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Subscription End:</Text>
                    <Text style={styles.detailsValue}>{accountData.subscriptionEnd}</Text>
                </View>
            </View>

            {/* Action Buttons Section */}
            <View style={styles.buttonsContainer}>
                {actionButtons.map((button, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.actionButton}
                        onPress={() => console.log(`${button} pressed`)}
                    >
                        <Text style={styles.buttonText}>{button}</Text>
                    </TouchableOpacity>
                ))}
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
    buttonsContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 10,
    },
    actionButton: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default RealTrade;