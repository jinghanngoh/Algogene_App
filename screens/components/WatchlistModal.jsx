import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import bitcoin from '../../assets/img/bitcoin.png';
import ethereum from '../../assets/img/ethereum.png';

const getCryptoIcon = (symbol) => {
  switch (symbol) {
    case 'BTCUSD':
      return bitcoin;
    case 'ETHUSD':
      return ethereum;
    default:
      return null;
  }
};

const WatchlistModal = ({ 
  visible, 
  onClose, 
  allItems = [], 
  selectedItems = [], 
  setSelectedItems 
}) => {
  const toggleItem = (symbol) => {
    if (selectedItems.includes(symbol)) {
      setSelectedItems(selectedItems.filter((item) => item !== symbol));
    } else {
      setSelectedItems([...selectedItems, symbol]);
    }
  };

  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Watchlist</Text>
          
          <ScrollView style={styles.modalScrollView}>
            {allItems.map((item) => (
              <Pressable
                key={item.symbol}
                style={styles.modalItem}
                onPress={() => toggleItem(item.symbol)}
              >
                <View style={styles.modalItemContent}>
                  {/* Use the getCryptoIcon function to get the correct icon */}
                  <Image source={getCryptoIcon(item.symbol)} style={styles.modalIcon} />
                  <View style={styles.modalItemText}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemSymbol}>{item.symbol}</Text>
                  </View>
                </View>
                {selectedItems.includes(item.symbol) && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </Pressable>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  modalItemText: {
    justifyContent: 'space-between',
  },
  modalItemName: {
    color: 'white',
    fontSize: 16,
  },
  modalItemSymbol: {
    color: 'gray',
    fontSize: 12,
  },
  modalCloseButton: {
    backgroundColor: '#4682B4',
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WatchlistModal;