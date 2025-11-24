import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { PlantCard } from '../../src/components/PlantCard';
import { Tab, TabBar } from '../../src/components/TabBar';
import { TaskSection } from '../../src/components/TaskSection';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';

export type TabType = 'today' | 'soon';

export default function Index() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const {
    wateringTasks,
    waterPlant,
    loading,
  } = usePlants();

  // Filter tasks based on active tab
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = wateringTasks.filter(task => {
    const nextDate = new Date(task.nextWateringDate);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate <= today;
  });

  const soonTasks = wateringTasks.filter(task => {
    const nextDate = new Date(task.nextWateringDate);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate > today;
  });

  const displayedTasks = activeTab === 'today' ? todayTasks : soonTasks;

  const tabs: Tab<TabType>[] = [
    { value: 'today', label: 'Today' },
    { value: 'soon', label: 'Soon' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Bar */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

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
                isSelected={false}
                onToggleSelect={() => waterPlant(task.plantId)}
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

        {/* Bottom spacing for floating button */}
        <View style={styles.bottomSpacer} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for bottom nav
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
});
