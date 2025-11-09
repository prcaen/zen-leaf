import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';

export default function SettingsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const getSettingsData = () => {
    switch (type) {
      case 'light':
        return {
          title: 'Light Settings',
          icon: 'sunny-outline' as keyof typeof Ionicons.glyphMap,
          options: [
            { label: 'Low Light', value: 'low', description: 'Suitable for shade-loving plants' },
            { label: 'Medium Light', value: 'medium', description: 'Bright indirect light' },
            { label: 'High Light', value: 'high', description: 'Direct sunlight for several hours' },
          ],
        };
      case 'pot':
        return {
          title: 'Pot Settings',
          icon: 'cube-outline' as keyof typeof Ionicons.glyphMap,
          options: [
            { label: 'Small (4-6 inch)', value: 'small', description: 'For small plants or seedlings' },
            { label: 'Medium (6-10 inch)', value: 'medium', description: 'Standard pot size' },
            { label: 'Large (10+ inch)', value: 'large', description: 'For mature or large plants' },
          ],
        };
      case 'plant-type':
        return {
          title: 'Plant Type',
          icon: 'leaf-outline' as keyof typeof Ionicons.glyphMap,
          options: [
            { label: 'Succulent', value: 'succulent', description: 'Drought-resistant plants' },
            { label: 'Tropical', value: 'tropical', description: 'Humidity-loving plants' },
            { label: 'Herb', value: 'herb', description: 'Culinary herbs' },
            { label: 'Fern', value: 'fern', description: 'Shade and moisture loving' },
            { label: 'Flowering', value: 'flowering', description: 'Blooming plants' },
          ],
        };
      case 'room':
        return {
          title: 'Room Settings',
          icon: 'home-outline' as keyof typeof Ionicons.glyphMap,
          options: [
            { label: 'Living Room', value: 'living', description: 'Standard temperature and light' },
            { label: 'Bathroom', value: 'bathroom', description: 'High humidity' },
            { label: 'Kitchen', value: 'kitchen', description: 'Variable temperature' },
            { label: 'Bedroom', value: 'bedroom', description: 'Consistent environment' },
          ],
        };
      case 'location':
        return {
          title: 'Location & Weather',
          icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
          options: [
            { label: 'Indoor', value: 'indoor', description: 'Controlled environment' },
            { label: 'Outdoor', value: 'outdoor', description: 'Natural conditions' },
            { label: 'Balcony', value: 'balcony', description: 'Semi-outdoor space' },
          ],
        };
      default:
        return {
          title: 'Settings',
          icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
          options: [],
        };
    }
  };

  const settingsData = getSettingsData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name={settingsData.icon} size={24} color={theme.colors.primary} />
          <Text style={styles.headerText}>{settingsData.title}</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Choose the best option for your plant's needs. This will help us provide better care recommendations.
        </Text>

        {settingsData.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => {
              // TODO: Save the setting
              console.log(`Selected: ${option.value}`);
              router.back();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              {option.description && (
                <Text style={styles.optionDescription}>{option.description}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  headerButton: {
    padding: theme.spacing.sm,
    width: 40,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  optionContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

