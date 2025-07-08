// BrokerApi.js
import { fetchBinanceSubAccount } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a 32-character session ID
const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).replace(/-/g, '').slice(0, 32);
    };

    export const configureBroker = async (brokerApiKey, brokerSecret, runMode = 'livetest') => {
    try {
        const sessionId = await AsyncStorage.getItem('sessionId');
        if (!sessionId) {
        const newSessionId = generateSessionId();
        await AsyncStorage.setItem('sessionId', newSessionId);
        console.log('Generated new session ID:', newSessionId);
        }
        return await fetchBinanceSubAccount(brokerApiKey, brokerSecret);
    } catch (error) {
        console.error('Error configuring broker:', error);
        throw error;
    }
    };