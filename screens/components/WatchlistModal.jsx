// import React from "react";
// import {
//   View,
//   Text,
//   Modal,
//   ScrollView,
//   TouchableOpacity,
//   Pressable,
//   Image,
//   StyleSheet,
// } from "react-native";

// const WatchlistModal = ({ visible, onClose, allItems, selectedItems, setSelectedItems }) => {
//   const toggleItem = (symbol) => {
//     if (selectedItems.includes(symbol)) {
//       setSelectedItems(selectedItems.filter((item) => item !== symbol));
//     } else {
//       setSelectedItems([...selectedItems, symbol]);
//     }
//   };

//   return (
//     <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Edit Watchlist</Text>
//           <ScrollView style={styles.modalScrollView}>
//             {allItems.map((item) => (
//               <Pressable key={item.symbol} style={styles.modalItem} onPress={() => toggleItem(item.symbol)}>
//                 <View style={styles.modalItemContent}>
//                   <Image source={item.icon} style={styles.modalIcon} />
//                   <View style={styles.modalItemText}>
//                     <Text style={styles.modalItemName}>{item.name}</Text>
//                     <Text style={styles.modalItemSymbol}>{item.symbol}</Text>
//                   </View>
//                 </View>
//                 {selectedItems.includes(item.symbol) && <Text style={styles.selectedIndicator}>✓</Text>}
//               </Pressable>
//             ))}
//           </ScrollView>
//           <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
//             <Text style={styles.modalCloseButtonText}>Done</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   // Add your styles here, same as the modal styles in the original code
// });

// export default WatchlistModal;

import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";

import { Ionicons } from '@expo/vector-icons';

const WatchlistModal = ({ 
  visible, 
  onClose, 
  allItems = [], 
  selectedItems = [], 
  setSelectedItems 
}) => {
  const toggleItem = (symbol) => {
    if (selectedItems.includes(symbol)) {
      setSelectedItems(selectedItems.filter((item) => item !== symbol));
    } else {
      setSelectedItems([...selectedItems, symbol]);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Items</Text>
          <ScrollView>
            {allItems.map((item) => (
              <TouchableOpacity
                key={item.symbol}
                style={[
                  styles.item,
                  selectedItems.includes(item.symbol) && styles.selectedItem
                ]}
                onPress={() => toggleItem(item.symbol)}
              >
                <Text style={styles.itemText}>{item.name || item.symbol}</Text>
                {selectedItems.includes(item.symbol) && (
                  // Using Ionicons as a reliable alternative
                  <Ionicons name="checkmark" size={20} color="#2196F3" />
                  // Or if you fix the image path:
                  // <Image source={Check} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Pressable 
            style={styles.closeButton} 
            onPress={onClose}
            android_ripple={{ color: '#fff' }}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  selectedItem: {
    backgroundColor: '#e6f7ff',
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
});

export default WatchlistModal;



// import React from "react";
// import {
//   View,
//   Text,
//   Modal,
//   ScrollView,
//   TouchableOpacity,
//   Pressable,
//   Image,
//   StyleSheet,
// } from "react-native";

// import Check from '../../assets/img/checkmark.png';

// const WatchlistModal = ({ 
//   visible, 
//   onClose, 
//   allItems = [], // Provide default empty array
//   selectedItems = [], // Provide default empty array
//   setSelectedItems 
// }) => {
//   const toggleItem = (symbol) => {
//     if (selectedItems.includes(symbol)) {
//       setSelectedItems(selectedItems.filter((item) => item !== symbol));
//     } else {
//       setSelectedItems([...selectedItems, symbol]);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent={true} animationType="slide">
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Select Items</Text>
//           <ScrollView>
//             {allItems.map((item) => (
//               <TouchableOpacity
//                 key={item.symbol} // or whatever unique identifier your items have
//                 style={[
//                   styles.item,
//                   selectedItems.includes(item.symbol) && styles.selectedItem
//                 ]}
//                 onPress={() => toggleItem(item.symbol)}
//               >
//                 <Text>{item.name || item.symbol}</Text>
//                 {selectedItems.includes(item.symbol) && (
//                   <Image source= {Check} />
//                 )}
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//           <Pressable style={styles.closeButton} onPress={onClose}>
//             <Text style={styles.closeButtonText}>Close</Text>
//           </Pressable>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   item: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedItem: {
//     backgroundColor: '#e6f7ff',
//   },
//   closeButton: {
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: '#2196F3',
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });

// export default WatchlistModal;