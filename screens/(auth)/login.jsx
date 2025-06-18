// import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Pressable, BackHandler, Alert} from 'react-native';
// import { useRouter } from 'expo-router';
// import React, { useState , useRef, useEffect, useCallback} from 'react';
// import HCaptcha from '@hcaptcha/react-native-hcaptcha';
// import { login } from '../../services/auth/auth';
// import loginImg from '../../assets/img/login.png';
// import logo_s from '../../assets/img/logo_s.png';
// import google_icon from '../../assets/img/google_icon.png';
// import facebook_icon from '../../assets/img/facebook_icon.png';
// import linkedin_icon from '../../assets/img/linkedin_icon.png';
// import github_icon from '../../assets/img/github_icon.png';
// import captcha_icon from '../../assets/img/captcha_icon.png';

// const Login = () => {
//     const router = useRouter();
//     const [isHumanVerified , setIsHumanVerified] = useState(false);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
//     const [captchaToken, setCaptchaToken] = useState('');
//     const captchaRef = useRef(null);

//     useEffect(() => {
//         console.log('Captcha ref initialized:', captchaRef.current);
//         // Optional: Manually handle back press to dismiss if needed
//         const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//             if (isCaptchaLoading) {
//                 setIsCaptchaLoading(false);
//                 setIsHumanVerified(false);
//                 return true; // Prevent default back behavior
//             }
//             return false;
//         });
//         return () => backHandler.remove(); // Clean up
//     }, [isCaptchaLoading]);

//     const handleHumanCheckPress = useCallback(() => {
//         if (!isHumanVerified && !isCaptchaLoading) {
//             setIsCaptchaLoading(true);
//             if (captchaRef.current) {
//                 try {
//                     captchaRef.current.show();
//                     const timeoutId = setTimeout(() => {
//                         if (isCaptchaLoading) {
//                             console.warn('Captcha timeout, resetting loading state');
//                             setIsHumanVerified(false);
//                             setIsCaptchaLoading(false);
//                             if (captchaRef.current.hide) {
//                                 captchaRef.current.hide();
//                             }
//                         }
//                     }, 5000);
//                     return () => clearTimeout(timeoutId);
//                 } catch (error) {
//                     console.error('Error showing captcha:', error);
//                     setIsCaptchaLoading(false);
//                 }
//             } else {
//                 console.error('Captcha ref is null');
//                 setIsCaptchaLoading(false);
//             }
//         } else if (isHumanVerified) {
//             setIsHumanVerified(false);
//         }
//     }, [isHumanVerified, isCaptchaLoading]);
    
//     // const toggleHumanCheck = () => {
//     //     setIsHumanVerified(!isHumanVerified);
//     // }

//     const isValidEmail = (email) => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//       };

//     const handleLoginPress = async () => {
//         if (!email || !password) {
//             Alert.alert('Error','Please enter both email and password');
//             return;
//         }
//         if (!isValidEmail(email)) {
//             Alert.alert('Error', 'Please enter a valid email address');
//             return;
//         }
//         if (!isHumanVerified) {
//             Alert.alert('Error','Please complete human verification');
//             return;
//         }
//         // router.push('/(tabs)/home');
//         try {
//             const result = await login({
//                 email,
//                 password,
//                 captchaToken: isHumanVerified ? captchaToken : '' // Use actual token if available
//             });
//             if (result.success) {
//                 // Navigate to home on successful login
//                 router.replace('/(tabs)/home');
//             } else {
//                 Alert.alert('Login Failed', result.message);
//             }
//         } catch (error) {
//             console.error('Login error:', error);
//             Alert.alert('Error', error.message || 'Login failed. Please try again.');
//         }
//     }
//     const onMessage = (event) => {
//         const message = event.nativeEvent.data;
//         console.log('Received hCaptcha message (raw):', JSON.stringify(message), 'Event:', JSON.stringify(event.nativeEvent));
//         console.log('Current state - isCaptchaLoading:', isCaptchaLoading, 'isHumanVerified:', isHumanVerified); // Debug state
//         if (typeof message === 'string' && message.startsWith('P1_')) {
//             console.log('Captcha verified with token:', message);
//             setCaptchaToken(message); 
//             setIsHumanVerified(true);
//             setIsCaptchaLoading(false);
//             // Force UI update
//             if (captchaRef.current && captchaRef.current.hide) {
//                 captchaRef.current.hide();
//             }
//         } else if (message === 'error' || message === 'onError') {
//             Alert.alert('Error', 'Verification failed. Please try again.');
//             setIsCaptchaLoading(false);
//         } else if (message === 'expired' || message === 'onExpire') {
//             setIsHumanVerified(false);
//             setIsCaptchaLoading(false);
//         } else if (message === 'open') {
//             console.log('Captcha modal opened');
//         } else {
//             console.log('Unknown hCaptcha message:', message);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <HCaptcha
//                 ref={captchaRef}
//                 siteKey = "e3889ef2-1348-45b3-bceb-b03dbfffcede"
//                 onMessage={onMessage}
//                 size="invisible"
//                 languageCode="en"
//                 hasBackdrop = {false}
//             />

