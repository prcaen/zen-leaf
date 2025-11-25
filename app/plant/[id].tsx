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
import { Button } from '../../src/components/Button';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { DatePickerDialog } from '../../src/components/DatePickerDialog';
import { ActionCard } from '../../src/components/detail/ActionCard';
import { HistoryList } from '../../src/components/detail/HistoryList';
import { PlantHeader } from '../../src/components/detail/PlantHeader';
import { SettingItemData, SettingsSection } from '../../src/components/detail/SettingsSection';
import { TasksList } from '../../src/components/detail/TasksList';
import { InfoDialog } from '../../src/components/InfoDialog';
import { SelectionDialog, SelectionOption } from '../../src/components/SelectionDialog';
import { SliderDialog } from '../../src/components/SliderDialog';
import { TextInputDialog } from '../../src/components/TextInputDialog';
import { api } from '../../src/lib/api';
import { pickImage, takePicture, uploadPlantImage } from '../../src/lib/imageUpload';
import {
  formatSize,
  formatTemperature,
  getDisplaySize,
  getSizeUnit,
  parseSize
} from '../../src/lib/number';
import { formatPlantAge } from '../../src/lib/plant';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';
import { GrowSpeed, LightLevel, PlantCareInfo, PlantCatalogItem, Toxicity, UnitSystem, WaterNeeded } from '../../src/types';

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getPlantById,
    rooms,
    getRoomById,
    getCareTasks,
    getCareHistory,
    completeCareTask,
    deletePlant,
    updatePlant,
    user,
  } = usePlants();

  const plant = getPlantById(id);
  const room = plant ? getRoomById(plant.roomId) : null;
  const plantTasks = getCareTasks(id);
  const plantHistory = getCareHistory(id);
  
  // Load catalog item to get careInfo, variety, and category
  const [catalogItem, setCatalogItem] = useState<PlantCatalogItem | null>(null);
  
  useEffect(() => {
    const loadCatalogItem = async () => {
      if (plant?.catalogItemId) {
        try {
          const catalog = await api.getPlantCatalog();
          const item = catalog.find(c => c.id === plant.catalogItemId);
          setCatalogItem(item || null);
        } catch (error) {
          console.error('Error loading catalog item:', error);
        }
      }
    };
    loadCatalogItem();
  }, [plant?.catalogItemId]);
  
  // Derive careInfo, variety, and category from catalog item
  const careInfo: PlantCareInfo | undefined = catalogItem ? {
    growSpeed: catalogItem.growSpeed,
    lightNeeded: catalogItem.lightLevel,
    toxicity: catalogItem.toxicity,
    waterNeeded: catalogItem.waterNeeded,
    growSpeedDescription: catalogItem.growSpeedDescription,
    lightNeededDescription: catalogItem.lightNeededDescription,
    toxicityDescription: catalogItem.toxicityDescription,
    waterNeededDescription: catalogItem.waterNeededDescription,
  } : undefined;
  
  const variety = catalogItem?.variety;
  const category = catalogItem?.category;

  const handleRoomSettingPress = (dialogType: string) => {
    if (plant?.roomId) {
      router.push(`/room/${plant.roomId}?dialog=${dialogType}`);
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

  // Image upload loading state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Change room dialog state
  const [showChangeRoomDialog, setShowChangeRoomDialog] = useState(false);

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

  // Change A/C dialog state
  const [showACDialog, setShowACDialog] = useState(false);

  // Change Heater dialog state
  const [showHeaterDialog, setShowHeaterDialog] = useState(false);

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

  if (!plant || !room) {
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
    const speed = careInfo?.growSpeed || GrowSpeed.MODERATE;
    const descriptions = {
      [GrowSpeed.SLOW]: 'This plant grows slowly and may take months or even years to reach maturity. Perfect for those who want low-maintenance greenery.',
      [GrowSpeed.MODERATE]: 'This plant has a moderate growth rate, showing visible progress over weeks to months. Ideal for most indoor gardeners.',
      [GrowSpeed.FAST]: 'This plant grows rapidly and may need regular pruning or repotting. Great for seeing quick results!',
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
    const light = careInfo?.lightNeeded || LightLevel.PART_SUN;
    const descriptions = {
      [LightLevel.SUN]: 'This plant needs bright, direct sunlight for several hours a day. Best placed near south-facing windows.',
      [LightLevel.PART_SUN]: 'This plant prefers bright, indirect light. Place near a window with filtered sunlight or in a well-lit room.',
      [LightLevel.SHADE]: 'This plant thrives in low light conditions and can be placed away from windows. Perfect for darker rooms or offices.',
      [LightLevel.DARK]: 'This plant can tolerate very low light conditions and is perfect for dark corners or rooms with minimal natural light.',
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
    const toxicity = careInfo?.toxicity || Toxicity.NON_TOXIC;
    const descriptions = {
      [Toxicity.NON_TOXIC]: 'This plant is safe for both pets and humans. You can display it anywhere without worry!',
      [Toxicity.TOXIC_PETS]: 'This plant can be harmful to pets if ingested. Keep it out of reach of cats and dogs.',
      [Toxicity.TOXIC_HUMANS]: 'This plant can cause irritation or illness in humans if ingested or touched. Handle with care.',
      [Toxicity.TOXIC_ALL]: 'This plant is toxic to both pets and humans. Keep it in a safe room away from children and animals.',
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
    const water = careInfo?.waterNeeded || WaterNeeded.MODERATE;
    const descriptions = {
      [WaterNeeded.LOW]: 'This plant requires infrequent watering. Allow soil to dry out completely between waterings. Perfect for forgetful plant parents!',
      [WaterNeeded.MODERATE]: 'This plant needs regular watering. Keep soil slightly moist but not waterlogged. Water when the top inch of soil is dry.',
      [WaterNeeded.HIGH]: 'This plant loves water and needs frequent watering. Keep soil consistently moist. Check daily during hot weather.',
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

  const handleRoomPress = () => {
    setShowChangeRoomDialog(true);
  };

  const handleChangeRoom = async (newRoomId: string) => {
    await updatePlant(id, { roomId: newRoomId });
  };

  const handleImageUpload = () => {
    handleImageSourceSelect('camera');
  };

  const handleImageSourceSelect = async (source: 'camera' | 'library') => {
    try {
      setIsUploadingImage(true);
      const result = source === 'camera' ? await takePicture([16, 9]) : await pickImage();

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const imageUrl = await uploadPlantImage(imageUri, id);
      await updatePlant(id, { imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      // You might want to show an error dialog here
    } finally {
      setIsUploadingImage(false);
    }
  };

  const roomOptions: SelectionOption[] = rooms.map(r => ({
    id: r.id,
    label: r.name,
  }));

  const handleDistancePress = () => {
    setShowDistanceDialog(true);
  };

  const handleChangeDistance = async (newDistance: number) => {
    const unitSystem = user?.unitSystem || UnitSystem.METRIC;
    
    // Convert from display value to metric for storage
    const distanceInCm = parseSize(newDistance, unitSystem);
    
    await updatePlant(id, {
      distanceFromWindow: distanceInCm,
    });
  };

  const handlePotSizePress = () => {
    setShowPotSizeDialog(true);
  };

  const handleChangePotSize = async (newSize: number) => {
    const unitSystem = user?.unitSystem || UnitSystem.METRIC;
    
    // Convert from display value to metric for storage
    const sizeInCm = parseSize(newSize, unitSystem);
    
    await updatePlant(id, {
      potSize: sizeInCm,
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
    await updatePlant(id, {
      hasDrainage: hasDrainage === 'yes',
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

  const handleACPress = () => {
    setShowACDialog(true);
  };

  const handleChangeAC = async (isNearAC: string) => {
    await updatePlant(id, {
      isNearAC: isNearAC === 'yes',
    });
  };

  const acOptions: SelectionOption[] = [
    { id: 'yes', label: 'Yes, near A/C', icon: 'snow-outline' },
    { id: 'no', label: 'No, not near A/C', icon: 'close-circle-outline' },
  ];

  const handleHeaterPress = () => {
    setShowHeaterDialog(true);
  };

  const handleChangeHeater = async (isNearHeater: string) => {
    await updatePlant(id, {
      isNearHeater: isNearHeater === 'yes',
    });
  };

  const heaterOptions: SelectionOption[] = [
    { id: 'yes', label: 'Yes, near heater', icon: 'flame-outline' },
    { id: 'no', label: 'No, not near heater', icon: 'close-circle-outline' },
  ];

  const handleSoilPress = () => {
    setShowSoilDialog(true);
  };

  const handleChangeSoil = async (soilType: string) => {
    await updatePlant(id, {
      soil: soilType,
    });
  };

  const handlePlantSizePress = () => {
    setShowPlantSizeDialog(true);
  };

  const handleChangePlantSize = async (newSize: number) => {
    const unitSystem = user?.unitSystem || UnitSystem.METRIC;
    
    // Convert from display value to metric for storage
    const sizeInCm = parseSize(newSize, unitSystem);
    
    await updatePlant(id, {
      plantSize: sizeInCm,
    });
  };

  const handleAgePress = () => {
    setShowAgeDialog(true);
  };

  const handleChangeAge = async (date: Date) => {
    await updatePlant(id, {
      acquiredAt: date,
    });
  };

  // Calculate age display
  const getAgeDisplay = (): string => {
    return formatPlantAge(plant.acquiredAt);
  };

  const roomSettings = (): SettingItemData[] => {
    const settings: SettingItemData[] = [];

    settings.push({
      icon: 'home-outline',
      label: 'Name',
      value: room?.name || 'Not set',
      onPress: () => {
        if (plant?.roomId) {
          router.push(`/room/${plant.roomId}`);
        }
      },
    });

    settings.push({
      icon: 'thermometer-outline',
      label: 'Temperature',
      value: room?.temperature
        ? formatTemperature(room.temperature, user?.unitSystem || UnitSystem.METRIC)
        : 'Not set',
      onPress: () => handleRoomSettingPress('temperature'),
    });

    settings.push({
      icon: 'water-outline',
      label: 'Humidity',
      value: room?.humidity
        ? `${room.humidity}%`
        : 'Not set',
      onPress: () => handleRoomSettingPress('humidity'),
    });

    settings.push({
      icon: 'location-outline',
      label: 'Location',
      value: room?.isIndoor === true
        ? 'Indoor'
        : room?.isIndoor === false
        ? 'Outdoor'
        : 'Not set',
      onPress: () => handleRoomSettingPress('location'),
    });

    if (room?.isIndoor === true) {
      settings.push({
        icon: 'snow-outline',
        label: 'Near A/C',
        value: plant?.isNearAC === true
          ? 'Yes'
          : plant?.isNearAC === false
          ? 'No'
          : 'Not set',
        onPress: handleACPress,
      });

      settings.push({
        icon: 'flame-outline',
        label: 'Near Heater',
        value: plant?.isNearHeater === true
          ? 'Yes'
          : plant?.isNearHeater === false
          ? 'No'
          : 'Not set',
        onPress: handleHeaterPress,
      });
    }

    return settings;
  }

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
          room={room.name}
          imageUrl={plant.imageUrl}
          onNamePress={handleNamePress}
          onRoomPress={handleRoomPress}
          onImageUpload={handleImageUpload}
        />

        {/* Action Cards */}
        <View style={styles.section}>
          <View style={styles.actionCardsGrid}>
            <ActionCard
              icon="water-outline"
              title="Water Needed"
              subtitle={careInfo?.waterNeeded || 'Moderate'}
              color={theme.colors.primaryLight}
              onPress={handleWaterNeededPress}
            />
            <ActionCard
              icon="leaf-outline"
              title="Growth Speed"
              subtitle={careInfo?.growSpeed || 'Moderate'}
              color={theme.colors.primaryLight}
              onPress={handleGrowSpeedPress}
            />
            <ActionCard
              icon="sunny-outline"
              title="Light Needed"
              subtitle={careInfo?.lightNeeded 
                ? careInfo.lightNeeded === LightLevel.PART_SUN 
                  ? 'Part Sun' 
                  : careInfo.lightNeeded.charAt(0).toUpperCase() + careInfo.lightNeeded.slice(1)
                : 'Part Sun'}
              color={theme.colors.primaryLight}
              onPress={handleLightNeededPress}
            />
            <ActionCard
              icon="warning-outline"
              title="Toxicity"
              subtitle={
                careInfo?.toxicity
                  ? careInfo.toxicity.replace('-', ' ')
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
          <HistoryList history={plantHistory} careTasks={plantTasks} limit={3} />
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
                value: room?.lightLevel ? room.lightLevel : 'Not set',
                onPress: () => handleRoomSettingPress('lightLevel'),
              },
              {
                icon: 'swap-horizontal-outline',
                label: 'Distance from window',
                value: plant.distanceFromWindow
                  ? formatSize(plant.distanceFromWindow, user?.unitSystem || UnitSystem.METRIC)
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
                value: plant.potSize 
                  ? `${formatSize(plant.potSize, user?.unitSystem || UnitSystem.METRIC)} (${getPotSizeLabel(plant.potSize)})` 
                  : 'Not set',
                onPress: handlePotSizePress,
              },
              {
                icon: 'water-outline',
                label: 'Drainage',
                value:
                  plant.hasDrainage == null
                    ? 'Not set'
                    : plant.hasDrainage
                      ? 'Yes'
                      : 'No',
                onPress: handleDrainagePress,
              },
              {
                icon: 'flower-outline',
                label: 'Soil',
                value: plant.soil 
                  ? soilOptions.find(s => s.id === plant.soil)?.label || 'Not set'
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
                value: category || 'Not set',
                onPress: () => console.log('Plant type'),
              },
              {
                icon: 'information-circle-outline',
                label: 'Variety',
                value: variety || 'Not set',
                onPress: () => console.log('Variety'),
              },
              {
                icon: 'expand-outline',
                label: 'Size',
                value: plant.plantSize 
                  ? formatSize(plant.plantSize, user?.unitSystem || UnitSystem.METRIC)
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
            items={roomSettings()}
          />

          {/* Delete Plant Button */}
          <Button
            title="Delete Plant"
            onPress={handleDeletePress}
            variant="destructive"
          />
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
        initialSelectedId={plant.roomId}
        confirmText="Save"
        cancelText="Cancel"
        icon="home-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Distance from Window Dialog */}
      <SliderDialog
        visible={showDistanceDialog}
        onClose={() => setShowDistanceDialog(false)}
        onConfirm={handleChangeDistance}
        title="Distance from Window"
        initialValue={plant.distanceFromWindow 
          ? getDisplaySize(plant.distanceFromWindow, user?.unitSystem || UnitSystem.METRIC)
          : (user?.unitSystem === UnitSystem.IMPERIAL ? 39.4 : 100)}
        minValue={user?.unitSystem === UnitSystem.IMPERIAL ? 0 : 0}
        maxValue={user?.unitSystem === UnitSystem.IMPERIAL ? 118 : 300}
        step={user?.unitSystem === UnitSystem.IMPERIAL ? 4 : 10}
        unit={` ${getSizeUnit(user?.unitSystem || UnitSystem.METRIC)}`}
        minLabel="At window"
        maxLabel={user?.unitSystem === UnitSystem.IMPERIAL ? "118+\"" : "300+ cm"}
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
        initialValue={plant.potSize 
          ? getDisplaySize(plant.potSize, user?.unitSystem || UnitSystem.METRIC)
          : (user?.unitSystem === UnitSystem.IMPERIAL ? 11.8 : 30)}
        minValue={user?.unitSystem === UnitSystem.IMPERIAL ? 2 : 5}
        maxValue={user?.unitSystem === UnitSystem.IMPERIAL ? 39.4 : 100}
        step={user?.unitSystem === UnitSystem.IMPERIAL ? 2 : 5}
        unit={` ${getSizeUnit(user?.unitSystem || UnitSystem.METRIC)}`}
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
        initialSelectedId={plant.hasDrainage ? 'yes' : 'no'}
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
        initialSelectedId={plant.soil || 'all-purpose-potting-mix'}
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
        initialValue={plant.plantSize 
          ? getDisplaySize(plant.plantSize, user?.unitSystem || UnitSystem.METRIC)
          : (user?.unitSystem === UnitSystem.IMPERIAL ? 11.8 : 30)}
        minValue={0}
        maxValue={user?.unitSystem === UnitSystem.IMPERIAL ? 118 : 300}
        step={user?.unitSystem === UnitSystem.IMPERIAL ? 2 : 5}
        unit={` ${getSizeUnit(user?.unitSystem || UnitSystem.METRIC)}`}
        minLabel={user?.unitSystem === UnitSystem.IMPERIAL ? "Less than 2\"" : "Less than 5cm"}
        maxLabel={user?.unitSystem === UnitSystem.IMPERIAL ? "118\"+" : "300cm+"}
        confirmText="Save"
        cancelText="Cancel"
        icon="expand-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change A/C Dialog */}
      <SelectionDialog
        visible={showACDialog}
        onClose={() => setShowACDialog(false)}
        onConfirm={handleChangeAC}
        title="Near A/C"
        description="Plants near air conditioning units may need more frequent watering due to dry air."
        options={acOptions}
        initialSelectedId={plant.isNearAC === true ? 'yes' : 'no'}
        confirmText="Save"
        cancelText="Cancel"
        icon="snow-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Heater Dialog */}
      <SelectionDialog
        visible={showHeaterDialog}
        onClose={() => setShowHeaterDialog(false)}
        onConfirm={handleChangeHeater}
        title="Near Heater"
        description="Plants near heaters may need more frequent watering due to increased heat and dry air."
        options={heaterOptions}
        initialSelectedId={plant.isNearHeater === true ? 'yes' : 'no'}
        confirmText="Save"
        cancelText="Cancel"
        icon="flame-outline"
        iconColor={theme.colors.primary}
      />

      {/* Change Age Dialog */}
      <DatePickerDialog
        visible={showAgeDialog}
        onClose={() => setShowAgeDialog(false)}
        onConfirm={handleChangeAge}
        title="Acquired Date"
        description="When did you acquire this plant?"
        initialValue={plant.acquiredAt ? new Date(plant.acquiredAt) : null}
        maximumDate={new Date()}
        confirmText="Save"
        cancelText="Cancel"
        icon="calendar-outline"
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

