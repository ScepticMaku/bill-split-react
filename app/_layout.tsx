// import { AuthProvider } from '@/utils/auth';
import { Stack } from "expo-router";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    // <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
    // <AuthProvider>

    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
    // </AuthProvider>
    // </ClerkProvider>
  );
}
