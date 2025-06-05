// Template: rnfes
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router'
import Logo from '../assets/img/logo.png';

const Home = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        // You can add any pre-navigation logic here
        // For example: analytics, validation checks, etc.
        router.push('/login');
    };

    return (
        <View style={styles.container}>
            {/* Image positioned at 20% from the top */}
            <View style={styles.imageContainer}>
                <Image source={Logo} style={styles.img} />
            </View>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={handleGetStarted}
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'absolute',
        top: '20%',
        transform: [{ translateY: -50 }],
        alignItems: 'center',
    },
    img: {
        marginVertical: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
    },
    button: {
        backgroundColor: '#87cefa',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginTop: '110%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});


// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Home = () => {
//   return (
//     <View>
//       <Text>Homes</Text>
//     </View>
//   )
// }

// export default Home

// const styles = StyleSheet.create({}) 