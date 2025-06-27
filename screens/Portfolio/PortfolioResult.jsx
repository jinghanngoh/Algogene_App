import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const PortfolioResult = () => {
  const params = useLocalSearchParams();
  const [resultData, setResultData] = useState(null);
  const [assetAllocate, setAssetAllocate] = useState(null);

  useEffect(() => {
    console.log('Raw useLocalSearchParams Output:', params);

    // Parse resultData
    if (params?.resultData) {
      try {
        const parsedResultData = JSON.parse(decodeURIComponent(params.resultData));
        // Only update state if parsed data is different
        if (JSON.stringify(parsedResultData) !== JSON.stringify(resultData)) {
          console.log('Parsed Result Data:', parsedResultData);
          setResultData(parsedResultData);
        }
      } catch (error) {
        console.error('Error parsing resultData:', error);
      }
    } else {
      console.warn('No resultData in params', { params });
    }

    // Parse assetAllocate
    if (params?.assetAllocate) {
      try {
        const parsedAssetAllocate = JSON.parse(decodeURIComponent(params.assetAllocate));
        // Only update state if parsed data is different
        if (JSON.stringify(parsedAssetAllocate) !== JSON.stringify(assetAllocate)) {
          console.log('Parsed Asset Allocate:', parsedAssetAllocate);
          setAssetAllocate(parsedAssetAllocate);
        }
      } catch (error) {
        console.error('Error parsing assetAllocate:', error);
      }
    } else {
      console.warn('No assetAllocate in params', { params });
    }
  }, [params.resultData, params.assetAllocate]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        {assetAllocate ? (
          assetAllocate.map((item, index) => (
            <Text key={index} style={styles.text}>
              Symbol: {item.symbol}, Weight: {(item.weight * 100).toFixed(2)}%
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No Asset Allocation Data</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Metrics</Text>
        {resultData ? (
          <>
            <Text style={styles.text}>
              Annualized Return: {(resultData.annualizedReturn || 0).toFixed(2)}%
            </Text>
            <Text style={styles.text}>
              Annualized Volatility: {(resultData.annualizedVolatility || 0).toFixed(2)}%
            </Text>
            <Text style={styles.text}>
              Sharpe Ratio: {(resultData.sharpeRatio || 0).toFixed(2)}
            </Text>
            <Text style={styles.text}>
              95% VaR (Daily): {(resultData.var95 || 0).toFixed(5)}
            </Text>
            <Text style={styles.text}>
              95% CVaR (Daily): {(resultData.cvar95 || 0).toFixed(5)}
            </Text>
            <Text style={styles.text}>
              Cash Left: {(resultData.cashLeft || 0).toFixed(2)}
            </Text>
          </>
        ) : (
          <Text style={styles.text}>No Portfolio Metrics Data</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
});

export default PortfolioResult;


// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';

// // Placeholder for pie chart (you can replace with a library like react-native-pie-chart)
// const PieChartPlaceholder = ({ assets }) => (
//   <View style={styles.pieChart}>
//     <Text>Pie Chart (Assets: {assets.length} items)</Text>
//   </View>
// );

// const PortfolioResult = () => {
//   const params = useLocalSearchParams();
//   const [data, setData] = useState({
//     annualizedReturn: 0,
//     annualizedVolatility: 0,
//     sharpeRatio: 0,
//     var95: 0,
//     cvar95: 0,
//     cashLeft: 0,
//     assets: [],
//   });


//   useEffect(() => {
//     console.log('Raw useLocalSearchParams Output:', useLocalSearchParams());
//     console.log('Received Params:', params);
//     if (params?.test) {
//       console.log('Test Param Received:', params.test);
//     }
//     if (params?.resultData) {
//       try {
//         const parsedData = JSON.parse(decodeURIComponent(params.resultData));
//         console.log('Parsed Result Data:', parsedData);
//         setData(parsedData);
//       } catch (error) {
//         console.error('Error parsing resultData:', error);
//       }
//     } else {
//       console.warn('No resultData in params', { params });
//     }
//   }, [params]);

//   return (
//     <ScrollView style={styles.container}>
//       {/* Tab Buttons */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity style={styles.activeTab}>
//           <Text style={styles.tabText}>RESULT</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.tab}>
//           <Text style={styles.tabText}>EF</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Optimal Allocation Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Optimal Allocation</Text>
//         <PieChartPlaceholder assets={resultData.assets} />
//       </View>

//       {/* Optimal Portfolio Result Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Optimal Portfolio Result</Text>
//         <View style={styles.resultTable}>
//           <View style={styles.row}>
//             <Text style={styles.label}>Annualized Return</Text>
//             <Text style={styles.value}>{(resultData.annualizedReturn || 0).toFixed(2)}%</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Annualized Volatility</Text>
//             <Text style={styles.value}>{(resultData.annualizedVolatility || 0).toFixed(2)}%</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Sharpe Ratio</Text>
//             <Text style={styles.value}>{(resultData.sharpeRatio || 0).toFixed(2)}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>95% Value at Risk (VaR) (daily)</Text>
//             <Text style={styles.value}>{(resultData.var95 || 0).toFixed(2)}%</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>95% Conditional VaR (daily)</Text>
//             <Text style={styles.value}>{(resultData.cvar95 || 0).toFixed(2)}%</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Cash Left</Text>
//             <Text style={styles.value}>{(resultData.cashLeft || 0).toFixed(2)}%</Text>
//           </View>
//         </View>
//       </View>

//       {/* Asset Allocation Table */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Asset Allocation</Text>
//         <View style={styles.assetTable}>
//           <View style={styles.tableHeader}>
//             <Text style={styles.headerText}>Asset</Text>
//             <Text style={styles.headerText}>Current Price</Text>
//             <Text style={styles.headerText}>Current Holding</Text>
//             <Text style={styles.headerText}>Optimal Holding</Text>
//             <Text style={styles.headerText}>Optimal Shares</Text>
//             <Text style={styles.headerText}>Change in Shares</Text>
//           </View>
//           {/* {resultData.assets.length === 0 ? ( */}
//           {data.assets.length === 0 ? (
//             <Text style={styles.noDataText}>No allocation data available</Text>
//           ) : (
//             <FlatList
//               data={resultData.assets}
//               keyExtractor={(item) => item.id}
//               renderItem={({ item }) => (
//                 <View style={styles.tableRow}>
//                   <Text style={styles.cell}>{item.name || 'N/A'}</Text>
//                   <Text style={styles.cell}>{(item.currentPrice || 0).toFixed(2)}</Text>
//                   <Text style={styles.cell}>{(item.currentHolding || 0).toFixed(2)}%</Text>
//                   <Text style={styles.cell}>{(item.optimalHolding || 0).toFixed(2)}%</Text>
//                   <Text style={styles.cell}>{(item.optimalShares || 0).toFixed(0)}</Text>
//                   <Text style={styles.cell}>{(item.changeInShares || 0).toFixed(0)}</Text>
//                 </View>
//               )}
//             />
//           )}
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//     padding: 20,
//   },
//   headerTitle: {
//     fontSize: 20,
//     color: 'white',
//     fontWeight: 'bold',
//     marginBottom: 20,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   section: {
//     marginBottom: 25,
//     backgroundColor: '#1E1E1E',
//     borderRadius: 5,
//     padding: 15,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#444',
//     paddingBottom: 5,
//   },
//   pieChartContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 15,
//   },
//   allocationSummary: {
//     marginTop: 10,
//   },
//   assetSummary: {
//     fontSize: 14,
//     marginBottom: 5,
//     color: 'lightgray',
//   },
//   boldText: {
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   metricsContainer: {
//     backgroundColor: '#2a2a2a',
//     borderRadius: 5,
//     padding: 15,
//   },
//   metricRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   metricLabel: {
//     fontSize: 14,
//     color: 'lightgray',
//     flex: 2,
//   },
//   metricValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: 'white',
//     flex: 1,
//     textAlign: 'right',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: 'white',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   noDataText: {
//     textAlign: 'center',
//     padding: 20,
//     color: 'lightgray',
//   },
// });

// export default PortfolioResult;
