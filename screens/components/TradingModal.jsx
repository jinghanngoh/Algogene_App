import React from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSubscription } from '../../context/SubscriptionContext';

const TradingModal = ({ visible, onClose, strategy = null }) => {
  const { subscribedAlgorithm, subscribeToAlgorithm, unsubscribeFromAlgorithm } = useSubscription();

  const defaultStrategy = {
    id: 'default-strategy',
    title: '定海神針',
    userName: 'Trader Pro',
    category: 'Forex',
    description: 'This strategy uses advanced machine learning to predict currency movements with 85% accuracy.',
    assetClass: 'Forex',
    tradingInstruments: 'EUR/USD, GBP/USD, USD/JPY',
    supportedBrokers: 'Broker A, Broker B, Broker C',
    tradingRequirements: 'Minimum $500 account balance',
    performance: {
      score: '65',
      tradingDays: '256',
      sharpeRatio: '1.8',
      sortinoRatio: '2.1',
      volatility: '12%',
      annualReturn: '24%',
      maxDrawdown: '8%',
    },
    price: 999
  };

  const mergedStrategy = strategy ? { ...defaultStrategy, ...strategy } : defaultStrategy;
  const isSubscribed = subscribedAlgorithm?.id === mergedStrategy.id;

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      data: [100, 110, 120, 150, 180, 210],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
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

          <View style={styles.titleSection}>
            <Text style={styles.strategyTitle}>{mergedStrategy.title}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{mergedStrategy.performance.score}</Text>
            </View>
          </View>

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

          <View style={styles.userSection}>
            <Text style={styles.userName}>{mergedStrategy.userName}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{mergedStrategy.category}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STRATEGY DESCRIPTION:</Text>
            <Text style={styles.sectionContent}>{mergedStrategy.description}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ASSET CLASS:</Text>
              <Text style={styles.detailValue}>{mergedStrategy.assetClass}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TRADING INSTRUMENTS:</Text>
              <Text style={styles.detailValue}>{mergedStrategy.tradingInstruments}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SUPPORTED BROKERS:</Text>
              <Text style={styles.detailValue}>{mergedStrategy.supportedBrokers}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TRADING REQUIREMENTS:</Text>
              <Text style={styles.detailValue}>{mergedStrategy.tradingRequirements}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCE</Text>
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>score</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.score}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>trading days</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.tradingDays}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>sharpe ratio</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.sharpeRatio}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>sortino ratio</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.sortinoRatio}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>volatility</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.volatility}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>ann. return</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.annualReturn}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>max. drawdown</Text>
                <Text style={styles.performanceValue}>{mergedStrategy.performance.maxDrawdown}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingText}>HKD {mergedStrategy.price} / mo</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton, 
              isSubscribed && styles.unsubscribeButton
            ]}
            onPress={() => {
              isSubscribed 
                ? unsubscribeFromAlgorithm() 
                : subscribeToAlgorithm(mergedStrategy);
              onClose();
            }}
          >
            <Text style={styles.subscribeButtonText}>
              {isSubscribed ? 'Unsubscribe' : `Subscribe (HKD ${mergedStrategy.price}/mo)`}
            </Text>
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
  unsubscribeButton: {
    backgroundColor: '#F44336',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TradingModal;