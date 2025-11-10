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
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { ActionCard } from '../../src/components/detail/ActionCard';
import { HistoryList } from '../../src/components/detail/HistoryList';
import { PlantHeader } from '../../src/components/detail/PlantHeader';
import { SettingsSection } from '../../src/components/detail/SettingsSection';
import { TasksList } from '../../src/components/detail/TasksList';
import { InfoDialog } from '../../src/components/InfoDialog';
import { SelectionDialog, SelectionOption } from '../../src/components/SelectionDialog';
import { SliderDialog } from '../../src/components/SliderDialog';
import { TextInputDialog } from '../../src/components/TextInputDialog';
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
    deletePlant,
    updatePlant,
  } = usePlants();

  const plant = getPlantById(id);
  const location = plant ? locations.find(l => l.id === plant.locationId) : undefined;
  const plantTasks = getCareTasks(id);
  const plantHistory = getCareHistory(id);

  const handleRoomSettingPress = (dialogType: string) => {
    if (plant?.locationId) {
      router.push(`/room/${plant.locationId}?dialog=${dialogType}`);
    }
  };

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

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Rename dialog state
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  // Change room dialog state
  const [showChangeRoomDialog, setShowChangeRoomDialog] = useState(false);

  // Change light level dialog state
  const [showLightLevelDialog, setShowLightLevelDialog] = useState(false);

  // Change distance from window dialog state
  const [showDistanceDialog, setShowDistanceDialog] = useState(false);

  // Change pot size dialog state
  const [showPotSizeDialog, setShowPotSizeDialog] = useState(false);

  // Change drainage dialog state
  const [showDrainageDialog, setShowDrainageDialog] = useState(false);

  // Change soil dialog state
  const [showSoilDialog, setShowSoilDialog] = useState(false);

  // Change plant size dialog state
  const [showPlantSizeDialog, setShowPlantSizeDialog] = useState(false);

  // Change age/year dialog state
  const [showAgeDialog, setShowAgeDialog] = useState(false);

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
      iconColor: theme.colors.primaryLight,
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
      iconColor: theme.colors.primaryLight,
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
      iconColor: theme.colors.primaryLight,
      content: careInfo?.waterNeededDescription || descriptions[water],
      value: water,
    });
  };

  const closeDialog = () => {
    setDialogInfo(null);
  };

  const handleDeletePress = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await deletePlant(id);
    router.back();
  };

  const handleNamePress = () => {
    setShowRenameDialog(true);
  };

  const handleRename = async (newName: string) => {
    await updatePlant(id, { name: newName });
  };

  const handleLocationPress = () => {
    setShowChangeRoomDialog(true);
  };

  const handleChangeRoom = async (newLocationId: string) => {
    await updatePlant(id, { locationId: newLocationId });
  };

  const roomOptions: SelectionOption[] = locations.map(loc => ({
    id: loc.id,
    label: loc.name,
  }));

  const lightLevelOptions: SelectionOption[] = [
    { id: 'low', label: 'Low Light', icon: 'moon-outline' },
    { id: 'medium', label: 'Medium Light', icon: 'partly-sunny-outline' },
    { id: 'high', label: 'High Light', icon: 'sunny-outline' },
  ];

  const handleLightLevelPress = () => {
    setShowLightLevelDialog(true);
  };

  const handleChangeLightLevel = async (newLevel: string) => {
    const currentSettings = plant.settings || {};
    const currentLight = currentSettings.light || { level: 'medium', type: 'indirect' };
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        light: {
          ...currentLight,
          level: newLevel as 'low' | 'medium' | 'high',
        },
      },
    });
  };

  const handleDistancePress = () => {
    setShowDistanceDialog(true);
  };

  const handleChangeDistance = async (newDistance: number) => {
    const currentSettings = plant.settings || {};
    const currentLight = currentSettings.light || { level: 'medium', type: 'indirect' };
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        light: {
          ...currentLight,
          distanceFromWindow: newDistance,
        },
      },
    });
  };

  const handlePotSizePress = () => {
    setShowPotSizeDialog(true);
  };

  const handleChangePotSize = async (newSize: number) => {
    const currentSettings = plant.settings || {};
    const currentPot = currentSettings.pot || { size: 30, hasDrainage: true };
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        pot: {
          ...currentPot,
          size: newSize,
        },
      },
    });
  };

  const getPotSizeLabel = (size: number): string => {
    if (size <= 30) return 'Small';
    if (size <= 60) return 'Medium';
    return 'Large';
  };

  const handleDrainagePress = () => {
    setShowDrainageDialog(true);
  };

  const handleChangeDrainage = async (hasDrainage: string) => {
    const currentSettings = plant.settings || {};
    const currentPot = currentSettings.pot || { size: 30, hasDrainage: true };
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        pot: {
          ...currentPot,
          hasDrainage: hasDrainage === 'yes',
        },
      },
    });
  };

  const drainageOptions: SelectionOption[] = [
    { id: 'yes', label: 'Yes, my pot has a drainage', icon: 'checkmark-circle-outline' },
    { id: 'no', label: 'No, no drainage', icon: 'close-circle-outline' },
  ];

  const soilOptions: SelectionOption[] = [
    { id: 'all-purpose-potting-mix', label: 'All-purpose potting mix' },
    { id: 'all-purpose-garden-soil', label: 'All purpose garden soil' },
    { id: 'sandy-soil', label: 'Sandy Soil' },
    { id: 'clay-soil', label: 'Clay Soil' },
  ];

  const handleSoilPress = () => {
    setShowSoilDialog(true);
  };

  const handleChangeSoil = async (soilType: string) => {
    const currentSettings = plant.settings || {};
    const currentPot = currentSettings.pot || { size: 30, hasDrainage: true };
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        pot: {
          ...currentPot,
          soil: soilType,
        },
      },
    });
  };

  const handlePlantSizePress = () => {
    setShowPlantSizeDialog(true);
  };

  const handleChangePlantSize = async (newSize: number) => {
    const currentSettings = plant.settings || {};
    const currentPlantType = currentSettings.plantType || {};
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        plantType: {
          ...currentPlantType,
          size: newSize,
        },
      },
    });
  };

  const handleAgePress = () => {
    setShowAgeDialog(true);
  };

  const handleChangeAge = async (age: number) => {
    const currentSettings = plant.settings || {};
    const currentPlantType = currentSettings.plantType || {};
    
    await updatePlant(id, {
      settings: {
        ...currentSettings,
        plantType: {
          ...currentPlantType,
          age: age,
        },
      },
    });
  };

  // Calculate age display
  const getAgeDisplay = (): string => {
    const age = plant.settings?.plantType?.age;
    if (age !== undefined) {
      if (age === 0) return 'Less than a year';
      if (age === 1) return '1 year';
      if (age >= 50) return '50 years and more';
      return `${age} years`;
    }
    
    // Fallback to createdAt calculation
    if (plant.createdAt) {
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
    }
    
    return 'Not set';
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
        <TouchableOpacity style={styles.headerButton} onPress={handleDeletePress}>
          <Ionicons name="trash-outline" size={24} color={theme.colors.text} />
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
          onNamePress={handleNamePress}
          onLocationPress={handleLocationPress}
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
              color={theme.colors.primaryLight}
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
          <Text style={styles.sectionTitle}>Settings</Text>

          <SettingsSection
            title="Light"
            items={[
              {
                icon: 'sunny-outline',
                label: 'Light level',
                value: plant.settings?.light?.level || 'Not set',
                onPress: handleLightLevelPress,
              },
              {
                icon: 'swap-horizontal-outline',
                label: 'Distance from window',
                value: plant.settings?.light?.distanceFromWindow
                  ? `${plant.settings.light.distanceFromWindow} cm`
                  : 'Not set',
                onPress: handleDistancePress,
              },
            ]}
          />

          <SettingsSection
            title="Pot"
            items={[
              {
                icon: 'resize-outline',
                label: 'Size',
                value: plant.settings?.pot?.size 
                  ? `${plant.settings.pot.size} cm (${getPotSizeLabel(plant.settings.pot.size)})` 
                  : 'Not set',
                onPress: handlePotSizePress,
              },
              {
                icon: 'water-outline',
                label: 'Drainage',
                value:
                  plant.settings?.pot?.hasDrainage == null
                    ? 'Not set'
                    : plant.settings.pot.hasDrainage
                      ? 'Yes'
                      : 'No',
                onPress: handleDrainagePress,
              },
              {
                icon: 'flower-outline',
                label: 'Soil',
                value: plant.settings?.pot?.soil 
                  ? soilOptions.find(s => s.id === plant.settings?.pot?.soil)?.label || 'Not set'
                  : 'Not set',
                onPress: handleSoilPress,
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
                value: plant.settings?.plantType?.size 
                  ? `${plant.settings.plantType.size} cm` 
                  : 'Not set',
                onPress: handlePlantSizePress,
              },
              {
                icon: 'time-outline',
                label: 'Age',
                value: getAgeDisplay(),
                onPress: handleAgePress,
              },
            ]}
          />

          <SettingsSection
            title="Room"
            items={[
              {
                icon: 'thermometer-outline',
                label: 'Temperature',
                value: location?.settings?.temperature
                  ? `${location.settings.temperature}°C`
                  : 'Not set',
                onPress: () => handleRoomSettingPress('temperature'),
              },
              {
                icon: 'water-outline',
                label: 'Humidity',
                value: location?.settings?.humidity
                  ? `${location.settings.humidity}%`
                  : 'Not set',
                onPress: () => handleRoomSettingPress('humidity'),
              },
              {
                icon: 'location-outline',
                label: 'Location',
                value:
                  location?.settings?.isIndoor === true
                    ? 'Indoor'
                    : location?.settings?.isIndoor === false
                      ? 'Outdoor'
                      : 'Not set',
                onPress: () => handleRoomSettingPress('location'),
              },
              {
                icon: 'snow-outline',
                label: 'Near A/C',
                value:
                  location?.settings?.isNearAC === true
                    ? 'Yes'
                    : location?.settings?.isNearAC === false
                      ? 'No'
                      : 'Not set',
                onPress: () => handleRoomSettingPress('ac'),
              },
              {
                icon: 'flame-outline',
                label: 'Near Heater',
                value:
                  location?.settings?.isNearHeater === true
                    ? 'Yes'
                    : location?.settings?.isNearHeater === false
                      ? 'No'
                      : 'Not set',
                onPress: () => handleRoomSettingPress('heater'),
              },
            ]}
          />

          {location?.settings?.isIndoor === false && (
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Plant?"
        message={`Are you sure you want to delete ${plant.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor={theme.colors.error}
        icon="trash-outline"
        iconColor={theme.colors.error}
      />

      {/* Rename Dialog */}
      <TextInputDialog
        visible={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onConfirm={handleRename}
        title="Rename Plant"
        initialValue={plant.name}
        placeholder="Enter plant name"
        confirmText="Save"
        cancelText="Cancel"
        icon="create-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Room Dialog */}
      <SelectionDialog
        visible={showChangeRoomDialog}
        onClose={() => setShowChangeRoomDialog(false)}
        onConfirm={handleChangeRoom}
        title="Change Room"
        options={roomOptions}
        initialSelectedId={plant.locationId}
        confirmText="Save"
        cancelText="Cancel"
        icon="home-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Light Level Dialog */}
      <SelectionDialog
        visible={showLightLevelDialog}
        onClose={() => setShowLightLevelDialog(false)}
        onConfirm={handleChangeLightLevel}
        title="Light Level"
        options={lightLevelOptions}
        initialSelectedId={plant.settings?.light?.level || 'medium'}
        confirmText="Save"
        cancelText="Cancel"
        icon="sunny-outline"
      />

      {/* Change Distance from Window Dialog */}
      <SliderDialog
        visible={showDistanceDialog}
        onClose={() => setShowDistanceDialog(false)}
        onConfirm={handleChangeDistance}
        title="Distance from Window"
        initialValue={plant.settings?.light?.distanceFromWindow || 100}
        minValue={0}
        maxValue={300}
        step={10}
        unit=" cm"
        minLabel="At window"
        maxLabel="300+ cm"
        confirmText="Save"
        cancelText="Cancel"
        icon="swap-horizontal-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Pot Size Dialog */}
      <SliderDialog
        visible={showPotSizeDialog}
        onClose={() => setShowPotSizeDialog(false)}
        onConfirm={handleChangePotSize}
        title="Pot Size"
        initialValue={plant.settings?.pot?.size || 30}
        minValue={5}
        maxValue={100}
        step={5}
        unit=" cm"
        confirmText="Save"
        cancelText="Cancel"
        icon="resize-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Drainage Dialog */}
      <SelectionDialog
        visible={showDrainageDialog}
        onClose={() => setShowDrainageDialog(false)}
        onConfirm={handleChangeDrainage}
        title="Pot Drainage"
        description="Good drainage in a pot prevents root rot by allowing excess water to escape, ensuring healthy plant growth."
        options={drainageOptions}
        initialSelectedId={plant.settings?.pot?.hasDrainage ? 'yes' : 'no'}
        confirmText="Save"
        cancelText="Cancel"
        icon="water-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Soil Dialog */}
      <SelectionDialog
        visible={showSoilDialog}
        onClose={() => setShowSoilDialog(false)}
        onConfirm={handleChangeSoil}
        title="Soil Type"
        options={soilOptions}
        initialSelectedId={plant.settings?.pot?.soil || 'all-purpose-potting-mix'}
        confirmText="Save"
        cancelText="Cancel"
        icon="flower-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Plant Size Dialog */}
      <SliderDialog
        visible={showPlantSizeDialog}
        onClose={() => setShowPlantSizeDialog(false)}
        onConfirm={handleChangePlantSize}
        title="Plant Size"
        description="No need for an exact measurement, an approximate height is fine."
        initialValue={plant.settings?.plantType?.size || 30}
        minValue={0}
        maxValue={300}
        step={5}
        unit=" cm"
        minLabel="Less than 5cm"
        maxLabel="300cm+"
        confirmText="Save"
        cancelText="Cancel"
        icon="expand-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Age Dialog */}
      <SliderDialog
        visible={showAgeDialog}
        onClose={() => setShowAgeDialog(false)}
        onConfirm={handleChangeAge}
        title="Plant Age"
        description="How old is this plant?"
        initialValue={plant.settings?.plantType?.age ?? 0}
        minValue={0}
        maxValue={50}
        step={1}
        unit=" years"
        minLabel="Less than a year"
        maxLabel="50 years and more"
        confirmText="Save"
        cancelText="Cancel"
        icon="time-outline"
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
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

