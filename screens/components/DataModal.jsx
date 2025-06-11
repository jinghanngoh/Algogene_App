import React from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity } from 'react-native';

const DataModal = ({ visible, onClose, data }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Data Title */}
          <Text style={styles.dataTitle}>{data.name}</Text>

          {/* Provider and Stars */}
          <View style={styles.providerSection}>
            <Text style={styles.providerName}>{data.userName}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={styles.star}>
                  {i <= data.rating ? '★' : '☆'}
                </Text>
              ))}
            </View>
          </View>

          {/* Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INTRODUCTION:</Text>
            <Text style={styles.sectionContent}>{data.introduction}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPTION:</Text>
            <Text style={styles.sectionContent}>{data.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TECHNICAL IMPLEMENTATION:</Text>
            <Text style={styles.sectionContent}>{data.technicalImplementation}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REQUEST QUERY PARAMETERS:</Text>
            <Text style={styles.sectionContent}>{data.requestParameters}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RESPONSES:</Text>
            <Text style={styles.sectionContent}>{data.responses}</Text>
          </View>

          {/* Pricing Information */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingText}>HKD {data.price} / mo</Text>
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
  dataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    // color: '#2196F3',
    color: 'black',
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  providerName: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    color: '#FFD700',
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // color: '#2196F3',
    color: 'black',
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  pricingSection: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  pricingText: {
    fontSize: 20,
    fontWeight: 'bold',
    // color: '#4CAF50',
    color: 'black',
  },
  subscribeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DataModal;