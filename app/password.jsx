import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react'; // Add this import for useState
import logo_s from '../assets/img/logo_s.png';
import captcha_icon from '../assets/img/captcha_icon.png';

const PasswordReset = () => {
    const router = useRouter();
    const [isHumanChecked, setIsHumanChecked] = useState(false);

    const handleBackToLogin = () => {
        router.back();
    };

    const handleNavigateToRegister = () => {
        router.push('/register'); // Add this navigation handler
    };

    const handleResetPassword = () => {
        router.push('/confirmation?type=password');
    };

    const toggleHumanCheck = () => {
        setIsHumanChecked(!isHumanChecked);
    };

    return (
        <View style={styles.container}>
            {/* Logo at top left */}
            <Image source={logo_s} style={styles.logo} />
            
            {/* Left-aligned title and subtitle */}
            <Text style={styles.title}>Lost your Password?</Text>
            <Text style={styles.subtitle}>
                Please provide below info to get a temporary password from your registered email.
            </Text>
            
            {/* Email/UserID Input Field */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Email or User ID"
                    placeholderTextColor="#999"
                />
            </View>
            
            {/* Human Checkbox and Captcha */}
            <View style={styles.humanContainer}>
                <Pressable 
                    style={[styles.checkboxContainer]}
                    onPress={toggleHumanCheck}
                >
                    <View style={[styles.checkbox, isHumanChecked && styles.checkedBox]}>
                        {isHumanChecked && <View style={styles.checkmark} />}
                    </View>
                    <Text style={styles.checkboxText}>I am Human</Text>
                </Pressable>
                <Image 
                    source={captcha_icon} 
                    style={[styles.captchaIcon, {marginRight: -35}]} 
                    resizeMode="contain"
                />
            </View>
            
            {/* Centered Reset Button */}
            <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleResetPassword}
            >
                <Text style={styles.resetButtonText}>Reset password</Text>
            </TouchableOpacity>
            
            {/* Footer Links below the button */}
            <View style={styles.footerContainer}>
                <TouchableOpacity onPress={handleBackToLogin}>
                    <Text style={styles.footerLink}>Back to Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNavigateToRegister}> 
                    <Text style={styles.footerLink}>New to ALGOGENE? Register Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PasswordReset;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'left',
    },
    subtitle: {
        color: '#aaa',
        textAlign: 'left',
        marginBottom: 30,
        fontSize: 16,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 25,
    },
    input: {
        backgroundColor: 'white',
        color: 'black',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    humanContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 25,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: 'black',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        width: 10,
        height: 20,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        backgroundColor: 'green',
        // transform: [{ rotate: '45deg' }], // Rotate to form a tick mark
    },
    checkmark: {
        width: 10,
        height: 10,
        backgroundColor: 'white',
    },
    checkboxText: {
        color: 'black',
        fontSize: 16,
    },
    captchaIcon: {
        width: 120,
        height: 40,
    },
    resetButton: {
        backgroundColor: '#87cefa',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 20,
        width: '60%',
        maxWidth: 300,
    },
    resetButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    footerContainer: {
        marginTop: 10,
    },
    footerLink: {
        color: '#aaa',
        marginBottom: 15,
        fontSize: 16,
        textAlign: 'left',
    },
});