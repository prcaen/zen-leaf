import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { SettingItemData, SettingsSection } from '../../src/components/detail/SettingsSection';
import { SelectionDialog, SelectionOption } from '../../src/components/SelectionDialog';
import { TextInputDialog } from '../../src/components/TextInputDialog';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';
import { UnitSystem } from '../../src/types';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = usePlants();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showUnitSystemDialog, setShowUnitSystemDialog] = useState(false);

  if (!user) {
    return null;
  }

  const handleUpdateName = async (name: string) => {
    await updateUser({ name });
  };

  const handleUpdateEmail = async (email: string) => {
    await updateUser({ email });
  };

  const handleUpdateLocation = async (locationName: string) => {
    await updateUser({ locationName });
  };

  const handleUpdateUnitSystem = async (unitSystem: string) => {
    await updateUser({ unitSystem: unitSystem as UnitSystem });
  };

  const unitSystemOptions: SelectionOption[] = [
    { id: UnitSystem.METRIC, label: 'Metric' },
    { id: UnitSystem.IMPERIAL, label: 'Imperial' },
  ];

  const settings: SettingItemData[] = [
    {
      icon: 'person-outline',
      label: 'Name',
      value: user.name || 'Not set',
      onPress: () => setShowNameDialog(true),
    },
    {
      icon: 'mail-outline',
      label: 'Email',
      value: user.email || 'Not set',
      lowerCaseValue: true,
      onPress: () => setShowEmailDialog(true),
    },
    {
      icon: 'location-outline',
      label: 'Location',
      value: user.locationName || 'Not set',
      onPress: () => setShowLocationDialog(true),
    },
    {
      icon: 'resize-outline',
      label: 'Unit System',
      value: user.unitSystem === UnitSystem.METRIC ? 'Metric' : 'Imperial',
      onPress: () => setShowUnitSystemDialog(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sageLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Profile" items={settings} />
      </ScrollView>

      {/* Name Dialog */}
      <TextInputDialog
        visible={showNameDialog}
        onClose={() => setShowNameDialog(false)}
        onConfirm={handleUpdateName}
        title="Name"
        initialValue={user.name}
        placeholder="Enter your name"
        confirmText="Save"
        cancelText="Cancel"
        icon="person-outline"
        iconColor={theme.colors.primary}
      />

      {/* Email Dialog */}
      <TextInputDialog
        visible={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onConfirm={handleUpdateEmail}
        title="Email"
        initialValue={user.email}
        placeholder="Enter your email"
        confirmText="Save"
        cancelText="Cancel"
        icon="mail-outline"
        iconColor={theme.colors.primary}
      />

      {/* Location Dialog */}
      <TextInputDialog
        visible={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onConfirm={handleUpdateLocation}
        title="Location"
        initialValue={user.locationName}
        placeholder="Enter your city"
        confirmText="Save"
        cancelText="Cancel"
        icon="location-outline"
        iconColor={theme.colors.primary}
      />

      {/* Unit System Dialog */}
      <SelectionDialog
        visible={showUnitSystemDialog}
        onClose={() => setShowUnitSystemDialog(false)}
        onConfirm={handleUpdateUnitSystem}
        title="Unit System"
        description="Choose your preferred unit system for measurements"
        options={unitSystemOptions}
        initialSelectedId={user.unitSystem}
        confirmText="Save"
        cancelText="Cancel"
        icon="resize-outline"
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.sage,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
});

