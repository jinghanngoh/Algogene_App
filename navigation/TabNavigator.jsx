import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/(tabs)/home';
import Community from '../screens/(tabs)/community';
import Marketplace from '../screens/(tabs)/marketplace';
import Portfolio from '../screens/(tabs)/portfolio';
import Profile from '../screens/(tabs)/profile';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="home" component={Home} />
      <Tab.Screen name="community" component={Community} />
      <Tab.Screen name="marketplace" component={Marketplace} />
      <Tab.Screen name="portfolio" component={Portfolio} />
      <Tab.Screen name="profile" component={Profile} />
    </Tab.Navigator>
  );
}