import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import logo_s from '../assets/img/logo_s.png';

const ProfileUpdate = () => {
    const router = useRouter();

    const handleBackToProfile = () => {
        router.back(); // Goes back to the profile screen
    };

    return (
        <View style={styles.container}>
            <Image source={logo_s} style={styles.logo} />
            
            <View style={styles.messageContainer}>
                <Text style={styles.title}>Your data has been</Text>
                <Text style={styles.subtitle}>updated</Text>
            </View>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={handleBackToProfile}
            >
                <Text style={styles.buttonText}>Back to Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileUpdate;
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
        marginTop: 50, 
        marginBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 24,
        textAlign: 'center',
    },
    subtitle: {
        color: 'white',
        fontSize: 24,
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
        marginTop: 50, 
        marginLeft: 5,
        color: 'gray',
        fontSize: 16,
    },
});


// CAN CONSIDER ADDING THIS: 
// const [isUpdating, setIsUpdating] = useState(false);

// const handleUpdateProfile = async () => {
//     setIsUpdating(true);
//     try {
//         // API call to update profile
//         await updateProfileAPI();
//         router.push('/profile_update');
//     } catch (error) {
//         alert('Update failed');
//     } finally {
//         setIsUpdating(false);
//     }
// };