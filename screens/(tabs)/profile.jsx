import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import Placeholder from '../../assets/img/placeholder.png';

const Profile = () => {
    const router = useRouter();

    const menuItems = [
        { 
            id: 1, 
            name: "Information",
            icon: <MaterialIcons name="info" size={22} color="#666" />
        },
        { 
            id: 2, 
            name: "Invite Friends",
            icon: <MaterialCommunityIcons name="account-multiple-plus" size={22} color="#666" />
        },
        { 
            id: 3, 
            name: "Customer Service",
            icon: <FontAwesome name="headphones" size={22} color="#666" />
        },
        { 
            id: 4, 
            name: "Help Center",
            icon: <MaterialIcons name="help-center" size={22} color="#666" />
        },
        { 
            id: 5, 
            name: "Settings",
            icon: <Ionicons name="settings-sharp" size={22} color="#666" />
        },
    ];

    const handleMenuItemPress = (itemName) => {
        switch (itemName) {
            case "Information":
                router.push('/Profile/Information');
                break;
            case "Invite Friends":
                router.push('/Profile/InviteFriends');
                break;
            case "Customer Service":
                router.push('/Profile/CustomerService');
                break;
            case "Help Center":
                router.push('/Profile/HelpCenter');
                break;
            case "Settings":
                router.push('/Profile/Settings');
                break;
            default:
                console.log(`${itemName} pressed`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Centered Profile Section */}
            <View style={styles.profileSection}>
                <Image source={Placeholder} style={styles.profileImage} />
                <Text style={styles.profileName}>NAME</Text>
                <Text style={styles.profileUserId}>User ID: xxx</Text>
            </View>
            
            {/* Menu Items with Icons */}
            <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handleMenuItemPress(item.name)}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={styles.menuItemLeft}>
                                {item.icon}
                                <Text style={styles.menuItemText}>{item.name}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 40,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    profileName: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    profileUserId: {
        color: '#999',
        fontSize: 16,
    },
    menuContainer: {
        marginTop: 10,
        gap: 20,
    },
    menuItem: {
        backgroundColor: '#333',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menuItemText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});