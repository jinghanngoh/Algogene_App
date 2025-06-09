import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import placeholder from '../../assets/img/placeholder.png';

const Marketplace = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Trading System'); 
  const [showTradingSystemBoxes, setShowTradingSystemBoxes] = useState(true);

  const buttons = [
    { label: 'Trading System' },
    { label: 'App Collection' },
    { label: 'Data Marketplace' },
  ];

  const tradingSystemTabs = [
    { label: 'Tab 1' },
    { label: 'Tab 2' },
    { label: 'Tab 3' },
    { label: 'Tab 4' },
    { label: 'Tab 5' },
    { label: 'Tab 6' },
  ];

  const handleButtonPress = (button) => {
    setActiveTab(button.label);
    setShowTradingSystemBoxes(button.label === 'Trading System');
    console.log(`Button pressed: ${button.label}`);
  };

  const renderContentBoxes = () => {
    const isTradingSystem = activeTab === 'Trading System';
    
    return (
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {tradingSystemTabs.map((tab, index) => (
          <View key={index} style={styles.contentBox}>
            {/* Category label at top right */}
            <View style={styles.categoryLabel}>
              <Text style={styles.categoryLabelText}>Category</Text>
            </View>
            
            {/* User info section */}
            <View style={styles.userContainer}>
              <Image source={placeholder} style={styles.userIcon} />
              <Text style={styles.userName}>User Name</Text>
            </View>
            
            {/* Black line divider */}
            <View style={styles.divider} />
            
            {/* Title section */}
            <Text style={styles.titleText}>Title</Text>
            
            {/* Content section - changes based on active tab */}
            {isTradingSystem ? (
              <View style={styles.graphPlaceholder}>
                <Text style={styles.graphLabel}>Graph</Text>
              </View>
            ) : (
              <Text style={styles.descriptionText}>
                Brief description of the {activeTab.toLowerCase()} in this content.
              </Text>
            )}
            
            {/* Read more button */}
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read more</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              {
                backgroundColor: activeTab === button.label ? 'white' : 'lightgray',
                borderColor: activeTab === button.label ? 'lightblue' : 'lightgray',
                borderWidth: activeTab === button.label ? 3 : 0,
                width: Dimensions.get('window').width / 3 - 25,
              }
            ]}
            onPress={() => handleButtonPress(button)}
          >
            <Text style={{ color: 'black', flexWrap: 'wrap', textAlign: 'center' }}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer to maintain black space */}
      <View style={styles.spacer} />

      {/* Content Boxes */}
      {renderContentBoxes()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingHorizontal: 10,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    marginHorizontal: 10, 
  },
  spacer: {
    height: 20, // Maintains black space below buttons
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20, // Added bottom padding
  },
  contentBox: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  userIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  userName: {
    color: 'black',
    fontSize: 16,
  },
  categoryLabel: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#4FC3F7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  categoryLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 10,
  },
  titleText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  graphPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 150,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  graphLabel: {
    color: 'black',
  },
  descriptionText: {
    color: 'black',
    marginBottom: 15,
    lineHeight: 20,
  },
  readMoreButton: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  readMoreText: {
    color: 'white',
  },
});

export default Marketplace;