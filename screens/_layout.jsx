import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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

      {/* Main application tabs */}
      <Stack.Screen name="(tabs)" />
      
      {/* Other screens */}
      <Stack.Screen name="profile_update" />
    </Stack>
  );
}


// import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return (
//     <Stack 
//       screenOptions={{
//         headerShown: false, // Applies to ALL screens in this stack
//       }}
//     >
//       <Stack.Screen name="(auth)/index" />
//       <Stack.Screen name="(auth)/login" />
//       <Stack.Screen name="(auth)/register" />
//       <Stack.Screen name="(auth)/password" />
//       <Stack.Screen name="(auth)/confirmation" />
//       {/* <Stack.Screen name="(tabs)/profile" />
//       <Stack.Screen name="(tabs)/home" /> */}
//       <Stack.Screen name="profile_update" />
//     </Stack>
//   );
// }