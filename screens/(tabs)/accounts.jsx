// Master page for Account Manager, Sub Accounts and AI Portfolio Analysis
import { StyleSheet, Text, View, Image, TouchableOpacity , ScrollView, Dimensions, Modal} from "react-native";
import React from 'react'; 
import { useRouter } from 'expo-router';
import Logo from '../../assets/img/logo.png';
import { Ionicons } from '@expo/vector-icons'; 

const Accounts = () => {
    const router = useRouter();

    const menuItems = [
        { id: 1, name: "Account Manager"},
        { id: 2, name: "Sub Accounts"},
        { id: 3, name: "AI Portfolio Analysis"},
    ];

    const handleMenuItemPress = (itemName) => {
        switch (itemName) {
            case "Account Manager":
                router.push('/Accounts/AccountManager');
                break; 
            case "Sub Accounts":
                router.push('/Accounts/SubAccounts');
                break;
            case "AI Portfolio Analysis":
                router.push('/Accounts/AIPortfolioAnalysis');
                break; 
            default:
                console.log(`${itemName} pressed`);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={Logo} style={styles.logo} />
                <Text style={styles.headerText}>Account Details</Text>
            </View>
            
            <ScrollView style={styles.scrollContainer}>

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
            </ScrollView> 
        </View>
    );
};


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
        gap: 15, 
    },
    menuItem: {
        backgroundColor: '#333', 
        borderRadius: 10,
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
    subscribedAlgorithmContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contentBox: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginTop: -10, 
    },
    subscribedBox: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    subscribedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        zIndex: 1,
    },
    subscribedText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    categoryLabel: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    categoryLabelText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    userName: {
        color: 'black',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'black',
        marginVertical: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    titleText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
        flex: 1,
    },
    performanceScore: {
        backgroundColor: '#2196F3',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    performanceScoreText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    graphContainer: {
        marginBottom: 15,
    },
    chartStyle: {
        borderRadius: 5,
    },
});

export default Accounts;