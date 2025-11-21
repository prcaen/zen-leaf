import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { SettingsSection } from '../../src/components/detail/SettingsSection';
import { SelectionDialog, SelectionOption } from '../../src/components/SelectionDialog';
import { SliderDialog } from '../../src/components/SliderDialog';
import {
  formatTemperature,
  getDisplayTemperature,
  getTemperatureUnit,
  parseTemperature,
} from '../../src/lib/number';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';
import { LightLevel, Room, UnitSystem } from '../../src/types';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { addRoom, user } = usePlants();

  // Form state
  const [name, setName] = useState('');
  const [temperature, setTemperature] = useState<number | undefined>(undefined);
  const [humidity, setHumidity] = useState<number | undefined>(undefined);
  const [lightLevel, setLightLevel] = useState<LightLevel | undefined>(undefined);
  const [isIndoor, setIsIndoor] = useState<boolean | undefined>(undefined);

  // Dialog states
  const [showTemperatureDialog, setShowTemperatureDialog] = useState(false);
  const [showHumidityDialog, setShowHumidityDialog] = useState(false);
  const [showLightLevelDialog, setShowLightLevelDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const lightLevelOptions: SelectionOption[] = [
    { id: LightLevel.SUN, label: 'Sun', icon: 'sunny-outline' },
    { id: LightLevel.PART_SUN, label: 'Part Sun', icon: 'partly-sunny-outline' },
    { id: LightLevel.SHADE, label: 'Shade', icon: 'cloudy-outline' },
    { id: LightLevel.DARK, label: 'Dark', icon: 'moon-outline' },
  ];

  const locationOptions: SelectionOption[] = [
    { id: 'indoor', label: 'Indoor', icon: 'home-outline' },
    { id: 'outdoor', label: 'Outdoor', icon: 'sunny-outline' },
  ];

  const handleTemperaturePress = () => {
    setShowTemperatureDialog(true);
  };

  const handleChangeTemperature = (temp: number) => {
    const unitSystem = user?.unitSystem || UnitSystem.METRIC;
    const temperatureInCelsius = parseTemperature(temp, unitSystem);
    setTemperature(temperatureInCelsius);
  };

  const handleHumidityPress = () => {
    setShowHumidityDialog(true);
  };

  const handleChangeHumidity = (hum: number) => {
    setHumidity(hum);
  };

  const handleLightLevelPress = () => {
    setShowLightLevelDialog(true);
  };

  const handleChangeLightLevel = (level: string) => {
    setLightLevel(level as LightLevel);
  };

  const handleLocationPress = () => {
    setShowLocationDialog(true);
  };

  const handleChangeLocation = (selectedId: string) => {
    setIsIndoor(selectedId === 'indoor');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    const room: Room = {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      settings: {
        ...(temperature !== undefined && { temperature }),
        ...(humidity !== undefined && { humidity }),
        ...(lightLevel !== undefined && { lightLevel }),
        ...(isIndoor !== undefined && { isIndoor }),
      },
    };

    await addRoom(room);
    router.back();
  };

  const canCreate = name.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Room</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input */}
        <View style={styles.nameSection}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter room name"
            placeholderTextColor={theme.colors.textLight}
            autoFocus
          />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <SettingsSection
            title=""
            items={[
              {
                icon: 'thermometer-outline',
                label: 'Temperature',
                value: temperature !== undefined
                  ? formatTemperature(temperature, user?.unitSystem || UnitSystem.METRIC)
                  : 'Not set',
                onPress: handleTemperaturePress,
              },
              {
                icon: 'water-outline',
                label: 'Humidity',
                value: humidity !== undefined ? `${humidity}%` : 'Not set',
                onPress: handleHumidityPress,
              },
              {
                icon: 'sunny-outline',
                label: 'Light level',
                value: lightLevel
                  ? lightLevelOptions.find(opt => opt.id === lightLevel)?.label || lightLevel
                  : 'Not set',
                onPress: handleLightLevelPress,
              },
              {
                icon: 'location-outline',
                label: 'Location',
                value:
                  isIndoor === true
                    ? 'Indoor'
                    : isIndoor === false
                      ? 'Outdoor'
                      : 'Not set',
                onPress: handleLocationPress,
              },
            ]}
          />
        </View>

        {/* Submit Button */}
        <Button
          title="Create Room"
          onPress={handleCreate}
          variant="common"
          disabled={!canCreate}
          style={styles.submitButton}
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
        initialValue={temperature !== undefined
          ? getDisplayTemperature(temperature, user?.unitSystem || UnitSystem.METRIC)
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
        initialValue={humidity !== undefined ? humidity : 50}
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
        initialSelectedId={lightLevel || LightLevel.PART_SUN}
        confirmText="Save"
        cancelText="Cancel"
        icon="sunny-outline"
        iconColor={theme.colors.primary}
      />

      {/* Location Dialog */}
      <SelectionDialog
        visible={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onConfirm={handleChangeLocation}
        title="Location"
        options={locationOptions}
        initialSelectedId={isIndoor === true ? 'indoor' : isIndoor === false ? 'outdoor' : 'indoor'}
        confirmText="Save"
        cancelText="Cancel"
        icon="location-outline"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  submitButton: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  nameSection: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  nameInput: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
