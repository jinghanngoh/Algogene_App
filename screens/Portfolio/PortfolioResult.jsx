import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Placeholder for pie chart (replace with react-native-pie-chart if needed)
const PieChartPlaceholder = ({ assets }) => (
  <View style={styles.pieChart}>
    <Text style={styles.pieChartText}>Pie Chart (Assets: {assets.length} items)</Text>
  </View>
);

const PortfolioResult = () => {
  const params = useLocalSearchParams();
  const [resultData, setResultData] = useState({
    annualizedReturn: 0,
    annualizedVolatility: 0,
    sharpeRatio: 0,
    var95: 0,
    cvar95: 0,
    cashLeft: 0,
    assets: [],
  });

  useEffect(() => {
    console.log('Raw useLocalSearchParams Output:', params);
    if (params?.resultData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(params.resultData));
        console.log('Parsed Result Data:', parsedData);
        // Only update state if parsed data is different
        if (JSON.stringify(parsedData) !== JSON.stringify(resultData)) {
          setResultData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing resultData:', error);
      }
    } else {
      console.warn('No resultData in params', { params });
    }
  }, [params.resultData]);

  return (
    <ScrollView style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.tabText}>RESULT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>EF</Text>
        </TouchableOpacity>
      </View>

      {/* Optimal Allocation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optimal Allocation</Text>
        <PieChartPlaceholder assets={resultData.assets} />
      </View>

      {/* Optimal Portfolio Result Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optimal Portfolio Result</Text>
        <View style={styles.resultTable}>
          <View style={styles.row}>
            <Text style={styles.label}>Annualized Return</Text>
            <Text style={styles.value}>{(resultData.annualizedReturn || 0).toFixed(2)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Annualized Volatility</Text>
            <Text style={styles.value}>{(resultData.annualizedVolatility * 100 || 0).toFixed(2)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sharpe Ratio</Text>
            <Text style={styles.value}>{(resultData.sharpeRatio || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>95% Value at Risk (VaR) (daily)</Text>
            <Text style={styles.value}>{(resultData.var95 || 0).toFixed(5)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>95% Conditional VaR (daily)</Text>
            <Text style={styles.value}>{(resultData.cvar95 || 0).toFixed(5)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cash Left</Text>
            <Text style={styles.value}>{(resultData.cashLeft || 0).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Asset Allocation Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        <View style={styles.assetTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Asset</Text>
            <Text style={styles.headerText}>Current Price</Text>
            <Text style={styles.headerText}>Current Holding</Text>
            <Text style={styles.headerText}>Optimal Holding</Text>
            <Text style={styles.headerText}>Optimal Shares</Text>
            <Text style={styles.headerText}>Change in Shares</Text>
          </View>
          {resultData.assets.length === 0 ? (
            <Text style={styles.noDataText}>No allocation data available</Text>
          ) : (
            resultData.assets.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cell}>{item.name || 'N/A'}</Text>
                <Text style={styles.cell}>{(item.currentPrice || 0).toFixed(2)}</Text>
                <Text style={styles.cell}>{(item.currentHolding || 0).toFixed(2)}%</Text>
                <Text style={styles.cell}>{(item.optimalHolding || 0).toFixed(2)}%</Text>
                <Text style={styles.cell}>{(item.optimalShares || 0).toFixed(0)}</Text>
                <Text style={styles.cell}>{(item.changeInShares || 0).toFixed(0)}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 40, 
  },
  activeTab: {
    flex: 1,
    backgroundColor: '#4FC3F7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  tab: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#1E1E1E',
    borderRadius: 5,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 5,
  },
  pieChart: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    height: 150,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
  },
  pieChartText: {
    color: 'white',
    fontSize: 14,
  },
  resultTable: {
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: 'lightgray',
    flex: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'right',
  },
  assetTable: {
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 5,
    marginBottom: 5,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: 'lightgray',
    fontSize: 14,
  },
});

export default PortfolioResult;