//             <View style={styles.imageContainer}>
//                 <Image source={logo_s} style={styles.img} />
//             </View>

//             <View style={styles.loginContainer}>
//                 <Image source={loginImg} style={styles.img} />
//             </View>

//             <View style={styles.inputContainer}>
//                 <Text style={styles.inputLabel}>User:</Text>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Enter Your Email or UserID"
//                     placeholderTextColor="#999"
//                     value={email}
//                     onChangeText={setEmail}
//                     autoCapitalize="none"
//                     keyboardType="email-address"
//                 />
//             </View>

//             <View style={styles.inputContainer}>
//                 <Text style={styles.inputLabel}>Password:</Text>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Enter Your Password"
//                     placeholderTextColor="#999"
//                     secureTextEntry={true}
//                     value={password}
//                     onChangeText={setPassword}
//                 />
//             </View>

//             <View style={styles.humanLoginContainer}>
//                 <View style={styles.humanContainer}>
//                     <Pressable
//                         style={styles.humanCheckboxContainer}
//                         onPress={handleHumanCheckPress}
//                         accessibilityRole="checkbox"
//                         accessibilityState={{ checked: isHumanVerified }}
//                         disabled={isCaptchaLoading}
//                     >
//                         <View style={[styles.checkbox, isHumanVerified && styles.checkedBox]}>
//                             {isHumanVerified && <View style={styles.checkmark} />}
//                         </View>
//                         <Text style={styles.humanCheckboxText}>
//                             {isHumanVerified ? 'Verified' : isCaptchaLoading ? 'Verifying...' : 'I am Human'}
//                         </Text>
//                     </Pressable>
//                     <Image
//                         source={captcha_icon}
//                         style={styles.captchaIcon}
//                         resizeMode="contain"
//                     />
//                 </View>

//                 <TouchableOpacity
//                     style={[
//                         styles.loginButton,
//                         (!email || !password || !isHumanVerified) && styles.loginButtonDisabled
//                     ]}
//                     onPress={handleLoginPress}
//                     disabled={!email || !password || !isHumanVerified || isCaptchaLoading}
//                 >
//                     <Text style={styles.loginButtonText}>Login</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* May not need this */}
//             {isCaptchaLoading && (
//                 <TouchableOpacity
//                     style={styles.resetButton}
//                     onPress={() => {
//                         setIsCaptchaLoading(false);
//                         setIsHumanVerified(false);
//                     }}
//                 >
//                     <Text style={styles.resetButtonText}>Reset Captcha</Text>
//                 </TouchableOpacity>
//             )}

//             <View style={styles.dividerContainer}>
//                 <View style={styles.dividerLine} />
//                 <Text style={styles.dividerText}>OR</Text>
//                 <View style={styles.dividerLine} />
//             </View>

//             <View style={styles.socialContainer}>
//                 <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
//                     <Image source={google_icon} style={styles.socialIcon} />
//                     <Text style={styles.socialButtonText}>Sign in with Google</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
//                     <Image source={facebook_icon} style={styles.socialIcon} />
//                     <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.socialButton, styles.githubButton]}>
//                     <Image source={github_icon} style={styles.socialIcon} />
//                     <Text style={styles.socialButtonText}>Sign in with GitHub</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.socialButton, styles.linkedinButton]}>
//                     <Image source={linkedin_icon} style={styles.socialIcon} />
//                     <Text style={styles.socialButtonText}>Sign in with LinkedIn</Text>
//                 </TouchableOpacity>
//             </View>

