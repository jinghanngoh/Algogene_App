import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import logo_s from '../../assets/img/logo_s.png';

const ProfileUpdate = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const updatedData = JSON.parse(params.updatedData || '{}');

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

            <ScrollView style={styles.dataContainer}>
                <Text style={styles.sectionHeader}>Updated Information:</Text>
                
                {Object.entries(updatedData).map(([key, value]) => (
                    <View key={key} style={styles.dataRow}>
                        <Text style={styles.dataLabel}>{key}:</Text>
                        <Text style={styles.dataValue}>{value || 'Not provided'}</Text>
                    </View>
                ))}
            </ScrollView>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={handleBackToProfile}
            >
                <Text style={styles.buttonText}>Back to Profile</Text>
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
    logo: {
        width: 60,
        height: 60,
        marginBottom: 10,
        alignSelf: 'center',
    },
    messageContainer: {
        alignItems: 'center',
        marginTop: 20,
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
        fontWeight: 'bold',
    },
    dataContainer: {
        marginVertical: 20,
        maxHeight: '50%',
    },
    sectionHeader: {
        color: '#37B3E9',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dataLabel: {
        color: 'white',
        fontSize: 14,
    },
    dataValue: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#37B3E9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileUpdate;

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