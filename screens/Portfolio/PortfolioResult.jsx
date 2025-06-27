import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const PortfolioResult = () => {
  const params = useLocalSearchParams() || {};
  const [resultData, setResultData] = useState({
    annualizedReturn: 0,
    annualizedVolatility: 0,
    sharpeRatio: 0,
    var95: 0,
    cvar95: 0,
    cashLeft: 0,
    assets: [],
  });

  const [activeTab, setActiveTab] = useState('RESULT');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Raw useLocalSearchParams Output:', params);
    setIsLoading(true);
    if (params?.resultData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(params.resultData));
        console.log('Parsed Result Data:', parsedData);
        if (JSON.stringify(parsedData) !== JSON.stringify(resultData)) {
          setResultData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing resultData:', error);
      }
    } else {
      console.warn('No resultData in params', { params });
    }
    setIsLoading(false);
  }, [params.resultData]);

  const chartWidthAndHeight = 180;
  const sliceColors = ['#4FC3F7', '#FF2D55', '#5856D6', '#FF9500', '#4CD964', '#FFCC00', '#8E24AA'];
  const seriesWithColors = (Array.isArray(resultData.assets) ? resultData.assets : [])
    .map((asset, index) => {
      const value = asset.optimalHolding || 0;
      const color = sliceColors[index % sliceColors.length] || '#000000';
      if (value > 0 && color) {
        return { value, color, label: asset.name || `Asset ${index}` };
      }
      console.warn(`Invalid slice: ${JSON.stringify({ value, color, asset })}`);
      return null;
    })
    .filter(Boolean);

  const seriesSum = seriesWithColors.reduce((sum, item) => sum + (item.value || 0), 0);

  console.log('Result Data Assets:', resultData.assets);
  console.log('Slice Colors:', sliceColors);
  console.log('Generated Series:', seriesWithColors);

  return (
    <ScrollView style={styles.container}>
      {/* Tab Buttons (2x2 Grid) */}
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'RESULT' && styles.activeTab]}
            onPress={() => setActiveTab('RESULT')}
          >
            <Text style={styles.tabText}>RESULT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'EF' && styles.activeTab]}
            onPress={() => setActiveTab('EF')}
          >
            <Text style={styles.tabText}>EF</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Correlation' && styles.activeTab]}
            onPress={() => setActiveTab('Correlation')}
          >
            <Text style={styles.tabText}>Correlation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Simulation' && styles.activeTab]}
            onPress={() => setActiveTab('Simulation')}
          >
            <Text style={styles.tabText}>Simulation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FC3F7" />
        </View>
      ) : (
        <>
          {activeTab === 'RESULT' && (
            <>
              {/* Optimal Allocation Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Optimal Allocation</Text>
                {seriesSum > 0 && seriesWithColors.length > 0 ? (
                  <>
                    {console.log('PieChart Props:', {
                      data: seriesWithColors.map(item => ({
                        name: item.label || 'Unknown',
                        population: item.value || 0,
                        color: item.color || '#000000',
                        legendFontColor: '#FFFFFF',
                        legendFontSize: 14,
                      })),
                    })}
                    <PieChart
                      data={seriesWithColors.map(item => ({
                        name: item.label || 'Unknown',
                        population: item.value || 0,
                        color: item.color || '#000000',
                        legendFontColor: '#FFFFFF',
                        legendFontSize: 14,
                      }))}
                      width={Dimensions.get('window').width - 40}
                      height={chartWidthAndHeight}
                      chartConfig={{
                        backgroundColor: '#1E1E1E',
                        backgroundGradientFrom: '#1E1E1E',
                        backgroundGradientTo: '#1E1E1E',
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[10, 0]}
                      absolute
                    />
                    <View style={styles.legend}>
                      {resultData.assets && resultData.assets.length > 0 ? (
                        resultData.assets.map((asset, index) => (
                          <View key={asset.id} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: sliceColors[index % sliceColors.length] || '#000000' }]} />
                            <Text style={styles.legendText}>{asset.name || 'N/A'}: {asset.optimalHolding || 0}%</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>No assets available for legend</Text>
                      )}
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataText}>No valid allocation data for pie chart</Text>
                )}
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
                    <Text style={[styles.headerText, { flex: 1.5 }]}>Asset</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>Current Price</Text>
                    <Text style={[styles.headerText, { flex: 1.2 }]}>Current Holding</Text>
                    <Text style={[styles.headerText, { flex: 1.2 }]}>Optimal Holding</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>Optimal Shares</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>Change in Shares</Text>
                  </View>
                  {resultData.assets.length === 0 ? (
                    <Text style={styles.noDataText}>No allocation data available</Text>
                  ) : (
                    resultData.assets.map((item) => (
                      <View key={item.id} style={styles.tableRow}>
                        <Text style={[styles.cell, { flex: 1.5 }]}>{item.name || 'N/A'}</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{(item.currentPrice || 0).toFixed(2)}</Text>
                        <Text style={[styles.cell, { flex: 1.2 }]}>{(item.currentHolding || 0).toFixed(2)}%</Text>
                        <Text style={[styles.cell, { flex: 1.2 }]}>{(item.optimalHolding || 0).toFixed(2)}%</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{(item.optimalShares || 0).toFixed(0)}</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{(item.changeInShares || 0).toFixed(0)}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </>
          )}

          {activeTab === 'EF' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Efficient Frontier</Text>
              <Text style={styles.noDataText}>Efficient Frontier chart coming soon (e.g., risk vs. return plot)</Text>
              <LineChart
                data={{
                  labels: ['Risk 1', 'Risk 2', 'Risk 3'],
                  datasets: [{ data: [1, 2, 3] }],
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#1E1E1E',
                  backgroundGradientFrom: '#1E1E1E',
                  backgroundGradientTo: '#1E1E1E',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                bezier
                style={{ marginVertical: 8 }}
              />
            </View>
          )}

          {activeTab === 'Correlation' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Correlation Matrix</Text>
              <Text style={styles.noDataText}>Correlation matrix coming soon (e.g., heatmap of asset correlations)</Text>
        
              <View style={styles.assetTable}>
              <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, { flex: 1 }]}>Asset</Text>
                  <Text style={[styles.headerText, { flex: 1 }]}>BTCUSD</Text>
                </View>
                
                {Array.isArray(resultData.assets) && resultData.assets.length > 0 ? (
                  resultData.assets.map((asset, index) => {
                    if (!asset || typeof asset.id === 'undefined') {
                      console.warn('Skipping invalid asset:', asset);
                      return null; // Skip invalid assets
                    }
                    return (
                      <View key={`${asset.id}-${index}`} style={styles.tableRow}>
                        <Text style={[styles.cell, { flex: 1 }]}>{String(asset.name || 'N/A')}</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{String((Math.random() * 1).toFixed(2) || 'N/A')}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noDataText}>No assets available for correlation</Text>
                )}
             </View>
              {console.log('Correlation Render - Assets:', resultData.assets, 'Loading:', isLoading)}
            </View>
          )}

          {activeTab === 'Simulation' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Simulation Results</Text>
              <Text style={styles.noDataText}>Simulation results coming soon (e.g., Monte Carlo outcomes)</Text>
              <BarChart
                data={{
                  labels: ['Sim 1', 'Sim 2', 'Sim 3'],
                  datasets: [{ data: [1000, 1500, 1200] }],
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#1E1E1E',
                  backgroundGradientFrom: '#1E1E1E',
                  backgroundGradientTo: '#1E1E1E',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                style={{ marginVertical: 8 }}
              />
            </View>
          )}
        </>
      )}
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
    flexDirection: 'column',
    marginBottom: 20,
    marginTop: 40,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activeTab: {
    flex: 1,
    backgroundColor: '#4FC3F7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  tab: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 10,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: 'white',
    fontSize: 14,
  },
  resultTable: {
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: 'white',
    flex: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'right',
  },
  assetTable: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A0A0A0',
    textAlign: 'center',
    paddingVertical: 10,
    lineHeight: 18,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  cell: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    paddingVertical: 6,
  },
  noDataText: {
    textAlign: 'square',
    padding: 20,
    color: 'lightgray',
    fontSize: 15,
  },
});

export default PortfolioResult;