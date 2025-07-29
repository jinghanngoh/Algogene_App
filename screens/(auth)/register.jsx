// For new users to register and create a new account. Havent really tested this page and most of (auth)
import React, {useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import HCaptcha from '@hcaptcha/react-native-hcaptcha/Hcaptcha';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signup } from '../../services/auth/auth';
import logo_s from '../../assets/img/logo_s.png';
import register from '../../assets/img/register.png';
import captcha_icon from '../../assets/img/captcha_icon.png';

const Register = () => {
    const router = useRouter();
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isHumanChecked, setIsHumanChecked] = useState(false);
    const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [email, setEmail] = useState(''); 
    const [c_Name, setc_Name] = useState(''); 
    const [password, setPassword] = useState('');
    const captchaRef = useRef(null);
    const [error, setError] = useState('');

    const handleBackToLogin = () => {
        router.push('/login');
    };

    // const Account = () => {
    //     router.push('/confirmation?type=register');
    // };
    
    const handleCreateAccount = async () => {
        if (!email || !c_Name) {
          setError('Please fill in all required fields');
          Alert.alert('Missing Fields', 'Please fill in email and name');
          return;
        }
        if (!isTermsChecked) {
          setError('Please agree to the Terms');
          Alert.alert('Terms Required', 'Please agree to the Terms');
          return;
        }
        if (!isHumanChecked) {
          setError('Please verify you are human');
          Alert.alert('Verification Required', 'Please verify you are human');
          return;
        }
    
        setError(''); // Clear previous errors
    
        try {
            const result = await signup({ email, c_Name , captchaToken: isHumanChecked ? 'verified' : ''});
        //   const result = await signup({ username, email, c_Name , captchaToken: isHumanChecked ? 'verified' : ''});
    
          if (result.success) {
            Alert.alert(
              'Success', 
              'Account created! Please check your email for your login credentials.'
            );
            router.push('/confirmation?type=register');
          } else {
            setError(result.message);
            Alert.alert('Registration Failed', result.message);
          }
        } catch (error) {
          console.error('Registration error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
          setError(errorMessage);
          Alert.alert('Registration Failed', errorMessage);
        }
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            {/* <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Username"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    />
            </View> */}

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Name"
                    placeholderTextColor="#999"
                    value={c_Name}
                    onChangeText={setc_Name}
                    autoCapitalize="none"
                    />
            </View>
            
            <View style={styles.checkboxGroup}>
                <View style={[styles.checkboxContainer, { marginTop: 5 }]}>
                <Pressable onPress={toggleTermsCheck}>
                    <View style={[styles.termsCheckbox, isTermsChecked && styles.termsCheckedBox]}>
                    {isTermsChecked && <View style={styles.termsCheckmark} />}
                    </View>
                </Pressable>
                <Text style={styles.checkboxText}>
                    I agree to the <Text style={styles.underlineText}>Terms</Text>
                </Text>
                </View>

                <View style={styles.humanContainer}>
                    <View style={styles.humanCheckboxContainer}>
                        <Pressable onPress={toggleHumanCheck}>
                        <View style={[styles.humanCheckbox, isHumanChecked && styles.humanCheckedBox]}>
                            {isHumanChecked && <View style={styles.humanCheckmark} />}
                        </View>
                        </Pressable>
                        <Text style={styles.humanCheckboxText}>
                        {isHumanChecked ? 'Verified' : 'I am Human'}
                        </Text>
                    </View>
                    <Image
                        source={captcha_icon}
                        style={[styles.captchaIcon, { marginRight: -35 }]}
                        resizeMode="contain"
                    />
                </View>
            </View>
                    
            <TouchableOpacity
                style={[
                styles.createAccountButton,
                (!email || !c_Name || !isTermsChecked || !isHumanChecked) &&
                    styles.createAccountButtonDisabled,
                ]}
                onPress={handleCreateAccount}
                disabled={!email || !c_Name || !isTermsChecked || !isHumanChecked}
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
        backgroundColor: '#121212', 
    },

    humanCheckbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: 'white', 
    },
    humanCheckedBox: {
        backgroundColor: 'black', 
    },
    humanCheckmark: {
        width: 12,
        height: 12,
        backgroundColor: 'white', 
    },
    checkboxGroup: {
        marginVertical: 1, 
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 5, 
    },

    
});

export default Register;
