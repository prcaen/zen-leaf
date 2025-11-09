import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PlantCard } from '../src/components/PlantCard';
import { TabBar } from '../src/components/TabBar';
import { TaskSection } from '../src/components/TaskSection';
import { usePlants } from '../src/state/PlantsContext';
import { theme } from '../src/theme';
import { TabType } from '../src/types';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const {
    wateringTasks,
    waterPlant,
    loading,
    plants,
    initializeWithSampleData,
  } = usePlants();

  // Initialize with sample data if no plants exist
  useEffect(() => {
    if (!loading && plants.length === 0) {
      initializeWithSampleData();
    }
  }, [loading, plants.length]);

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
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

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
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <Ionicons name="add" size={32} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
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
    height: 80,
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 90,
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  navIconActive: {
    backgroundColor: theme.colors.sageLight,
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
