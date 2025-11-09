import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlantGridItem } from '../../src/components/PlantGridItem';
import { SiteCard } from '../../src/components/SiteCard';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';

type ProfileTabType = 'sites' | 'plants';

export default function ProfileScreen() {
  const { plants, locations, wateringTasks } = usePlants();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('sites');

  // Calculate statistics
  const totalPlants = plants.length;
  const totalSites = locations.length;
  
  // Count overdue tasks by location
  const overdueTasksByLocation = locations.reduce((acc, location) => {
    const plantsInLocation = plants.filter(p => p.locationId === location.id);
    const overdueCount = wateringTasks.filter(task => 
      task.isOverdue && plantsInLocation.some(p => p.id === task.plantId)
    ).length;
    acc[location.id] = overdueCount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={theme.colors.primaryLight} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Pierrick</Text>
              <Text style={styles.userStats}>
                {totalPlants} Plantes • {totalSites} Sites
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sites' && styles.tabActive]}
            onPress={() => setActiveTab('sites')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'sites' && styles.tabTextActive]}>
              Sites
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plants' && styles.tabActive]}
            onPress={() => setActiveTab('plants')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'plants' && styles.tabTextActive]}>
              Plantes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'sites' ? (
          <View style={styles.sitesGrid}>
            {locations.map(location => {
              const plantsInLocation = plants.filter(p => p.locationId === location.id);
              return (
                <SiteCard
                  key={location.id}
                  locationId={location.id}
                  locationName={location.name}
                  plantsInLocation={plantsInLocation}
                  overdueCount={overdueTasksByLocation[location.id] || 0}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.plantsGrid}>
            {plants.map(plant => (
              <PlantGridItem
                key={plant.id}
                plantId={plant.id}
                plantName={plant.name}
                imageUrl={plant.imageUrl}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabPlusContainer}>
        <TouchableOpacity style={styles.fabPlus} activeOpacity={0.8}>
          <Ionicons name="add" size={32} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.sage,
  },
  header: {
    backgroundColor: theme.colors.sage,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.sageDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.sageDark,
    marginBottom: theme.spacing.xs,
  },
  userStats: {
    fontSize: 16,
    color: theme.colors.sageDark,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  tabBarContainer: {
    backgroundColor: theme.colors.sage,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.sageLight,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#a0a0a0',
  },
  tabTextActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  sitesGrid: {
    flex: 1,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fabContainer: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  fabPlusContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
  },
  fabPlus: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
});