//             <View style={styles.footerContainer}>
//                 <TouchableOpacity onPress={() => router.push('/password')}>
//                     <Text style={styles.footerLink}>Forgot Password</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => router.push('/register')}>
//                     <Text style={styles.footerLink}>New to ALGOGENE? Register Now</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// export default Login;

import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Pressable, Alert, Platform, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-native-hcaptcha';
import { login } from '../../services/auth/auth';
import loginImg from '../../assets/img/login.png';
import logo_s from '../../assets/img/logo_s.png';
import google_icon from '../../assets/img/google_icon.png';
import facebook_icon from '../../assets/img/facebook_icon.png';
import linkedin_icon from '../../assets/img/linkedin_icon.png';
import github_icon from '../../assets/img/github_icon.png';
import captcha_icon from '../../assets/img/captcha_icon.png';

const Login = () => {
  const router = useRouter();
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);

  useEffect(() => {
    console.log('Platform:', Platform.OS);
    console.log('BackHandler available:', !!BackHandler);
    console.log('Captcha ref initialized:', captchaRef.current);
    if (Platform.OS === 'android' && BackHandler) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isCaptchaLoading) {
          setIsCaptchaLoading(false);
          setIsHumanVerified(false);
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [isCaptchaLoading]);

  const handleHumanCheckPress = useCallback(() => {
    if (!isHumanVerified && !isCaptchaLoading) {
      setIsCaptchaLoading(true);
      if (captchaRef.current) {
        try {
          captchaRef.current.show();
          const timeoutId = setTimeout(() => {
            if (isCaptchaLoading) {
              console.warn('Captcha timeout, resetting loading state');
              setIsHumanVerified(false);
              setIsCaptchaLoading(false);
              if (captchaRef.current.hide) {
                captchaRef.current.hide();
              }
            }
          }, 5000);
          return () => clearTimeout(timeoutId);
        } catch (error) {
          console.error('Error showing captcha:', error);
          setIsCaptchaLoading(false);
        }
      } else {
        console.error('Captcha ref is null');
        setIsCaptchaLoading(false);
      }
    } else if (isHumanVerified) {
      setIsHumanVerified(false);
    }
  }, [isHumanVerified, isCaptchaLoading]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!isHumanVerified) {
      Alert.alert('Error', 'Please complete human verification');
      return;
    }
    try {
      const result = await login({
        email,
        password,
        captchaToken: isHumanVerified ? captchaToken : '',
      });
      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      console.error('Login error:', error, error.stack);
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    }
  };

  const onMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('Received hCaptcha message (raw):', JSON.stringify(message));
    console.log('Current state - isCaptchaLoading:', isCaptchaLoading, 'isHumanVerified:', isHumanVerified);
    if (typeof message === 'string' && message.startsWith('P1_')) {
      console.log('Captcha verified with token:', message);
      setCaptchaToken(message);
      setIsHumanVerified(true);
      setIsCaptchaLoading(false);
      if (captchaRef.current && captchaRef.current.hide) {
        captchaRef.current.hide();
      }
    } else if (message === 'error' || message === 'onError') {
      Alert.alert('Error', 'Verification failed. Please try again.');
      setIsCaptchaLoading(false);
    } else if (message === 'expired' || message === 'onExpire') {
      setIsHumanVerified(false);
      setIsCaptchaLoading(false);
    } else if (message === 'open') {
      console.log('Captcha modal opened');
    } else {
      console.log('Unknown hCaptcha message:', message);
    }
  };

  return (
    <View style={styles.container}>
      <HCaptcha
        ref={captchaRef}
        siteKey="e3889ef2-1348-45b3-bceb-b03dbfffcede"
        onMessage={onMessage}
        size="invisible"
        languageCode="en"
        hasBackdrop={false}
      />
      <View style={styles.imageContainer}>
        <Image source={logo_s} style={styles.img} />
      </View>
      <View style={styles.loginContainer}>
        <Image source={loginImg} style={styles.img} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>User:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email or UserID"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View style={styles.humanLoginContainer}>
        <View style={styles.humanContainer}>
          <Pressable
            style={styles.humanCheckboxContainer}
            onPress={handleHumanCheckPress}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isHumanVerified }}
            disabled={isCaptchaLoading}
          >
            <View style={[styles.checkbox, isHumanVerified && styles.checkedBox]}>
              {isHumanVerified && <View style={styles.checkmark} />}
            </View>
            <Text style={styles.humanCheckboxText}>
              {isHumanVerified ? 'Verified' : isCaptchaLoading ? 'Verifying...' : 'I am Human'}
            </Text>
          </Pressable>
          <Image
            source={captcha_icon}
            style={styles.captchaIcon}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.loginButton,
            (!email || !password || !isHumanVerified) && styles.loginButtonDisabled
          ]}
          onPress={handleLoginPress}
          disabled={!email || !password || !isHumanVerified || isCaptchaLoading}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
      {isCaptchaLoading && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setIsCaptchaLoading(false);
            setIsHumanVerified(false);
          }}
        >
          <Text style={styles.resetButtonText}>Reset Captcha</Text>
        </TouchableOpacity>
      )}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
          <Image source={google_icon} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
          <Image source={facebook_icon} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.githubButton]}>
          <Image source={github_icon} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Sign in with GitHub</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.linkedinButton]}>
          <Image source={linkedin_icon} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Sign in with LinkedIn</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => router.push('/password')}>
          <Text style={styles.footerLink}>Forgot Password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.footerLink}>New to ALGOGENE? Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

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
        marginVertical: 10,
        textAlign: 'center',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    smallLogo: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    loginImage: {
        width: 10,
        height: 10,
    },
    loginContainer: {
        alignItems: 'center'
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        color: 'white',
        marginBottom: 8,
        fontSize: 16,
    },
    checkboxAndButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',  
        alignItems: 'center',             
        marginTop: 15,                    
        gap: 10, 
    },
    humanCheckContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: '#87cefa',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        alignItems: 'center',
    },
    input: {
        backgroundColor: 'white',
        color: 'black',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    humanLoginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 15,
    },
    humanContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        padding: 15,
        borderRadius: 8,
        flex: 1, 
        height: 50, 
    },
    loginButton: {
        backgroundColor: '#87cefa',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 120,
        height: 50,
    },
    loginButtonDisabled: {
        opacity: 0.6,
        backgroundColor: '#87cefa', // Same color but faded
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
    checkedBox: {
        backgroundColor: '#87cefa',
    },
    checkmark: {
        width: 10,
        height: 10,
        backgroundColor: 'white',
    },
    humanCheckboxText: {
        color: 'black',
        fontSize: 14,
        marginHorizontal: 6, 
    },
    captchaIcon: {
        width: 120,
        height: 40,
        marginLeft: -35,
    },
    humanCheckboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    humanBox: {
        flex: 1,
        backgroundColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
    },
    humanText: {
        color: '#333',
        fontSize: 12,
    },
    humanLogo: {
        width: 18,
        height: 18,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10, // Reduced space
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'white',
        marginTop: 10,
    },
    dividerText: {
        color: 'white',
        marginHorizontal: 10,
        marginTop: 10, 
        fontSize: 14,
    },
    socialContainer: {
        marginVertical: 15,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        justifyContent: 'center',
    },
    googleButton: {
        backgroundColor: '#DB4437', // Google Red
    },
    facebookButton: {
        backgroundColor: '#4267B2', // Facebook Blue
    },
    githubButton: {
        backgroundColor: '#333333', // GitHub Grey
    },
    linkedinButton: {
        backgroundColor: '#0077B5', // LinkedIn Blue
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    socialButtonText: {
        color: 'white',
        fontSize: 16,
    },
    footerContainer: {
        alignItems: 'flex-start', // Left-aligned
    },
    footerLink: {
        color: '#999', // Grey color
        marginBottom: 8,
        fontSize: 14,
    },
});
