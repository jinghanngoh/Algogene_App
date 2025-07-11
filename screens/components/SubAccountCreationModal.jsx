import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSubAccounts } from '../../context/SubAccountsContext';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import binance_icon from '../../assets/img/binance_icon.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

const SubAccountCreation = ({ visible, onClose }) => {
  const { subAccounts, setSubAccounts, saveSubAccounts } = useSubAccounts();
  const navigation = useNavigation();
  const router = useRouter(); 
  const [id, setId] = useState('');
  const [broker, setBroker] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [currency, setCurrency] = useState('');
  const [error, setError] = useState('');
  const [brokerPickerVisible, setBrokerPickerVisible] = useState(false);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

  useEffect(() => {
    const checkForSelectedAlgorithm = async () => {
      try {
        const selectedAlgoJson = await AsyncStorage.getItem('selectedAlgorithm');
        if (selectedAlgoJson) {
          const selectedAlgo = JSON.parse(selectedAlgoJson);
          setAlgorithm(selectedAlgo.name || 'Selected Algorithm');
          // Clear the stored algorithm
          await AsyncStorage.removeItem('selectedAlgorithm');
        }
      } catch (error) {
        console.error('Error retrieving selected algorithm:', error);
      }
    };
    
    // Check when the screen is focused
    checkForSelectedAlgorithm();
    
  }, []);


  const handleCreate = async () => {
    if (!id || id.trim() === '') {
      setError('Sub-account ID is required');
      return;
    }
    if (subAccounts.some(account => account.id === id)) {
      setError('Sub-account ID already exists');
      return;
    }
    if (!broker) {
      setError('Broker is required');
      return;
    }
    if (!algorithm) {
      setError('Algorithm is required');
      return;
    }
    if (!currency) {
      setError('Currency is required');
      return;
    }

    const newAccount = {
      id,
      broker,
      algorithm,
      currency,
      leverage: '5.0',
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('.')[0],
      runningScript: algorithm,
      availableBalance: '1000000.0',
      cashBalance: '1000000.0',
      realizedPL: '0.0',
      unrealizedPL: '0.0',
      marginUsed: '0.0',
      status: 'INACTIVE',
      brokerConnected: false,
      brokerApiKey: '',
      brokerSecret: '',
    };

    const updatedAccounts = [...subAccounts, newAccount];
    setSubAccounts(updatedAccounts);
    await saveSubAccounts(updatedAccounts);
    setId('');
    setBroker('');
    setAlgorithm('');
    setCurrency('');
    setError('');
    setBrokerPickerVisible(false);
    setCurrencyPickerVisible(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Sub-Account</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Sub-Account ID</Text>
          <TextInput
            style={styles.input}
            value={id}
            onChangeText={setId}
            placeholder="Enter unique ID (e.g., #1001)"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Broker</Text>
          <TouchableOpacity
            style={styles.brokerBar}
            onPress={() => setBrokerPickerVisible(!brokerPickerVisible)}
          >
            {broker === 'Binance' && (
              <Image source={binance_icon} style={styles.brokerLogo} />
            )}
            <Text style={[
              styles.brokerText, 
              !broker && { marginLeft: broker ? undefined : 10 }
            ]}>
              {broker || 'Select Broker'}
            </Text>
            <Ionicons
              name={brokerPickerVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="white"
              style={styles.chevron}
            />
          </TouchableOpacity>
          {brokerPickerVisible && (
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setBroker('Binance');
                setBrokerPickerVisible(false);
              }}
            >
              <Image source={binance_icon} style={styles.pickerLogo} />
              <Text style={styles.pickerText}>Binance</Text>
            </TouchableOpacity>
          </View>
        )}

          <Text style={styles.label}>Algorithm</Text>
          <Link href="(tabs)/marketplace" asChild>
            <TouchableOpacity
                style={styles.brokerBar}
                onPress={async () => {
                // Still store the state before navigation
                try {
                    await AsyncStorage.setItem('pendingSubAccountData', JSON.stringify({
                    id,
                    broker,
                    currency,
                    isCreatingSubAccount: true
                    }));
                    console.log("GGG");
                } catch (error) {
                    console.error('Error storing sub account state:', error);
                }
                }}
            >
                <Text style={styles.brokerText}>{algorithm || 'Select Algorithm'}</Text>
                <Ionicons
                name="chevron-forward"
                size={20}
                color="white"
                style={styles.chevron}
                />
            </TouchableOpacity>
         </Link>

          <Text style={styles.label}>Currency</Text>
          <TouchableOpacity
            style={styles.brokerBar}
            onPress={() => setCurrencyPickerVisible(!currencyPickerVisible)}
          >
            <Text style={styles.brokerText}>{currency || 'Select Currency'}</Text>
            <Ionicons
              name={currencyPickerVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="white"
              style={styles.chevron}
            />
          </TouchableOpacity>
          {currencyPickerVisible && (
            <View style={styles.pickerContainer}>
              {['USD', 'EUR'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerItem}
                  onPress={() => {
                    setCurrency(option);
                    setCurrencyPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

  
const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        minHeight: 500, 
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 20,
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    label: {
      fontSize: 16,
      color: 'white',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#333',
      color: 'white',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      fontSize: 14,
    },
    brokerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#333',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
    },
    brokerLogo: {
      width: 40,
      height: 40,
      marginRight: 10,
    },
    brokerText: {
      flex: 1,
      color: 'white',
      fontSize: 14,
    },
    chevron: {
      marginLeft: 10,
    },
    pickerContainer: {
      backgroundColor: '#333',
      borderRadius: 8,
      marginBottom: 15,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    pickerLogo: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    pickerText: {
      color: 'white',
      fontSize: 14,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: '#D32F2F',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      marginRight: 10,
    },
    createButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
    },
    buttonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    errorText: {
      color: '#D32F2F',
      fontSize: 14,
      marginBottom: 15,
      textAlign: 'center',
    },
  });
  
  export default SubAccountCreation;