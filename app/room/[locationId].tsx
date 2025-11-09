import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { PlantCard } from '../../src/components/PlantCard';
import { TabBar, Tab } from '../../src/components/TabBar';
import { TaskSection } from '../../src/components/TaskSection';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';
import { TabType } from '../../src/types';

export default function RoomDetailScreen() {
  const { locationId } = useLocalSearchParams<{ locationId: string }>();
  const router = useRouter();
  const {
    plants,
    locations,
    wateringTasks,
    selectedPlants,
    togglePlantSelection,
  } = usePlants();

  const [activeTab, setActiveTab] = useState<TabType>('today');

  const location = locations.find(l => l.id === locationId);
  const plantsInRoom = plants.filter(p => p.locationId === locationId);

  // Filter watering tasks for this room
  const roomTasks = wateringTasks.filter(task =>
    plantsInRoom.some(p => p.id === task.plantId)
  );

  // Separate tasks by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = roomTasks.filter(task => {
    const nextDate = new Date(task.nextWateringDate);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate <= today;
  });

  const soonTasks = roomTasks.filter(task => {
    const nextDate = new Date(task.nextWateringDate);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate > today;
  });

  const displayedTasks = activeTab === 'today' ? todayTasks : soonTasks;

  const tabs: Tab<TabType>[] = [
    { value: 'today', label: 'Today' },
    { value: 'soon', label: 'Soon' },
  ];

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Room not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{location.name}</Text>
          <Text style={styles.headerSubtitle}>{plantsInRoom.length} plants</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Bar */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="light" />

        {/* Watering Section */}
        <TaskSection
          title="Watering"
          subtitle="Complete these tasks, or tap to view instructions"
        >
          {displayedTasks.length > 0 ? (
            displayedTasks.map(task => (
              <PlantCard
                key={task.plantId}
                task={task}
                isSelected={selectedPlants.has(task.plantId)}
                onToggleSelect={togglePlantSelection}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.primaryLight} />
              <Text style={styles.emptyText}>
                {activeTab === 'today' ? 'No plants need watering today!' : 'No upcoming watering tasks'}
              </Text>
            </View>
          )}
        </TaskSection>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.sage,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  headerButton: {
    padding: theme.spacing.sm,
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 56 + theme.spacing.lg,
  },
});

