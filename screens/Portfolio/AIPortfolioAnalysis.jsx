import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const AIPortfolioAnalysis = () => {
    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.headerTitle}>AI PORTFOLIO ANALYSIS</Text>
                
                <View style={styles.inputRow}>
                    <Text style={styles.label}>Time Period:</Text>
                    <Text style={styles.value}>Last 30 Days</Text>
                </View>
                
                <View style={styles.inputRow}>
                    <Text style={styles.label}>Risk Level:</Text>
                    <Text style={styles.value}>Medium</Text>
                </View>
                
                <View style={styles.divider} />
                
                {/* Analysis Results */}
                <View style={styles.resultSection}>
                    <Text style={styles.resultTitle}>Portfolio Health</Text>
                    <Text style={styles.resultValue}>75% (Good)</Text>
                </View>
                
                <View style={styles.resultSection}>
                    <Text style={styles.resultTitle}>Diversification Score</Text>
                    <Text style={styles.resultValue}>68/100</Text>
                </View>
                
                <View style={styles.resultSection}>
                    <Text style={styles.resultTitle}>Risk Assessment</Text>
                    <Text style={styles.resultValue}>Moderate Volatility</Text>
                </View>
                
                <View style={styles.resultSection}>
                    <Text style={styles.resultTitle}>Recommended Actions</Text>
                    <Text style={styles.resultValue}>Increase bond allocation by 10%</Text>
                </View>
                
                <View style={styles.divider} />
                
                <TouchableOpacity style={styles.analyzeButton}>
                    <Text style={styles.analyzeButtonText}>RUN ANALYSIS</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.exportButton}>
                    <Text style={styles.exportButtonText}>EXPORT REPORT</Text>
                </TouchableOpacity>
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
    },
    headerTitle: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    label: {
        color: 'lightgray',
        width: 120,
    },
    value: {
        color: 'white',
        flex: 1,
    },
    divider: {
        borderBottomColor: '#333',
        borderBottomWidth: 1,
        marginVertical: 15,
    },
    resultSection: {
        marginBottom: 15,
    },
    resultTitle: {
        color: 'lightgray',
        fontSize: 14,
    },
    resultValue: {
        color: 'white',
        fontSize: 16,
        marginTop: 5,
    },
    analyzeButton: {
        backgroundColor: '#1e90ff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    analyzeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    exportButton: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    exportButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default AIPortfolioAnalysis;