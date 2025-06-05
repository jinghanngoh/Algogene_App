import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const Login = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.back(); // Navigates back to previous screen
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            

        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#87cefa',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});
