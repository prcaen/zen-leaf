import { Stack } from "expo-router";
import { PlantsProvider } from "../src/state/PlantsContext";

export default function RootLayout() {
  return (
    <PlantsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PlantsProvider>
  );
}
