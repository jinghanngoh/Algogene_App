// screens/(tabs)/profile/Settings.jsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { useRouter, useState } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const Settings = () => {
  const router = useRouter();
  // const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingsItems = [
    {
      title: "General",
      icon: <Ionicons name="settings-outline" size={22} color="white" />,
      action: () => router.push('/(tabs)/profile/GeneralSettings')
    },
    {
      title: "Privacy & Security",
      icon: <MaterialIcons name="security" size={22} color="white" />,
      action: () => router.push('/(tabs)/profile/PrivacySettings')
    },
    {
      title: "Notifications",
      icon: <Ionicons name="notifications-outline" size={22} color="white" />,
      component: (
        <Switch
          // value={notificationsEnabled}
          // onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
          trackColor={{ false: "#767577", true: "#006AFF" }}
        />
      )
    },
  ];

  const accountActions = [
    {
      title: "SWITCH ACCOUNT",
      icon: <Ionicons name="swap-horizontal" size={22} color="white" />,
      action: () => console.log("Switch account pressed")
    },
    {
      title: "LOG OUT",
      icon: <Feather name="log-out" size={22} color="#FF3B30" />,
      textColor: "#FF3B30",
      action: () => {
        Alert.alert(
          "Log Out",
          "Are you sure you want to log out?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            { 
              text: "Log Out", 
              onPress: () => {
                router.replace('/(auth)');

              }
            }
          ]
        );
      }
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
        />
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.item, index === settingsItems.length - 1 && styles.lastItem]}
            onPress={item.action}
          >
            <View style={styles.itemLeft}>
              {item.icon}
              <Text style={styles.itemText}>{item.title}</Text>
            </View>
            {item.component || <Ionicons name="chevron-forward" size={20} color="#999" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        {accountActions.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.item, index === accountActions.length - 1 && styles.lastItem]}
            onPress={item.action}
          >
            <View style={styles.itemLeft}>
              {item.icon}
              <Text style={[styles.itemText, { color: item.textColor || 'white' }]}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Back Button */}
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
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    height: '100%',
  },
  section: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Settings;