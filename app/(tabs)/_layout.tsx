import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const TabIcon = ({
  name,
  color,
  focused
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) => {
  if (focused) {
    return (
      <View style={tabStyles.activeIconContainer}>
        <Ionicons size={24} name={name} color={color} />
      </View>
    );
  }
  return <Ionicons size={24} name={name} color={color} />;
};

const tabStyles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: theme.colors.sageLight,
    borderRadius: theme.borderRadius.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.primaryLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 72,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaf-outline" color={color} focused={focused} />
          ),
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}