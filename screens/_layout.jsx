import { Stack } from 'expo-router';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { SubAccountsProvider } from '../context/SubAccountsContext';

export default function RootLayout() {
  return (
    <SubscriptionProvider>
      <SubAccountsProvider>
        <Stack
          screenOptions={{
            headerShown: false, // Hides the header for all screens in this stack
          }}
        >
          {/* Authentication stack */}
          <Stack.Screen name="(auth)/index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(auth)/password" />
          <Stack.Screen name="(auth)/confirmation" />

          <Stack.Screen name="(tabs)" />

          <Stack.Screen name="Profile/CustomerService" />
          <Stack.Screen name="Profile/HelpCenter" />
          <Stack.Screen name="Profile/Information" />
          <Stack.Screen name="Profile/InviteFriends" />
          <Stack.Screen name="Profile/Settings" />
          <Stack.Screen name="Profile/Update" />
          
          {/* Portfolio screens */}
          <Stack.Screen name="Accounts/AIPortfolioAnalysis" />
          <Stack.Screen name="Accounts/LiveTest" />
          <Stack.Screen name="Accounts/AccountManager" />
          <Stack.Screen name="Accounts/RealTrade" />
          <Stack.Screen name="Accounts/PortfolioResult" />
          <Stack.Screen name="Accounts/SubAccounts" />
        </Stack>
      </SubAccountsProvider>
    </SubscriptionProvider>
  );
}
