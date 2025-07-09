import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import AIPortfolioAnalysis from '../screens/Portfolio/AIPortfolioAnalysis';
import PortfolioResult from '../screens/Portfolio/PortfolioResult';
import Index from '../screens/(auth)/index';
import Login from '../screens/(auth)/login';
import Register from '../screens/(auth)/register';
import Password from '../screens/(auth)/password';
import Confirmation from '../screens/(auth)/confirmation';
import CustomerService from '../screens/Profile/CustomerService';
import HelpCenter from '../screens/Profile/HelpCenter';
import Information from '../screens/Profile/Information';
import InviteFriends from '../screens/Profile/InviteFriends';
import Settings from '../screens/Profile/Settings';
import Update from '../screens/Profile/Update';
import LiveTest from '../screens/Portfolio/LiveTest';
import MyAccount from '../screens/Portfolio/MyAccount';
import RealTrade from '../screens/Portfolio/RealTrade';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <SubscriptionProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Authentication stack */}
          <Stack.Screen name="(auth)/index" component={Index} />
          <Stack.Screen name="(auth)/login" component={Login} />
          <Stack.Screen name="(auth)/register" component={Register} />
          <Stack.Screen name="(auth)/password" component={Password} />
          <Stack.Screen name="(auth)/confirmation" component={Confirmation} />

          {/* Tab Navigator */}
          <Stack.Screen name="(tabs)" component={TabNavigator} />

          {/* Profile screens */}
          <Stack.Screen name="Profile/CustomerService" component={CustomerService} />
          <Stack.Screen name="Profile/HelpCenter" component={HelpCenter} />
          <Stack.Screen name="Profile/Information" component={Information} />
          <Stack.Screen name="Profile/InviteFriends" component={InviteFriends} />
          <Stack.Screen name="Profile/Settings" component={Settings} />
          <Stack.Screen name="Profile/Update" component={Update} />

          {/* Portfolio screens */}
          <Stack.Screen name="Portfolio/AIPortfolioAnalysis" component={AIPortfolioAnalysis} />
          <Stack.Screen name="Portfolio/LiveTest" component={LiveTest} />
          <Stack.Screen name="Portfolio/MyAccount" component={MyAccount} />
          <Stack.Screen name="Portfolio/RealTrade" component={RealTrade} />
          <Stack.Screen name="Portfolio/PortfolioResult" component={PortfolioResult} />
          <Stack.Screen name="Portfolio/AccountManager" component={AccountManager} />
          <Stack.Screen name="Portfolio/SubAccounts" component={SubAccounts} />

        </Stack.Navigator>
      </NavigationContainer>
    </SubscriptionProvider>
  );
}