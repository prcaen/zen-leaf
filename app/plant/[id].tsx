import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionCard } from '../../src/components/detail/ActionCard';
import { HistoryList } from '../../src/components/detail/HistoryList';
import { PlantHeader } from '../../src/components/detail/PlantHeader';
import { SettingsSection } from '../../src/components/detail/SettingsSection';
import { TasksList } from '../../src/components/detail/TasksList';
import { InfoDialog } from '../../src/components/InfoDialog';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getPlantById,
    locations,
    getCareTasks,
    getCareHistory,
    completeCareTask,
  } = usePlants();

  const plant = getPlantById(id);
  const location = plant ? locations.find(l => l.id === plant.locationId) : undefined;
  const plantTasks = getCareTasks(id);
  const plantHistory = getCareHistory(id);

  // Separate tasks by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = useMemo(
    () =>
      plantTasks.filter(task => {
        const dueDate = new Date(task.nextDueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate <= today;
      }),
    [plantTasks, today]
  );

  const soonTasks = useMemo(
    () =>
      plantTasks.filter(task => {
        const dueDate = new Date(task.nextDueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate > today;
      }),
    [plantTasks, today]
  );

  // Dialog state
  const [dialogInfo, setDialogInfo] = useState<{
    visible: boolean;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    content: string;
    value: string;
  } | null>(null);

  if (!plant || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plant not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleTaskPress = async (taskId: string) => {
    await completeCareTask(taskId, id);
  };

  const handleModifySettings = () => {
    // TODO: Navigate to settings screen
    console.log('Modify settings');
  };

  const handleGrowSpeedPress = () => {
    const careInfo = plant.careInfo;
    const speed = careInfo?.growSpeed || 'moderate';
    const descriptions = {
      slow: 'This plant grows slowly and may take months or even years to reach maturity. Perfect for those who want low-maintenance greenery.',
      moderate: 'This plant has a moderate growth rate, showing visible progress over weeks to months. Ideal for most indoor gardeners.',
      fast: 'This plant grows rapidly and may need regular pruning or repotting. Great for seeing quick results!',
    };
    setDialogInfo({
      visible: true,
      title: 'Growth Speed',
      icon: 'speedometer-outline',
      iconColor: theme.colors.primaryLight,
      content: careInfo?.growSpeedDescription || descriptions[speed],
      value: speed,
    });
  };

  const handleLightNeededPress = () => {
    const careInfo = plant.careInfo;
    const light = careInfo?.lightNeeded || 'medium';
    const descriptions = {
      low: 'This plant thrives in low light conditions and can be placed away from windows. Perfect for darker rooms or offices.',
      medium: 'This plant prefers bright, indirect light. Place near a window with filtered sunlight or in a well-lit room.',
      high: 'This plant needs bright, direct sunlight for several hours a day. Best placed near south-facing windows.',
    };
    setDialogInfo({
      visible: true,
      title: 'Light Requirements',
      icon: 'sunny-outline',
      iconColor: '#FDB813',
      content: careInfo?.lightNeededDescription || descriptions[light],
      value: light,
    });
  };

  const handleToxicityPress = () => {
    const careInfo = plant.careInfo;
    const toxicity = careInfo?.toxicity || 'non-toxic';
    const descriptions = {
      'non-toxic': 'This plant is safe for both pets and humans. You can display it anywhere without worry!',
      'toxic-pets': 'This plant can be harmful to pets if ingested. Keep it out of reach of cats and dogs.',
      'toxic-humans': 'This plant can cause irritation or illness in humans if ingested or touched. Handle with care.',
      'toxic-all': 'This plant is toxic to both pets and humans. Keep it in a safe location away from children and animals.',
    };
    setDialogInfo({
      visible: true,
      title: 'Toxicity Information',
      icon: 'warning-outline',
      iconColor: careInfo?.toxicity === 'non-toxic' ? '#34C759' : '#FF3B30',
      content: careInfo?.toxicityDescription || descriptions[toxicity],
      value: toxicity.replace('-', ' '),
    });
  };

  const handleWaterNeededPress = () => {
    const careInfo = plant.careInfo;
    const water = careInfo?.waterNeeded || 'moderate';
    const descriptions = {
      low: 'This plant requires infrequent watering. Allow soil to dry out completely between waterings. Perfect for forgetful plant parents!',
      moderate: 'This plant needs regular watering. Keep soil slightly moist but not waterlogged. Water when the top inch of soil is dry.',
      high: 'This plant loves water and needs frequent watering. Keep soil consistently moist. Check daily during hot weather.',
    };
    setDialogInfo({
      visible: true,
      title: 'Water Requirements',
      icon: 'water-outline',
      iconColor: '#007AFF',
      content: careInfo?.waterNeededDescription || descriptions[water],
      value: water,
    });
  };

  const closeDialog = () => {
    setDialogInfo(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plant Header */}
        <PlantHeader
          name={plant.name}
          location={location.name}
          imageUrl={plant.imageUrl}
        />

        {/* Action Cards */}
        <View style={styles.section}>
          <View style={styles.actionCardsGrid}>
            <ActionCard
              icon="speedometer-outline"
              title="Growth Speed"
              subtitle={plant.careInfo?.growSpeed || 'Moderate'}
              color={theme.colors.primaryLight}
              onPress={handleGrowSpeedPress}
            />
            <ActionCard
              icon="sunny-outline"
              title="Light Needed"
              subtitle={plant.careInfo?.lightNeeded || 'Medium'}
              color={theme.colors.primaryLight}
              onPress={handleLightNeededPress}
            />
            <ActionCard
              icon="warning-outline"
              title="Toxicity"
              subtitle={
                plant.careInfo?.toxicity
                  ? plant.careInfo.toxicity.replace('-', ' ')
                  : 'Non-toxic'
              }
              color={
                plant.careInfo?.toxicity === 'non-toxic' || !plant.careInfo?.toxicity
                  ? theme.colors.primaryLight
                  : '#FF3B30'
              }
              onPress={handleToxicityPress}
            />
            <ActionCard
              icon="water-outline"
              title="Water Needed"
              subtitle={plant.careInfo?.waterNeeded || 'Moderate'}
              color={theme.colors.primaryLight}
              onPress={handleWaterNeededPress}
            />
          </View>
        </View>

        {/* Today Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <TasksList tasks={todayTasks} onTaskPress={handleTaskPress} />
        </View>

        {/* Soon Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soon</Text>
          <View style={styles.soonContainer}>
            <TasksList tasks={soonTasks} />
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>History</Text>
            <TouchableOpacity>
              <Text style={styles.moreLink}>More history</Text>
            </TouchableOpacity>
          </View>
          <HistoryList history={plantHistory} limit={3} />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Program based on:</Text>

          <SettingsSection
            title="Light"
            items={[
              {
                icon: 'sunny-outline',
                label: 'Medium',
                value: 'Indirect light',
                onPress: () => console.log('Light settings'),
              },
              {
                icon: 'time-outline',
                label: 'Day',
                value: '8-12 hours',
                onPress: () => console.log('Day settings'),
              },
              {
                icon: 'moon-outline',
                label: 'Night',
                value: 'Dark period',
                onPress: () => console.log('Night settings'),
              },
            ]}
          />

          <SettingsSection
            title="Pot"
            items={[
              {
                icon: 'resize-outline',
                label: 'Size',
                value: '6 inch pot',
                onPress: () => console.log('Pot size'),
              },
              {
                icon: 'water-outline',
                label: 'Drainage',
                value: 'Good drainage',
                onPress: () => console.log('Drainage'),
              },
            ]}
          />

          <SettingsSection
            title="Plant"
            items={[
              {
                icon: 'leaf-outline',
                label: 'Type',
                value: plant.settings?.plantType?.category || 'Not set',
                onPress: () => console.log('Plant type'),
              },
              {
                icon: 'information-circle-outline',
                label: 'Variety',
                value: plant.settings?.plantType?.variety || 'Not set',
                onPress: () => console.log('Variety'),
              },
            ]}
          />

          <SettingsSection
            title="Room / Date"
            items={[
              {
                icon: 'thermometer-outline',
                label: 'Temperature',
                value: plant.settings?.room?.temperature ? `${plant.settings.room.temperature}°C` : 'Not set',
                onPress: () => console.log('Temperature'),
              },
              {
                icon: 'water-outline',
                label: 'Humidity',
                value: plant.settings?.room?.humidity ? `${plant.settings.room.humidity}%` : 'Not set',
                onPress: () => console.log('Humidity'),
              },
            ]}
          />

          <SettingsSection
            title="Location & Weather"
            items={[
              {
                icon: 'location-outline',
                label: 'Location',
                value: plant.settings?.location?.isIndoor ? 'Indoor' : 'Outdoor',
                onPress: () => console.log('Location'),
              },
              {
                icon: 'partly-sunny-outline',
                label: 'Climate',
                value: plant.settings?.location?.climate || 'Not set',
                onPress: () => console.log('Climate'),
              },
            ]}
          />

          <TouchableOpacity style={styles.modifyButton} onPress={handleModifySettings}>
            <Text style={styles.modifyButtonText}>Modify settings</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Info Dialog */}
      {dialogInfo && (
        <InfoDialog
          visible={dialogInfo.visible}
          onClose={closeDialog}
          title={dialogInfo.title}
          icon={dialogInfo.icon}
          iconColor={dialogInfo.iconColor}
          content={dialogInfo.content}
          value={dialogInfo.value}
        />
      )}
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  moreLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  actionCards: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  soonContainer: {
    gap: theme.spacing.md,
  },
  unlockButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  modifyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  modifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
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

