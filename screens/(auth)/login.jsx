import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import login from '../../assets/img/login.png';
import logo_s from '../../assets/img/logo_s.png';
import google_icon from '../../assets/img/google_icon.png';
import facebook_icon from '../../assets/img/facebook_icon.png';
import linkedin_icon from '../../assets/img/linkedin_icon.png';
import github_icon from '../../assets/img/github_icon.png';
import captcha_icon from '../../assets/img/captcha_icon.png';

const Login = () => {
    const router = useRouter();
    const [isHumanChecked , setIsHumanChecked] = useState(false);

    const toggleHumanCheck = () => {
        setIsHumanChecked(!isHumanChecked);
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={logo_s} style={styles.img} />
            </View>
            <View style={styles.loginContainer}>
                <Image source={login} style={styles.img} />
            </View>
            
            
            {/* User Input Field */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>User:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Email or UserID"
                    placeholderTextColor="#999"
                />
            </View>
            
            {/* Password Input Field */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Password"
                    placeholderTextColor="#999"
                    secureTextEntry={true}
                />
            </View>
            
            {/* Human Checkbox and Login Button */}
            <View style={styles.checkboxAndButtonContainer}>
                <View style={styles.humanContainer}>
                    <Pressable 
                        style={styles.humanCheckboxContainer}
                        onPress={toggleHumanCheck}
                    >
                        <View style={[styles.checkbox, isHumanChecked && styles.checkedBox]}>
                            {isHumanChecked && <View style={styles.checkmark} />}
                        </View>
                        <Text style={styles.humanCheckboxText}>I am Human</Text>
                    </Pressable>
                    <Image 
                        source={captcha_icon} 
                        style={styles.captchaIcon} 
                        resizeMode="contain"
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(tabs)/home')}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
                        
            {/* OR Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>
            
            {/* Social Login Options */}
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
            
            {/* Footer Links */}
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
        width: 100,
        height: 100,
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
        justifyContent: 'space-between',  // This will push items to opposite ends
        alignItems: 'center',             // Vertically center items
        marginTop: 15,                    // Adjust as needed
    },
    humanCheckContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: '#87cefa',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
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
    humanContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        padding: 15,
        borderRadius: 8,
        width : "55%"
 
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
        fontSize: 16,
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
        fontSize: 14,
    },
    humanLogo: {
        width: 20,
        height: 20,
    },
    loginButton: {
        backgroundColor: '#87cefa',
        paddingVertical: 20,
        borderRadius: 8,
        width: '40%',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 45,
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