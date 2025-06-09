import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false, // Applies to ALL screens in this stack
      }}
    >
      <Stack.Screen name="(auth)/index" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/password" />
      <Stack.Screen name="(auth)/confirmation" />
      {/* <Stack.Screen name="(tabs)/profile" />
      <Stack.Screen name="(tabs)/home" /> */}
      <Stack.Screen name="profile_update" />
    </Stack>
  );
}