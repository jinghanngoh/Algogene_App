// Template: rnfes
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router'
import Logo from '../../assets/img/logo.png';

const Home = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        // You can add any pre-navigation logic here
        // For example: analytics, validation checks, etc.
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Home</Text>
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

    text: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
        marginTop: 300,
    },

});
