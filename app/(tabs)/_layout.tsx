import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

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
        tabBarIconStyle : {
            color: theme.colors.primaryLight,
            backgroundColor: theme.colors.sageLight,
            borderRadius: theme.borderRadius.full,
            padding: theme.spacing.sm,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="leaf-outline" color={color} />,
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}

/*
 *
 <View style={styles.bottomNav}>
 <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
   <View style={styles.navIconActive}>
     <Ionicons name="home" size={24} color={theme.colors.primary} />
   </View>
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
   <Ionicons name="leaf-outline" size={24} color={theme.colors.textSecondary} />
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
   <Ionicons name="search-outline" size={24} color={theme.colors.textSecondary} />
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
   <Ionicons name="water-outline" size={24} color={theme.colors.textSecondary} />
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
   <Text style={styles.navText}>P</Text>
 </TouchableOpacity>
</View>
 */