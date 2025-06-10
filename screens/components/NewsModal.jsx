import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const NewsDetailModal = ({ visible, onClose, newsItem }) => {
  if (!newsItem) return null;

  const newsItems = [
    { 
      id: 1, 
      title: "NEWS 1", 
      heading: "Trade with ALGOGENE", 
      description: "Provide full support for quantitative/algorithmic trading",
      fullContent: "ALGOGENE offers comprehensive support for quantitative and algorithmic trading strategies. Our platform provides backtesting capabilities, live trading integration, and a robust API for developers. Whether you're a beginner or an experienced quant, our tools help you test and implement your strategies efficiently."
    },
    // ... other news items with fullContent
  ];

  // Find the full news item details
  const fullItem = newsItems.find(item => item.id === newsItem.id) || newsItem;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close button (X) in top right corner */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.newsContainer}>
            <Text style={styles.newsText}>{fullItem.title}</Text>
          </View>
          
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.captionContainer}>
              <Text style={styles.captionHeading}>{fullItem.heading}</Text>
              <Text style={styles.descriptionText}>
                {fullItem.description}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.fullContentText}>
                {fullItem.fullContent}
              </Text>
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '200',
  },
  newsContainer: {
    backgroundColor: '#4682B4',
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContainer: {
    maxHeight: '60%',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  captionContainer: {
    paddingVertical: 15,
    paddingTop: 25, // Added padding to prevent content from being hidden behind close icon
  },
  captionHeading: {
    fontSize: 20,
    color: '#ADD8E6',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    marginBottom: 15,
    fontWeight: '500',
  },
  fullContentText: {
    fontSize: 15,
    color: '#E0E0E0',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#4682B4',
    marginVertical: 15,
    opacity: 0.5,
  },
});

export default NewsDetailModal;