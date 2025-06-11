import React from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit'; // You'll need to install this package

const TradingModal = ({ visible, onClose, strategy }) => {
  // if (!strategy) {
  //   return null; // If strategy is undefined, return null or a loading indicator
  // }

  // Sample chart data - replace with your actual data
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [100, 110, 120, 150, 180, 210],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2196F3"
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Strategy Title and Performance Score */}
          <View style={styles.titleSection}>
            <Text style={styles.strategyTitle}>定海神針</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>65</Text>
            </View>
          </View>

          {/* Performance Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
            <Text style={styles.performanceText}>+120.4062%</Text>
          </View>

          {/* User and Category */}
          <View style={styles.userSection}>
            <Text style={styles.userName}>{strategy.userName}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{strategy.category}</Text>
            </View>
          </View>

          {/* Strategy Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STRATEGY DESCRIPTION:</Text>
            <Text style={styles.sectionContent}>{strategy.description}</Text>
          </View>

          {/* Strategy Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ASSET CLASS:</Text>
              <Text style={styles.detailValue}>{strategy.assetClass}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TRADING INSTRUMENTS:</Text>
              <Text style={styles.detailValue}>{strategy.tradingInstruments}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SUPPORTED BROKERS:</Text>
              <Text style={styles.detailValue}>{strategy.supportedBrokers}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TRADING REQUIREMENTS:</Text>
              <Text style={styles.detailValue}>{strategy.tradingRequirements}</Text>
            </View>
          </View>

          {/* Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCE</Text>
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>score</Text>
                <Text style={styles.performanceValue}>{strategy.performance.score}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>trading days</Text>
                <Text style={styles.performanceValue}>{strategy.performance.tradingDays}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>sharpe ratio</Text>
                <Text style={styles.performanceValue}>{strategy.performance.sharpeRatio}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>sortino ratio</Text>
                <Text style={styles.performanceValue}>{strategy.performance.sortinoRatio}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>volatility</Text>
                <Text style={styles.performanceValue}>{strategy.performance.volatility}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>ann. return</Text>
                <Text style={styles.performanceValue}>{strategy.performance.annualReturn}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>max. drawdown</Text>
                <Text style={styles.performanceValue}>{strategy.performance.maxDrawdown}%</Text>
              </View>
            </View>
          </View>

          {/* Pricing Information */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingText}>HKD 999 / mo</Text>
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 30,
    color: '#333',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  strategyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContainer: {
    backgroundColor: '#4FC3F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 10,
  },
  performanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryTag: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  detailsContainer: {
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 160,
    fontSize: 14,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '30%',
    marginBottom: 15,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pricingSection: {
    marginVertical: 20,
    alignItems: 'center',
  },
  pricingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subscribeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TradingModal;
