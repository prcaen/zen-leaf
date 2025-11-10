import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { SettingsSection } from '../../src/components/detail/SettingsSection';
import { PlantCard } from '../../src/components/PlantCard';
import { SelectionDialog, SelectionOption } from '../../src/components/SelectionDialog';
import { SliderDialog } from '../../src/components/SliderDialog';
import { Tab, TabBar } from '../../src/components/TabBar';
import { TaskSection } from '../../src/components/TaskSection';
import { TextInputDialog } from '../../src/components/TextInputDialog';
import {
  formatTemperature,
  getDisplayTemperature,
  getTemperatureUnit,
  parseTemperature,
} from '../../src/lib/number';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';
import { LightLevel, UnitSystem } from '../../src/types';

type TabType = 'today' | 'soon';

export default function RoomDetailScreen() {
  const { roomId, dialog } = useLocalSearchParams<{ roomId: string; dialog?: string }>();
  const router = useRouter();
  const {
    plants,
    getRoomById,
    wateringTasks,
    selectedPlants,
    togglePlantSelection,
    updateRoom,
    user,
  } = usePlants();

  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Dialog states
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showTemperatureDialog, setShowTemperatureDialog] = useState(false);
  const [showHumidityDialog, setShowHumidityDialog] = useState(false);
  const [showLightLevelDialog, setShowLightLevelDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);

  const room = getRoomById(roomId);
  const plantsInRoom = plants.filter(p => p.roomId === roomId);

  // Open dialog based on query parameter
  useEffect(() => {
    if (dialog) {
      switch (dialog) {
        case 'temperature':
          setShowTemperatureDialog(true);
          break;
        case 'humidity':
          setShowHumidityDialog(true);
          break;
        case 'lightLevel':
          setShowLightLevelDialog(true);
          break;
        case 'location':
          setShowRoomDialog(true);
          break;
      }
    }
  }, [dialog]);

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
  const handleNamePress = () => {
    setShowRenameDialog(true);
  };

  const handleRename = async (newName: string) => {
    await updateRoom(roomId, { name: newName });
  };

  const handleTemperaturePress = () => {
    setShowTemperatureDialog(true);
  };

  const handleChangeTemperature = async (temperature: number) => {
    const currentSettings = room?.settings || {};
    const unitSystem = user?.unitSystem || UnitSystem.METRIC;

    // Convert from display value to metric for storage
    const temperatureInCelsius = parseTemperature(temperature, unitSystem);

    await updateRoom(roomId, {
      settings: {
        ...currentSettings,
        temperature: temperatureInCelsius,
      },
    });
  };

  const handleHumidityPress = () => {
    setShowHumidityDialog(true);
  };

  const handleChangeHumidity = async (humidity: number) => {
    const currentSettings = room?.settings || {};
    await updateRoom(roomId, {
      settings: {
        ...currentSettings,
        humidity,
      },
    });
  };

  const handleLightLevelPress = () => {
    setShowLightLevelDialog(true);
  };

  const handleChangeLightLevel = async (newLevel: string) => {
    const currentSettings = room?.settings || {};
    await updateRoom(roomId, {
      settings: {
        ...currentSettings,
        lightLevel: newLevel as LightLevel,
      },
    });
  };

  const handleRoomPress = () => {
    setShowRoomDialog(true);
  };

  const handleChangeRoom = async (selectedId: string) => {
    const currentSettings = room?.settings || {};
    await updateRoom(roomId, {
      settings: {
        ...currentSettings,
        isIndoor: selectedId === 'indoor',
      },
    });
  };

  const lightLevelOptions: SelectionOption[] = [
    { id: LightLevel.SUN, label: 'Sun', icon: 'sunny-outline' },
    { id: LightLevel.PART_SUN, label: 'Part Sun', icon: 'partly-sunny-outline' },
    { id: LightLevel.SHADE, label: 'Shade', icon: 'cloudy-outline' },
    { id: LightLevel.DARK, label: 'Dark', icon: 'moon-outline' },
  ];

  const roomOptions: SelectionOption[] = [
    { id: 'indoor', label: 'Indoor', icon: 'home-outline' },
    { id: 'outdoor', label: 'Outdoor', icon: 'sunny-outline' },
  ];

  const yesNoOptions: SelectionOption[] = [
    { id: 'yes', label: 'Yes', icon: 'checkmark-circle-outline' },
    { id: 'no', label: 'No', icon: 'close-circle-outline' },
  ];

  if (!room) {
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
          <Text style={styles.headerTitle}>{room.name}</Text>
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
        <SettingsSection
          title="Settings"
          items={[
            {
              icon: 'home-outline',
              label: 'Name',
              value: room.name,
              onPress: handleNamePress,
            },
            {
              icon: 'thermometer-outline',
              label: 'Temperature',
              value: room.settings?.temperature
                ? formatTemperature(room.settings.temperature, user?.unitSystem || UnitSystem.METRIC)
                : 'Not set',
              onPress: handleTemperaturePress,
            },
            {
              icon: 'water-outline',
              label: 'Humidity',
              value: room.settings?.humidity
                ? `${room.settings.humidity}%`
                : 'Not set',
              onPress: handleHumidityPress,
            },
            {
              icon: 'sunny-outline',
              label: 'Light level',
              value: room.settings?.lightLevel
                ? lightLevelOptions.find(opt => opt.id === room.settings?.lightLevel)?.label || room.settings.lightLevel
                : 'Not set',
              onPress: handleLightLevelPress,
            },
            {
              icon: 'location-outline',
              label: 'Location',
              value:
                room.settings?.isIndoor === true
                  ? 'Indoor'
                  : room.settings?.isIndoor === false
                    ? 'Outdoor'
                    : 'Not set',
              onPress: handleRoomPress,
            },
          ]}
        />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Temperature Dialog */}
      <SliderDialog
        visible={showTemperatureDialog}
        onClose={() => setShowTemperatureDialog(false)}
        onConfirm={handleChangeTemperature}
        title="Temperature"
        initialValue={room.settings?.temperature
          ? getDisplayTemperature(room.settings.temperature, user?.unitSystem || UnitSystem.METRIC)
          : (user?.unitSystem === UnitSystem.IMPERIAL ? 68 : 20)}
        minValue={user?.unitSystem === UnitSystem.IMPERIAL ? 32 : 0}
        maxValue={user?.unitSystem === UnitSystem.IMPERIAL ? 104 : 40}
        step={1}
        unit={getTemperatureUnit(user?.unitSystem || UnitSystem.METRIC)}
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
        initialValue={room.settings?.humidity || 50}
        minValue={0}
        maxValue={100}
        step={5}
        unit="%"
        confirmText="Save"
        cancelText="Cancel"
        icon="water-outline"
        iconColor={theme.colors.primary}
      />

      {/* Light Level Dialog */}
      <SelectionDialog
        visible={showLightLevelDialog}
        onClose={() => setShowLightLevelDialog(false)}
        onConfirm={handleChangeLightLevel}
        title="Light Level"
        description="Select the light level available in this room."
        options={lightLevelOptions}
        initialSelectedId={room.settings?.lightLevel || LightLevel.PART_SUN}
        confirmText="Save"
        cancelText="Cancel"
        icon="sunny-outline"
        iconColor={theme.colors.primary}
      />

      {/* Room Dialog */}
      <SelectionDialog
        visible={showRoomDialog}
        onClose={() => setShowRoomDialog(false)}
        onConfirm={handleChangeRoom}
        title="Location"
        options={roomOptions}
        initialSelectedId={
          room.settings?.isIndoor === true
            ? 'indoor'
            : room.settings?.isIndoor === false
              ? 'outdoor'
              : 'indoor'
        }
        confirmText="Save"
        cancelText="Cancel"
        icon="location-outline"
        iconColor={theme.colors.primary}
      />

      {/* Rename Dialog */}
      <TextInputDialog
        visible={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onConfirm={handleRename}
        title="Rename Room"
        initialValue={room.name}
        placeholder="Enter room name"
        confirmText="Save"
        cancelText="Cancel"
        icon="create-outline"
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});

