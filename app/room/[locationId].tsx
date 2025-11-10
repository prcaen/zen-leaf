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
import { SettingsSection } from '../../src/components/detail/SettingsSection';
import { PlantCard } from '../../src/components/PlantCard';
import { SelectionDialog, SelectionOption } from '../../src/components/SelectionDialog';
import { SliderDialog } from '../../src/components/SliderDialog';
import { Tab, TabBar } from '../../src/components/TabBar';
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
    updateLocation,
  } = usePlants();

  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Dialog states
  const [showTemperatureDialog, setShowTemperatureDialog] = useState(false);
  const [showHumidityDialog, setShowHumidityDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showACDialog, setShowACDialog] = useState(false);
  const [showHeaterDialog, setShowHeaterDialog] = useState(false);

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

  // Handlers for settings
  const handleTemperaturePress = () => {
    setShowTemperatureDialog(true);
  };

  const handleChangeTemperature = async (temperature: number) => {
    const currentSettings = location?.settings || {};
    await updateLocation(locationId, {
      settings: {
        ...currentSettings,
        temperature,
      },
    });
  };

  const handleHumidityPress = () => {
    setShowHumidityDialog(true);
  };

  const handleChangeHumidity = async (humidity: number) => {
    const currentSettings = location?.settings || {};
    await updateLocation(locationId, {
      settings: {
        ...currentSettings,
        humidity,
      },
    });
  };

  const handleLocationPress = () => {
    setShowLocationDialog(true);
  };

  const handleChangeLocation = async (selectedId: string) => {
    const currentSettings = location?.settings || {};
    await updateLocation(locationId, {
      settings: {
        ...currentSettings,
        isIndoor: selectedId === 'indoor',
      },
    });
  };

  const handleACPress = () => {
    setShowACDialog(true);
  };

  const handleChangeAC = async (selectedId: string) => {
    const currentSettings = location?.settings || {};
    await updateLocation(locationId, {
      settings: {
        ...currentSettings,
        isNearAC: selectedId === 'yes',
      },
    });
  };

  const handleHeaterPress = () => {
    setShowHeaterDialog(true);
  };

  const handleChangeHeater = async (selectedId: string) => {
    const currentSettings = location?.settings || {};
    await updateLocation(locationId, {
      settings: {
        ...currentSettings,
        isNearHeater: selectedId === 'yes',
      },
    });
  };

  const locationOptions: SelectionOption[] = [
    { id: 'indoor', label: 'Indoor', icon: 'home-outline' },
    { id: 'outdoor', label: 'Outdoor', icon: 'sunny-outline' },
  ];

  const yesNoOptions: SelectionOption[] = [
    { id: 'yes', label: 'Yes', icon: 'checkmark-circle-outline' },
    { id: 'no', label: 'No', icon: 'close-circle-outline' },
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

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <SettingsSection
            title="Room"
            items={[
              {
                icon: 'thermometer-outline',
                label: 'Temperature',
                value: location.settings?.temperature
                  ? `${location.settings.temperature}°C`
                  : 'Not set',
                onPress: handleTemperaturePress,
              },
              {
                icon: 'water-outline',
                label: 'Humidity',
                value: location.settings?.humidity
                  ? `${location.settings.humidity}%`
                  : 'Not set',
                onPress: handleHumidityPress,
              },
              {
                icon: 'location-outline',
                label: 'Location',
                value:
                  location.settings?.isIndoor === true
                    ? 'Indoor'
                    : location.settings?.isIndoor === false
                      ? 'Outdoor'
                      : 'Not set',
                onPress: handleLocationPress,
              },
              {
                icon: 'snow-outline',
                label: 'Near A/C',
                value:
                  location.settings?.isNearAC === true
                    ? 'Yes'
                    : location.settings?.isNearAC === false
                      ? 'No'
                      : 'Not set',
                onPress: handleACPress,
              },
              {
                icon: 'flame-outline',
                label: 'Near Heater',
                value:
                  location.settings?.isNearHeater === true
                    ? 'Yes'
                    : location.settings?.isNearHeater === false
                      ? 'No'
                      : 'Not set',
                onPress: handleHeaterPress,
              },
            ]}
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Temperature Dialog */}
      <SliderDialog
        visible={showTemperatureDialog}
        onClose={() => setShowTemperatureDialog(false)}
        onConfirm={handleChangeTemperature}
        title="Temperature"
        initialValue={location.settings?.temperature || 20}
        minValue={0}
        maxValue={40}
        step={1}
        unit="°C"
        confirmText="Save"
        cancelText="Cancel"
        icon="thermometer-outline"
        iconColor={theme.colors.primary}
      />

      {/* Humidity Dialog */}
      <SliderDialog
        visible={showHumidityDialog}
        onClose={() => setShowHumidityDialog(false)}
        onConfirm={handleChangeHumidity}
        title="Humidity"
        initialValue={location.settings?.humidity || 50}
        minValue={0}
        maxValue={100}
        step={5}
        unit="%"
        confirmText="Save"
        cancelText="Cancel"
        icon="water-outline"
        iconColor={theme.colors.primary}
      />

      {/* Location Dialog */}
      <SelectionDialog
        visible={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onConfirm={handleChangeLocation}
        title="Location"
        options={locationOptions}
        initialSelectedId={
          location.settings?.isIndoor === true
            ? 'indoor'
            : location.settings?.isIndoor === false
              ? 'outdoor'
              : 'indoor'
        }
        confirmText="Save"
        cancelText="Cancel"
        icon="location-outline"
        iconColor={theme.colors.primary}
      />

      {/* Near A/C Dialog */}
      <SelectionDialog
        visible={showACDialog}
        onClose={() => setShowACDialog(false)}
        onConfirm={handleChangeAC}
        title="Near A/C"
        options={yesNoOptions}
        initialSelectedId={
          location.settings?.isNearAC === true
            ? 'yes'
            : location.settings?.isNearAC === false
              ? 'no'
              : 'no'
        }
        confirmText="Save"
        cancelText="Cancel"
        icon="snow-outline"
        iconColor={theme.colors.primary}
      />

      {/* Near Heater Dialog */}
      <SelectionDialog
        visible={showHeaterDialog}
        onClose={() => setShowHeaterDialog(false)}
        onConfirm={handleChangeHeater}
        title="Near Heater"
        options={yesNoOptions}
        initialSelectedId={
          location.settings?.isNearHeater === true
            ? 'yes'
            : location.settings?.isNearHeater === false
              ? 'no'
              : 'no'
        }
        confirmText="Save"
        cancelText="Cancel"
        icon="flame-outline"
        iconColor={theme.colors.primary}
      />
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
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});

