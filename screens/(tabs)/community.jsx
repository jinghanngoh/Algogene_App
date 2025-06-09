// Template: rnfes
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router'
import Logo from '../../assets/img/logo.png';

const Community = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        // You can add any pre-navigation logic here
        // For example: analytics, validation checks, etc.
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Community</Text>
        </View>
    );
};

export default Community;

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


// import React from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
// import { useRef, useState } from 'react';
// import { useRouter } from 'expo-router';
// import placeholder from '../../assets/img/placeholder.png';

// const Marketplace = () => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('Trading System'); 
//   const [showTradingSystemBoxes, setShowTradingSystemBoxes] = useState(true);

//   const buttons = [
//     { label: 'Trading System' },
//     { label: 'App Collection' },
//     { label: 'Data Marketplace' },
//   ];

//   const tradingSystemTabs = [
//     { label: 'Tab 1' },
//     { label: 'Tab 2' },
//     { label: 'Tab 3' },
//     { label: 'Tab 4' },
//     { label: 'Tab 5' },
//     { label: 'Tab 6' },
//   ];

//   const handleButtonPress = (button) => {
//     setActiveTab(button.label);
//     setShowTradingSystemBoxes(button.label === 'Trading System');
//     console.log(`Button pressed: ${button.label}`);
//   };

//   const renderTradingSystemBoxes = () => {
//     if (!showTradingSystemBoxes) {
//       return null;
//     }
    
//     return (
//       <ScrollView 
//         style={styles.scrollContainer}
//         contentContainerStyle={styles.scrollContentContainer}
//       >
//         {tradingSystemTabs.map((tab, index) => (
//           <View key={index} style={styles.tradingSystemBox}>
//             <View style={styles.userContainer}>
//               <Image
//                 source={placeholder}
//                 style={styles.userIcon}
//               />
//               <Text style={styles.userName}>User Name</Text>
//             </View>
//             <TouchableOpacity style={styles.categoryButton}>
//               <Text style={styles.categoryButtonText}>Category</Text>
//             </TouchableOpacity>
//             <View style={styles.graphPlaceholder}><Text>Graph</Text></View>
//             <TouchableOpacity style={styles.readMoreButton}>
//               <Text style={styles.readMoreText}>Read more</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </ScrollView>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Buttons */}
//       <View style={styles.buttonsContainer}>
//         {buttons.map((button, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.button,
//               {
//                 backgroundColor: activeTab === button.label ? 'white' : 'lightgray',
//                 borderColor: activeTab === button.label ? 'lightblue' : 'lightgray',
//                 borderWidth: activeTab === button.label ? 3 : 0,
//                 width: Dimensions.get('window').width / 3 - 25,
//               }
//             ]}
//             onPress={() => handleButtonPress(button)}
//           >
//             <Text style={{ color: 'black', flexWrap: 'wrap', textAlign: 'center' }}>{button.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Trading System Boxes */}
//       {renderTradingSystemBoxes()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 50,
//     paddingHorizontal: 10,
//   },
//   button: {
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 5,
//     alignItems: 'center',
//     marginHorizontal: 10, 
//   },
//   scrollContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   scrollContentContainer: {
//     paddingHorizontal: 15,
//     paddingVertical: 20,
//   },
//   tradingSystemBox: {
//     backgroundColor: '#333',
//     marginBottom: 20,
//     padding: 20,
//     borderRadius: 10,
//     width: '100%',
//   },
//   userContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   userIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     marginRight: 10,
//   },
//   userName: {
//     color: 'white',
//     fontSize: 16,
//   },
//   categoryButton: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#222',
//     padding: 5,
//     borderRadius: 5,
//   },
//   categoryButtonText: {
//     color: 'white',
//   },
//   graphPlaceholder: {
//     backgroundColor: '#555',
//     height: 150,
//     marginVertical: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   readMoreButton: {
//     backgroundColor: '#222',
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   readMoreText: {
//     color: 'white',
//   },
// });

// export default Marketplace;