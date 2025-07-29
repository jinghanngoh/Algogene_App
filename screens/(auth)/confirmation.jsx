// Confirmation screen for when user changes password, create account etc
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import logo_s from '../../assets/img/logo_s.png';

const Confirmation = () => {
    const router = useRouter();
    const { type } = useLocalSearchParams();

    const handleBackToLogin = () => {
        router.replace('/login');
    };

    const getMessage = () => {
        switch (type) {
            case 'password':
                return {
                    title: 'Your password has',
                    subtitle: 'been changed',
                    message: 'Please login with your new password'
                };
            case 'register':
                return {
                    title: 'Your account has',
                    subtitle: 'been created',
                    message: 'Please login with your account'
                };
            default:
                return {
                    title: 'Action completed',
                    subtitle: 'successfully',
                    message: 'Please continue to login'
                };
        }
    };

    const { title, subtitle, message } = getMessage();

    return (
        <View style={styles.container}>
            <Image source={logo_s} style={styles.logo} />
            
            <View style={styles.messageContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            
            <Text style={styles.messageText}>{message}</Text>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={handleBackToLogin}
            >
                <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Confirmation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    messageText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});