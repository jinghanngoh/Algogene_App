import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router'
import Logo from '../../assets/img/logo.png';
import { Ionicons } from '@expo/vector-icons'; // Import icons library

const Portfolio = () => {
    const router = useRouter();

    const menuItems = [
        { id: 1, name: "My Account" },
        { id: 2, name: "Live Test" },
        { id: 3, name: "Real Trade" },
        { id: 4, name: "AI Portfolio Analysis" },
    ];

    const handleMenuItemPress = (itemName) => {
        console.log(`${itemName} pressed`);
        // Add navigation logic here
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={Logo} style={styles.logo} />
                <Text style={styles.headerText}>Account Details</Text>
            </View>
            
            <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handleMenuItemPress(item.name)}
                    >
                        <View style={styles.menuItemContent}>
                            <Text style={styles.menuItemText}>{item.name}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Portfolio;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 30,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    headerText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    menuContainer: {
        marginTop: 20,
        gap: 20, // Adds space between menu items
    },
    menuItem: {
        backgroundColor: '#333', // Gray background
        borderRadius: 10, // Rounded corners
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    menuItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});