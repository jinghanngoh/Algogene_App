// components/AppModal.jsx
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';

const AppModal = ({ visible, onClose, app }) => {
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

          {/* App Title */}
          <Text style={styles.appTitle}>{app.name}</Text>

          {/* User and Stars */}
          <View style={styles.userSection}>
            <Text style={styles.userName}>{app.userName}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={styles.star}>
                  {i <= app.rating ? '★' : '☆'}
                </Text>
              ))}
            </View>
          </View>

          {/* Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INTRODUCTION:</Text>
            <Text style={styles.sectionContent}>{app.introduction}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TECHNICAL IMPLEMENTATION:</Text>
            <Text style={styles.sectionContent}>{app.technicalImplementation}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REQUEST HEADERS:</Text>
            <Text style={styles.sectionContent}>{app.requestHeaders}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BODY:</Text>
            <Text style={styles.sectionContent}>{app.requestBody}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RESPONSES:</Text>
            <Text style={styles.sectionContent}>{app.responses}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BODY:</Text>
            <Text style={styles.sectionContent}>{app.responseBody}</Text>
          </View>

          {/* Pricing Information */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingText}>HKD {app.price} / mo</Text>
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
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20
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
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 18,
    color: '#FFD700',
    marginRight: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  pricingSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pricingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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

export default AppModal;