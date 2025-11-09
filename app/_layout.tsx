import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PlantsProvider } from "../src/state/PlantsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlantsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PlantsProvider>
    </SafeAreaProvider>
  );
}
