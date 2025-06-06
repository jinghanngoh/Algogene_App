import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          height: 80, 
          backgroundColor: "black",
        },
        tabBarIconStyle: {
            marginTop: 10,
        },
        tabBarLabelStyle: {
          marginTop: 4,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarLabel: 'Marketplace',
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          tabBarLabel: 'Portfolio',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color }) => <Ionicons name="globe" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}