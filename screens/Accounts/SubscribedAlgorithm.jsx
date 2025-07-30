import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../../context/SubscriptionContext';

const SubscribedAlgorithm = () => {
  const { subscribedAlgorithm, unsubscribeFromAlgorithm } = useSubscription();

  if (!subscribedAlgorithm) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Algorithm</Text>
        <TouchableOpacity onPress={unsubscribeFromAlgorithm}>
          <Text style={styles.unsubscribeText}>Unsubscribe</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.algorithmName}>{subscribedAlgorithm.title}</Text>
      <Text style={styles.algorithmDetails}>
        {subscribedAlgorithm.category} • Score: {subscribedAlgorithm.performance}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  unsubscribeText: {
    color: 'red',
    fontSize: 14,
  },
  algorithmName: {
    fontSize: 14,
    fontWeight: '600',
  },
  algorithmDetails: {
    fontSize: 12,
    color: '#666',
  },
});

export default SubscribedAlgorithm;