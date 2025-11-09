import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.primary, headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
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