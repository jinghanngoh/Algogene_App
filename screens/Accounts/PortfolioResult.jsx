// Result from Portfolio Optimizer (Still quite alot todo for each button)
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

  const [underlyingAssets, setUnderlyingAssets] = useState([]);
  const [rebalanceStrategy, setRebalanceStrategy] = useState('None');
  const [activeTab, setActiveTab] = useState('Result');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const { resultData: rawResultData, underlyingAssets: rawUnderlyingAssets, rebalanceStrategy: rawRebalanceStrategy } = params;
  
      if (rawResultData) {
        const parsedData = JSON.parse(decodeURIComponent(rawResultData));
        if (JSON.stringify(parsedData) !== JSON.stringify(resultData)) {
          setResultData(parsedData);
        }
      } else {
        console.warn('No resultData in params', { params });
      }
  
      if (rawUnderlyingAssets) {
        const parsedAssets = JSON.parse(decodeURIComponent(rawUnderlyingAssets));
        setUnderlyingAssets(Array.isArray(parsedAssets) ? parsedAssets : []);
      } else {
        console.warn('No underlyingAssets in params', { params });
      }
  
      if (rawRebalanceStrategy) {
        setRebalanceStrategy(decodeURIComponent(rawRebalanceStrategy));
      } else {
        console.warn('No rebalanceStrategy in params', { params });
      }
    } catch (error) {
      console.error('Error parsing params:', error);
    }
    setIsLoading(false);
  }, [
    params.resultData && JSON.stringify(params.resultData),
    params.underlyingAssets && JSON.stringify(params.underlyingAssets),
    params.rebalanceStrategy && JSON.stringify(params.rebalanceStrategy),
  ]);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Result' && styles.activeTab]}
            onPress={() => setActiveTab('Result')}
          >
            <Text style={styles.tabText}>Result</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Performance' && styles.activeTab]}
            onPress={() => setActiveTab('Performance')}
          >
            <Text style={styles.tabText}>Performance</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Rebalancing' && styles.activeTab]}
            onPress={() => setActiveTab('Rebalancing')}
          >
            <Text style={styles.tabText}>Rebalancing</Text>
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
          {activeTab === 'Result' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Optimal Allocation</Text>
                {seriesSum > 0 && seriesWithColors.length > 0 ? (
                  <>
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
                  <View style={styles.row}>
                    <Text style={styles.label}>Underlying Assets</Text>
                    <Text style={styles.value}>
                      {underlyingAssets.length > 0 ? underlyingAssets.join(', ') : 'None'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Rebalance Strategy</Text>
                    <Text style={styles.value}>{rebalanceStrategy}</Text>
                  </View>
                </View>
              </View>

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

          {activeTab === 'Performance' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Statistics</Text>
              <View style={styles.resultTable}>
                <View style={styles.row}>
                  <Text style={styles.label}>No. of Tradable Days:</Text>
                  <Text style={styles.value}>{resultData.tradableDays || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Win Rate:</Text>
                  <Text style={styles.value}>{(resultData.winRate * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Odd Ratio:</Text>
                  <Text style={styles.value}>{resultData.oddRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>No. of Trades:</Text>
                  <Text style={styles.value}>{resultData.numTrades || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Total Pnl:</Text>
                  <Text style={styles.value}>{resultData.totalPnl?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Mean Daily Return:</Text>
                  <Text style={styles.value}>{(resultData.meanDailyReturn * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Daily Return StdDev:</Text>
                  <Text style={styles.value}>{(resultData.dailyReturnStdDev * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Daily Downside StdDev:</Text>
                  <Text style={styles.value}>{(resultData.dailyDownsideStdDev * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Daily Sharpe Ratio:</Text>
                  <Text style={styles.value}>{resultData.dailySharpeRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Daily Sortino Ratio:</Text>
                  <Text style={styles.value}>{resultData.dailySortinoRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Drawdown Duration:</Text>
                  <Text style={styles.value}>{resultData.maxDrawdownDuration?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Jensen Alpha:</Text>
                  <Text style={styles.value}>{resultData.jensenAlpha?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Omega Ratio:</Text>
                  <Text style={styles.value}>{resultData.omegaRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Calmar Ratio:</Text>
                  <Text style={styles.value}>{resultData.calmarRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>No. of Win Days:</Text>
                  <Text style={styles.value}>{resultData.winDays || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Consecutive Win Day:</Text>
                  <Text style={styles.value}>{resultData.maxConsecutiveWinDays || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Consecutive Gains:</Text>
                  <Text style={styles.value}>{resultData.maxConsecutiveGains?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Average Consecutive Win Day:</Text>
                  <Text style={styles.value}>{resultData.avgConsecutiveWinDays?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Average Per Trade Pnl:</Text>
                  <Text style={styles.value}>{resultData.avgPerTradePnl?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Median Daily Return:</Text>
                  <Text style={styles.value}>{(resultData.medianDailyReturn * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>25th percentile Daily Return:</Text>
                  <Text style={styles.value}>{(resultData.percentile25DailyReturn * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>95% 1 day return VaR:</Text>
                  <Text style={styles.value}>{(resultData.var95DailyReturn * 100 || 0).toFixed(2)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Annual Sharpe Ratio:</Text>
                  <Text style={styles.value}>{resultData.annualSharpeRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Annual Sortino Ratio:</Text>
                  <Text style={styles.value}>{resultData.annualSortinoRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Average Drawdown Duration:</Text>
                  <Text style={styles.value}>{resultData.avgDrawdownDuration?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Beta:</Text>
                  <Text style={styles.value}>{resultData.beta?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Treynor Ratio:</Text>
                  <Text style={styles.value}>{resultData.treynorRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>No. of Loss Days:</Text>
                  <Text style={styles.value}>{resultData.lossDays || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Consecutive Loss Day:</Text>
                  <Text style={styles.value}>{resultData.maxConsecutiveLossDays || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Consecutive Loss:</Text>
                  <Text style={styles.value}>{resultData.maxConsecutiveLoss?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Average Consecutive Loss Day:</Text>
                  <Text style={styles.value}>{resultData.avgConsecutiveLossDays?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Average Per Day Pnl:</Text>
                  <Text style={styles.value}>{resultData.avgPerDayPnl?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Mean Annual Return:</Text>
                  <Text style={styles.value}>{(resultData.meanAnnualReturn * 100 || 0).toFixed(2)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>75th percentile Daily Return:</Text>
                  <Text style={styles.value}>{(resultData.percentile75DailyReturn * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>99% 1 day return VaR:</Text>
                  <Text style={styles.value}>{(resultData.var99DailyReturn * 100 || 0).toFixed(2)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Drawdown Amount:</Text>
                  <Text style={styles.value}>{resultData.maxDrawdownAmount?.toFixed(2) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Max. Drawdown Percent:</Text>
                  <Text style={styles.value}>{(resultData.maxDrawdownPercent * 100 || 0).toFixed(4)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Annual Volatility:</Text>
                  <Text style={styles.value}>{(resultData.annualVolatility * 100 || 0).toFixed(2)}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Information Ratio:</Text>
                  <Text style={styles.value}>{resultData.informationRatio?.toFixed(4) || 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Tail Ratio:</Text>
                  <Text style={styles.value}>{resultData.tailRatio?.toFixed(4) || 0}</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'Rebalancing' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rebalancing</Text>
              <Text style={styles.noDataText}>Rebalancing</Text>
              
            </View>
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