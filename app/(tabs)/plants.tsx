import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { ActionDialog } from '../../src/components/ActionDialog';
import { PlantGridItem } from '../../src/components/PlantGridItem';
import { SiteCard } from '../../src/components/SiteCard';
import { Tab, TabBar } from '../../src/components/TabBar';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';

export type ProfileTabType = 'rooms' | 'plants';

export default function ProfileScreen() {
  const router = useRouter();
  const { plants, rooms, wateringTasks, user } = usePlants();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('rooms');
  const [showActionDialog, setShowActionDialog] = useState(false);

  // Calculate statistics
  const totalPlants = plants.length;
  const totalRooms = rooms.length;
  
  // Count overdue tasks by location
  const overdueTasksByLocation = rooms.reduce((acc, room) => {
    const plantsInLocation = plants.filter(p => p.roomId === room.id);
    const overdueCount = wateringTasks.filter(task => 
      task.daysOverdue > 0 && plantsInLocation.some(p => p.id === task.plantId)
    ).length;
    acc[room.id] = overdueCount;
    return acc;
  }, {} as Record<string, number>);

  const tabs: Tab<ProfileTabType>[] = [
    { value: 'rooms', label: 'Rooms' },
    { value: 'plants', label: 'Plants' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/profile/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={theme.colors.primaryLight} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userStats}>
                {totalPlants} Plants • {totalRooms} Rooms
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} containerStyle={styles.tabBarContainer} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'rooms' ? (
          rooms.length > 0 ? (
            <View style={styles.roomsGrid}>
              {rooms.map(room => {
                const plantsInLocation = plants.filter(p => p.roomId === room.id);
                return (
                  <SiteCard
                    key={room.id}
                    locationId={room.id}
                    locationName={room.name}
                    plantsInLocation={plantsInLocation}
                    overdueCount={overdueTasksByLocation[room.id] || 0}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={64} color={theme.colors.primaryLight} />
              <Text style={styles.emptyTitle}>No Rooms Yet</Text>
              <Text style={styles.emptyText}>
                Create your first room to organize your plants
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/room/create')}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={theme.colors.white} />
                <Text style={styles.emptyButtonText}>Create Room</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          plants.length > 0 ? (
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
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={64} color={theme.colors.primaryLight} />
              <Text style={styles.emptyTitle}>No Plants Yet</Text>
              <Text style={styles.emptyText}>
                Add your first plant to start tracking its care
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/plant/create')}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={theme.colors.white} />
                <Text style={styles.emptyButtonText}>Add Plant</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          onPress={() => setShowActionDialog(true)}
        >
          <Ionicons name="add" size={32} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Action Dialog */}
      <ActionDialog
        visible={showActionDialog}
        onClose={() => setShowActionDialog(false)}
        title="Add New"
        options={[
          {
            id: 'create-room',
            label: 'Create Room',
            icon: 'home-outline',
            onPress: () => router.push('/room/create'),
          },
          {
            id: 'add-plant',
            label: 'Add Plant',
            icon: 'leaf-outline',
            onPress: () => router.push('/plant/create'),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.sage,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.sage,
  },
  topBarSpacer: {
    flex: 1,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  header: {
    backgroundColor: theme.colors.sage,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  roomsGrid: {
    flex: 1,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  tabBarContainer: {
    marginHorizontal: theme.spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

