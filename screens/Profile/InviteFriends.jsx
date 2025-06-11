// screens/(tabs)/profile/InviteFriends.jsx
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const InviteFriends = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // Sample referral link (replace with dynamic data from your backend)
  const referralLink = "https://yourapp.com/invite?ref=USER123";

  // Mock contacts data
  const contacts = [
    { id: 1, name: "John Doe", phone: "+1 (555) 123-4567" },
    { id: 2, name: "Jane Smith", phone: "+1 (555) 987-6543" },
    { id: 3, name: "Alex Wong", phone: "+1 (555) 456-7890" },
  ];

  // --- Handlers ---
  const handleCopyLink = () => {
    // In a real app, use Clipboard API: await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Copied!", "Referral link copied to clipboard.");
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join me on this awesome app! Use my referral link: ${referralLink}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share link.");
    }
  };

  const handleInviteContact = (contact) => {
    Alert.alert(
      "Send Invite",
      `Send referral link to ${contact.name} (${contact.phone})?`,
      [
        { text: "Cancel" },
        { text: "Send", onPress: () => console.log("Invite sent!") } // Replace with SMS/email API
      ]
    );
  };

  // --- UI Components ---
  const SocialButton = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={[styles.socialButton, { backgroundColor: color }]} onPress={onPress}>
      {icon}
      <Text style={styles.socialButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Invite Friends</Text>
        <View style={{ width: 24 }} /> // Spacer for alignment
      </View>

      {/* Referral Link Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Referral Link</Text>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity onPress={handleCopyLink}>
            <Ionicons name={copied ? "checkmark" : "copy"} size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>Earn 100 points for each friend who joins!</Text>
      </View>

      {/* Social Sharing Buttons */}
      <View style={styles.socialButtonsContainer}>
        <SocialButton
          icon={<FontAwesome name="whatsapp" size={20} color="white" />}
          label="WhatsApp"
          onPress={handleShareLink}
          color="#25D366"
        />
        <SocialButton
          icon={<MaterialCommunityIcons name="telegram" size={20} color="white" />}
          label="Telegram"
          onPress={handleShareLink}
          color="#0088CC"
        />
      </View>

      {/* Contacts List */}
      <Text style={styles.sectionHeader}>Invite from Contacts</Text>
      {contacts.map((contact) => (
        <TouchableOpacity 
          key={contact.id} 
          style={styles.contactItem}
          onPress={() => handleInviteContact(contact)}
        >
          <View style={styles.contactAvatar}>
            <Text style={styles.avatarText}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          </View>
          <Ionicons name="send" size={18} color="#666" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: 'white',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  linkText: {
    flex: 1,
    color: 'white',
  },
  hintText: {
    color: 'white',
    fontSize: 12,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  socialButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: 'white',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: '500',
    color: 'white',
  },
  contactPhone: {
    color: '#666',
    fontSize: 12,
  },
});

export default InviteFriends;