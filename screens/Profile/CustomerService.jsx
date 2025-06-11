// screens/(tabs)/profile/CustomerService.jsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const CustomerService = () => {
  const router = useRouter();

  const handlePress = (platform) => {
    Alert.alert(
      `Open ${platform}`,
      `Would you like to contact support via ${platform}?`,
      [
        { text: "Cancel" },
        { text: "Open", onPress: () => console.log(`Opening ${platform}...`) }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header - Centered */}
      <View style={styles.header}>
        <Text style={styles.title}>Customer Service</Text>
      </View>

      {/* Platform Buttons - Centered Text */}
      <View style={styles.buttonContainer}>
        {/* WhatsApp */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#25D366' }]}
          onPress={() => handlePress('WhatsApp')}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="whatsapp" size={24} color="white" />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </View>
        </TouchableOpacity>

        {/* Facebook Messenger */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#006AFF' }]}
          onPress={() => handlePress('Messenger')}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="facebook-messenger" size={24} color="white" />
            <Text style={styles.buttonText}>Facebook Messenger</Text>
          </View>
        </TouchableOpacity>

        {/* Telegram */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#0088CC' }]}
          onPress={() => handlePress('Telegram')}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="telegram" size={24} color="white" />
            <Text style={styles.buttonText}>Telegram</Text>
          </View>
        </TouchableOpacity>

        {/* KakaoTalk */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FFCD00' }]}
          onPress={() => handlePress('KakaoTalk')}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="chat" size={24} color="black" />
            <Text style={[styles.buttonText, { color: 'black' }]}>Kakao Talk</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Back Button - Left Aligned */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#000', // Dark background for contrast
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white', // White text for header
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center', // Centered text in buttons
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'flex-start', // Left aligned
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    // Removed underline
  },
});

export default CustomerService;