import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAlgoDailyReturns } from '../../services/testApi';

// Calculate performance score based on daily returns
export const calculatePerformanceScore = (dailyReturns) => {
  if (!dailyReturns || dailyReturns.length === 0) {
    return 60; // Default score if no data
  }

  // Calculate average daily return and standard deviation
  const returns = dailyReturns.map(item => item.r);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Calculate a score based on average return and volatility (simplified Sharpe-like score)
  const riskFreeRate = 0.02 / 252; // Annual risk-free rate (2%) adjusted for daily
  const sharpeRatio = (avgReturn - riskFreeRate) / (stdDev || 1); // Avoid division by zero
  const normalizedScore = Math.min(Math.max(60 + sharpeRatio * 1000, 60), 99); // Scale to 60-99

  return Math.round(normalizedScore);
};

// Generate chart data for LineChart from daily returns
export const generateChartData = (dailyReturns) => {
  if (!dailyReturns || dailyReturns.length === 0) {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [50, 50, 50, 50, 50, 50]
    };
  }

  // Sort by date and take the last 6 entries for the chart
  const sortedReturns = [...dailyReturns].sort((a, b) => new Date(a.t) - new Date(b.t));
  const recentReturns = sortedReturns.slice(-6);

  // Generate labels (e.g., '2025-05-29' -> 'May 29')
  const labels = recentReturns.map(item => {
    const date = new Date(item.t);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
  });

  // Use cumulative returns for the chart
  const data = recentReturns.map(item => item.cr * 100); // Convert to percentage

  return {
    labels,
    data
  };
};

export const getDailyReturnsData = async (algoId, accountingDate = null, isExtrapolate = false) => {
    try {
      const cacheKey = `daily_returns_${algoId}_${accountingDate || 'latest'}_${isExtrapolate}`;
      let dailyReturns = null;
  
      // Check cache first
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`Returning cached daily returns for algo_id: ${algoId}`);
        dailyReturns = JSON.parse(cachedData);
      } else {
        // Fetch from API if no cache
        dailyReturns = await fetchAlgoDailyReturns(algoId, accountingDate, isExtrapolate);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(dailyReturns));
      }
  
      return {
        performance: { score: calculatePerformanceScore(dailyReturns) },
        chartData: generateChartData(dailyReturns)
      };
    } catch (error) {
      console.error(`Error processing daily returns for algo_id ${algoId}:`, error);
      return {
        performance: { score: 60 },
        chartData: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [50, 50, 50, 50, 50, 50] }
      };
    }
  };
