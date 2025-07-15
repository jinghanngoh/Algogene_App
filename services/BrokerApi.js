// BrokerApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api';

// Generate a 32-character session ID
const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).replace(/-/g, '').slice(0, 32);
    };

export const configureBroker = async (broker, brokerApiKey, brokerSecret, brokerPassphrase, runMode) => {
    try {
        const sessionId = await AsyncStorage.getItem('sessionId');
        if (!sessionId) {
            const newSessionId = generateSessionId();
            await AsyncStorage.setItem('sessionId', newSessionId);
            console.log('Generated new session ID:', newSessionId);
        }
        if (broker === 'binance'){
            return await fetchBinanceSubAccount(brokerApiKey, brokerSecret);
        } else if (broker === 'kucoin') {
            if (!brokerPassphrase) {
                throw new Error('KuCoin requires a passphrase');
              }
              return await fetchKucoinSubAccount(brokerApiKey, brokerSecret, brokerPassphrase, runMode);
            } else {
              throw new Error('Unsupported broker');
            }
        } catch (error) {
            console.error('Error configuring broker:', error);
            throw error;
        }
};

export const fetchBinanceSubAccount = async (brokerApiKey, brokerSecret) => {
    try {
        const payload = {
            api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
            user: 'AGBOT1',
            c_Email: 'thegohrilla@gmail.com',
            broker: 'binance',
            runmode: 'livetest',
            broker_api: brokerApiKey,
            broker_pwd: brokerSecret,
        };
        console.log('Sending Binance payload:', payload); 
        const response = await API.post('/rest/v1/config', payload);
        console.log('Binance API Response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching Binance sub-account:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchKucoinSubAccount = async (brokerApiKey, brokerSecret, brokerPassphrase) => { 
    try { 
        const payload = {
            api_key: '13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff',
            user: 'AGBOT1',
            c_Email: 'thegohrilla@gmail.com',
            broker: 'kucoin',
            runmode: 'livetrade', // runmode: runMode,
            broker_api: brokerApiKey,
            broker_pwd: brokerSecret,
            broker_passphrase: brokerPassphrase,
        };
        console.log('Sending Kucoin payload:', payload); 
        const response = await API.post('/rest/v1/config', payload);
        console.log('Kucoin API Response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching Kucoin sub-account:', error.response?.data || error.message);
        throw error;
    }
}