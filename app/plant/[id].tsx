import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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

  // Scroll state for sticky header
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const headerTitleOpacity = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Show title when scrolled past the plant header (around 250px)
    const shouldShow = offsetY > 250;

    if (shouldShow !== showHeaderTitle) {
      setShowHeaderTitle(shouldShow);
    }
  };

  useEffect(() => {
    Animated.timing(headerTitleOpacity, {
      toValue: showHeaderTitle ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showHeaderTitle]);

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

  const handleDeletePlant = () => {
    // TODO: Delete plant
    console.log('Delete plant');
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
        <Animated.View
          style={[
            styles.headerTitleContainer,
            { opacity: headerTitleOpacity }
          ]}
          pointerEvents={showHeaderTitle ? 'auto' : 'none'}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {plant.name}
          </Text>
        </Animated.View>
        <TouchableOpacity style={styles.headerButton}>
          <TouchableOpacity style={styles.headerButton} onPress={handleDeletePlant}>
            <Ionicons name="trash-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
              icon="water-outline"
              title="Water Needed"
              subtitle={plant.careInfo?.waterNeeded || 'Moderate'}
              color={theme.colors.primaryLight}
              onPress={handleWaterNeededPress}
            />
            <ActionCard
              icon="leaf-outline"
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
                value: plant.settings?.light?.level || 'Not set',
                onPress: () => console.log('Light settings'),
              },
              {
                icon: 'swap-horizontal-outline',
                label: 'Distance from window',
                value: plant.settings?.light?.distanceFromWindow
                  ? `${plant.settings.light.distanceFromWindow.toString()} cm`
                  : 'Not set',
                onPress: () => console.log('Distance from window'),
              },
            ]}
          />

          <SettingsSection
            title="Pot"
            items={[
              {
                icon: 'resize-outline',
                label: 'Size',
                value: plant.settings?.pot?.size || 'Not set',
                onPress: () => console.log('Pot size'),
              },
              {
                icon: 'water-outline',
                label: 'Drainage',
                value: plant.settings?.pot?.hasDrainage ? 'Yes' : 'Not set',
                onPress: () => console.log('Drainage'),
              },
              {
                icon: 'flower-outline',
                label: 'Soil',
                value: plant.settings?.pot?.soil || 'Not set',
                onPress: () => console.log('Soil'),
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
              {
                icon: 'expand-outline',
                label: 'Size',
                value: plant.settings?.plantType?.size || 'Not set',
                onPress: () => console.log('Size'),
              },
              {
                icon: 'time-outline',
                label: 'Age',
                value: plant.createdAt
                  ? (() => {
                    const createdDate = new Date(plant.createdAt);
                    const now = new Date();
                    const diffMs = now.getTime() - createdDate.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    if (diffDays < 1) return 'Less than a day';
                    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                    const months = Math.floor(diffDays / 30.44);
                    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
                    const years = Math.floor(months / 12);
                    return `${years} year${years !== 1 ? 's' : ''}`;
                  })()
                  : 'Not set',
                onPress: () => console.log('Age'),
              },
            ]}
          />

          <SettingsSection
            title="Room"
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
              {
                icon: 'location-outline',
                label: 'Location',
                value: plant.settings?.room?.isIndoor ? 'Indoor' : 'Outdoor',
                onPress: () => console.log('Location'),
              },
              {
                icon: 'snow-outline',
                label: 'Near A/C',
                value: plant.settings?.room?.isNearAC === true
                  ? 'Yes'
                  : plant.settings?.room?.isNearAC === false
                    ? 'No'
                    : 'Not set',
                onPress: () => console.log('Near A/C'),
              },
              {
                icon: 'flame-outline',
                label: 'Near Heater',
                value:
                  plant.settings?.room?.isNearHeater === true
                    ? 'Yes'
                    : plant.settings?.room?.isNearHeater === false
                      ? 'No'
                      : 'Not set',
                onPress: () => console.log('Near Heater'),
              },
            ]}
          />

          {!plant.settings?.room?.isIndoor && (
            <SettingsSection
              title="Outdoor Settings"
              items={[
                {
                  icon: 'partly-sunny-outline',
                  label: 'Climate',
                  value: plant.settings?.location?.climate || 'Not set',
                  onPress: () => console.log('Climate'),
                },
                {
                  icon: 'calendar-outline',
                  label: 'Current Month',
                  value: new Date().toLocaleString('default', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('default', { month: 'long' }).slice(1),
                  onPress: () => console.log('Current Month'),
                },
                {
                  icon: 'thermometer-outline',
                  label: 'Min Temp',
                  value:
                    plant.settings?.location?.temperature?.min != null
                      ? `${plant.settings.location.temperature.min}°C`
                      : 'Not set',
                  onPress: () => console.log('Min Temp'),
                },
                {
                  icon: 'thermometer-outline',
                  label: 'Max Temp',
                  value:
                    plant.settings?.location?.temperature?.max != null
                      ? `${plant.settings.location.temperature.max}°C`
                      : 'Not set',
                  onPress: () => console.log('Max Temp'),
                },
                {
                  icon: 'pin-outline',
                  label: 'City',
                  value: plant.settings?.location?.city || 'Not set',
                  onPress: () => console.log('City'),
                },
              ]}
            />
          )}
        </View>
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
    backgroundColor: theme.colors.sage,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
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
});

