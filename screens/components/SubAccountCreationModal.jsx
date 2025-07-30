// NEED TO CHECK WHETHER SOLVING THE SUBSCRIPTION BUG AFFECTS THIS. Make sure after subscribe that the prev lines are still there

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, Alert} from 'react-native';
import { useSubAccounts } from '../../context/SubAccountsContext';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import binance_icon from '../../assets/img/binance_icon.png';
import kucoin_icon from '../../assets/img/kucoin_icon.png';
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
  const [algorithmSelected, setAlgorithmSelected] = useState(false);
  const [isInSelectionFlow, setIsInSelectionFlow] = useState(false); // Add a flag to track if the user is in the middle of a flow
 
  const saveFormState = async () => {
    if (isInSelectionFlow) {
      try {
        await AsyncStorage.setItem('pendingSubAccountData', JSON.stringify({
          id,
          broker,
          algorithm,
          currency,
          algorithmSelected,
          brokerManuallySelected: broker !== '',
          isInSelectionFlow: true
        }));
      } catch (error) {
        console.error('Error saving form state:', error);
      }
    }
  };

  // Reset all form fields
  const resetForm = () => {
    setId('');
    setBroker('');
    setAlgorithm('');
    setCurrency('');
    setAlgorithmSelected(false);
    setIsInSelectionFlow(false);
  };

  useEffect(() => {
    if (visible) {
      const loadFormState = async () => {
        try {
          const formStateJson = await AsyncStorage.getItem('pendingSubAccountData');
          console.log('Loaded form state:', formStateJson);
          
          if (formStateJson) {
            const formState = JSON.parse(formStateJson);
            console.log('Parsed form state:', formState);
            
            // Only restore state if we're in the middle of a selection flow
            if (formState.isInSelectionFlow) {
              setId(formState.id || '');
              setBroker(formState.broker || '');
              setAlgorithm(formState.algorithm || '');
              setCurrency(formState.currency || '');
              setAlgorithmSelected(!!formState.algorithm);
              setIsInSelectionFlow(true);
            } else {
              // If not in a flow, start fresh
              resetForm();
            }
          } else {
            // No stored data, reset all fields
            resetForm();
          }
        } catch (error) {
          console.error('Error loading form state:', error);
          resetForm();
        }
      };
      
      loadFormState();
    } else {
      // When modal becomes invisible and not in a selection flow,
      // clear the saved state to ensure fresh start next time
      if (!isInSelectionFlow) {
        AsyncStorage.removeItem('pendingSubAccountData');
      }
    }
  }, [visible]);

  // useEffect(() => {
  //   if (visible) {
  //     const loadFormState = async () => {
  //       try {
  //         const formStateJson = await AsyncStorage.getItem('pendingSubAccountData');
  //         if (formStateJson) {
  //           const formState = JSON.parse(formStateJson);
  //           setId(formState.id || '');
  //           setBroker(formState.broker || ''); // Make sure this is setting to empty string as fallback
  //           setAlgorithm(formState.algorithm || '');
  //           setCurrency(formState.currency || '');
  //           setAlgorithmSelected(!!formState.algorithm);

  //           if (formState.hasOwnProperty('broker') && formState.broker && 
  //           (formState.brokerManuallySelected === true)) {
  //             setBroker(formState.broker);
  //           } else {
  //             setBroker('');
  //           }

  //         } else {
  //           // Reset all fields when no stored data is found
  //           setBroker(''); // Explicitly reset to empty 
  //           setAlgorithmSelected(false);
  //         }
  //       } catch (error) {
  //         console.error('Error loading form state:', error);
  //         // Reset fields on error
  //         setId('');
  //         setBroker(''); // Explicitly reset to empty
  //         setAlgorithm('');
  //         setCurrency('');
  //         setAlgorithmSelected(false);
  //       }
  //     };
      
  //     loadFormState();
  //   }
  // }, [visible]);


    // const handleBrokerSelect = async () => {
    //   // Save current form state before navigating
    //   await saveFormState();
      
    //   // Navigate to marketplace with broker selection flag
    //   router.push({
    //     pathname: '/(tabs)/marketplace',
    //     params: { selectBrokerForSubAccount: 'true' }
    //   });
    // };
    const handleBrokerSelect = async () => {
      // Mark that we're starting a selection flow
      setIsInSelectionFlow(true);
      // Save current form state before navigating
      await saveFormState();
      
      // Navigate to marketplace with broker selection flag
      router.push({
        pathname: '/(tabs)/marketplace',
        params: { selectBrokerForSubAccount: 'true' }
      });
    };

    // const handleAlgorithmSelect = async () => {
    //   // Save current form state before navigating
    //   await saveFormState();
      
    //   try {
    //     // First, close the modal to prevent navigation issues
    //     onClose();
        
    //     // Short delay to ensure modal is closed before navigation
    //     setTimeout(() => {
    //       try {
    //         if (Platform.OS === 'ios') {
    //           // For iOS, use the direct navigation API with params
    //           router.push({
    //             pathname: '/marketplace',
    //             params: { selectForSubAccount: 'true' }
    //           });
    //         } else {
    //           // For Android, use the existing router method
    //           router.push({
    //             pathname: '/(tabs)/marketplace',
    //             params: { selectForSubAccount: 'true' }
    //           });
    //         }
    //       } catch (error) {
    //         console.error('Delayed navigation error:', error);
    //         // Final fallback with params
    //         router.navigate('marketplace', { selectForSubAccount: 'true' });
    //       }
    //     }, 300); // 300ms delay
    //   } catch (error) {
    //     console.error('Navigation setup error:', error);
    //   }
    // };
    const handleAlgorithmSelect = async () => {
      // Mark that we're starting a selection flow
      setIsInSelectionFlow(true);
      // Save current form state before navigating
      await saveFormState();
      
      try {
        // First, close the modal to prevent navigation issues
        onClose();
        
        // Short delay to ensure modal is closed before navigation
        setTimeout(() => {
          try {
            if (Platform.OS === 'ios') {
              // For iOS, use the direct navigation API with params
              router.push({
                pathname: '/marketplace',
                params: { selectForSubAccount: 'true' }
              });
            } else {
              // For Android, use the existing router method
              router.push({
                pathname: '/(tabs)/marketplace',
                params: { selectForSubAccount: 'true' }
              });
            }
          } catch (error) {
            console.error('Delayed navigation error:', error);
            // Final fallback with params
            router.navigate('marketplace', { selectForSubAccount: 'true' });
          }
        }, 300); // 300ms delay
      } catch (error) {
        console.error('Navigation setup error:', error);
      }
    };
    
    // Handle modal close with cleanup
    // const handleClose = () => {
    //   // Clear stored form data when explicitly closing
    //   AsyncStorage.removeItem('pendingSubAccountData');
    //   // Reset all form fields
    //   setId('');
    //   setBroker('');
    //   setAlgorithm('');
    //   setCurrency('');
    //   setAlgorithmSelected(false);
    //   onClose();
    // };
    const handleClose = () => {
      // Clear stored form data when explicitly closing
      AsyncStorage.removeItem('pendingSubAccountData');
      // Reset all form fields
      resetForm();
      onClose();
    };

  const handleCreate = async () => {
    // Validation logic
    if (!id || !broker || !algorithm || !currency) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    // Create new sub-account
    const newAccount = {
      id,
      broker,
      algorithm,
      currency,
      status: 'Inactive',
      createdAt: new Date().toISOString()
    };
    
    const updatedAccounts = [...subAccounts, newAccount];
    setSubAccounts(updatedAccounts);
    await saveSubAccounts(updatedAccounts);
    
    // Clear stored form data
    AsyncStorage.removeItem('pendingSubAccountData');
    
    // Close modal
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      // onRequestClose={onClose}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create Sub-Account</Text>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.label}>ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter ID"
            placeholderTextColor="#999"
            value={id}
            onChangeText={setId}
          />

          <Text style={styles.label}>Broker</Text>
          <TouchableOpacity
            style={styles.brokerBar}
            onPress={() => setBrokerPickerVisible(!brokerPickerVisible)}
          >
            {broker === 'Binance' && (
              <Image source={binance_icon} style={styles.brokerLogo} />
            )}
            {broker === 'Kucoin' && (
              <Image source={kucoin_icon} style={styles.brokerLogo} />
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

              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  setBroker('Kucoin');
                  setBrokerPickerVisible(false);
                }}
              >
                <Image source={kucoin_icon} style={styles.pickerLogo} />
                <Text style={styles.pickerText}>Kucoin</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Algorithm</Text>
            {algorithmSelected ? (
              <View style={[styles.brokerBar, { backgroundColor: '#444' }]}>
                <Text style={styles.brokerText}>{algorithm}</Text>
                {/* <TouchableOpacity onPress={() => {
                  setAlgorithm('');
                  setAlgorithmSelected(false);
                }}>
                  <Ionicons name="close-circle" size={20} color="white" />
                </TouchableOpacity> */}
              </View>
            ) : (
            <TouchableOpacity
              style={styles.brokerBar}
              onPress={handleAlgorithmSelect}
            >
              <Text style={styles.brokerText}>Select Algorithm</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="white"
                style={styles.chevron}
              />
            </TouchableOpacity>
          )}

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