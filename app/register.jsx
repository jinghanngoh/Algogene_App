import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import logo_s from '../assets/img/logo_s.png';
import register from '../assets/img/register.png';
import captcha_icon from '../assets/img/captcha_icon.png';

const Register = () => {
    const router = useRouter();
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isHumanChecked, setIsHumanChecked] = useState(false);

    const handleBackToLogin = () => {
        router.back();
    };

    const handleCreateAccount = () => {
        router.push('/confirmation?type=register');
    };

    const toggleTermsCheck = () => {
        setIsTermsChecked(!isTermsChecked);
    };

    const toggleHumanCheck = () => {
        setIsHumanChecked(!isHumanChecked);
    };

    return (
        <View style={styles.container}>
            <Image source={logo_s} style={styles.logo} />
            
            <View style={styles.imageContainer}>
                <Image source={register} style={styles.img} />
            </View>

            <Text style={styles.subtitle}>
                New to ALGOGENE?{"\n"}Simply provide your email to get an initial password
            </Text>
            
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Name"
                    placeholderTextColor="#999"
                />
            </View>
            
            <View style={styles.checkboxGroup}>
                {/* Terms Checkbox - moved closer to name input by reducing marginTop */}
                <View style={[styles.checkboxContainer, { marginTop: 5 }]}>
                    <Pressable onPress={toggleTermsCheck}>
                        {/* White outline checkbox */}
                        <View style={[styles.termsCheckbox, isTermsChecked && styles.termsCheckedBox]}>
                            {isTermsChecked && <View style={styles.termsCheckmark} />}
                        </View>
                    </Pressable>
                    <Text style={styles.checkboxText}>
                        I agree to the <Text style={styles.underlineText}>Terms</Text>
                    </Text>
                </View>

                {/* Human Checkbox */}
                <View style={styles.humanContainer}>
                    <View style={styles.humanCheckboxContainer}>
                        <Pressable onPress={toggleHumanCheck}>
                            {/* Black outline checkbox */}
                            <View style={[styles.humanCheckbox, isHumanChecked && styles.humanCheckedBox]}>
                                {isHumanChecked && <View style={styles.humanCheckmark} />}
                            </View>
                        </Pressable>
                        <Text style={styles.humanCheckboxText}>I am Human</Text>
                    </View>
                    <Image
                        source={captcha_icon}
                        style={[styles.captchaIcon, { marginRight: -35 }]}
                        resizeMode="contain"
                    />
                </View>
            </View>
            
            <TouchableOpacity 
                style={styles.createAccountButton}
                onPress={handleCreateAccount}
            >
                <Text style={styles.createAccountButtonText}>Create account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.footerLink}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'left',
    },
    subtitle: {
        color: 'white',
        textAlign: 'left',
        marginBottom: 20,
        fontSize: 16,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        color: 'white',
        marginBottom: 8,
        fontSize: 16,
    },
    input: {
        backgroundColor: 'white',
        color: 'black',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    checkboxGroup: {
        marginVertical: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    checkedBox: {
        backgroundColor: 'white',
    },
    checkmark: {
        width: 12,
        height: 12,
        backgroundColor: '#121212',
    },
    checkboxText: {
        color: 'white',
        fontSize: 16,
    },
    underlineText: {
        textDecorationLine: 'underline'
    },
    createAccountButton: {
        backgroundColor: '#87cefa',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 20,
        width: '60%',
        maxWidth: 300,
    },
    createAccountButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    footerLink: {
        color: '#999',
        fontSize: 16,
        marginTop: 10,
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: -20,
    },
    img: {
        width: 200,
        height: 100,
        resizeMode: 'contain',
    },
    humanContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 30
    },
    humanCheckboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    humanCheckboxText: {
        color: 'black',
        fontSize: 16,
    },
    captchaIcon: {
        width: 120,
        height: 40,
    },


    termsCheckbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 'white',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    termsCheckedBox: {
        backgroundColor: 'white',
    },
    termsCheckmark: {
        width: 12,
        height: 12,
        backgroundColor: '#121212', // Dark checkmark for white box
    },

    // Human Checkbox - Black outline
    humanCheckbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: 'white', // White background for black outline
    },
    humanCheckedBox: {
        backgroundColor: 'black', // Black background when checked
    },
    humanCheckmark: {
        width: 12,
        height: 12,
        backgroundColor: 'white', // White checkmark for black box
    },

    // Adjusted checkbox container spacing
    checkboxGroup: {
        marginVertical: 1, // Reduced from 20 to bring checkboxes closer
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 5, // Added to reduce space from name input
    },

    
});

export default Register;
