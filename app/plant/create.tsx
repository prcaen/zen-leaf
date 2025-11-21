import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
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
import { PlantCatalogItem } from '../../src/components/PlantCatalogItem';
import { commonHouseplants, PlantCatalogItem as PlantCatalogItemType } from '../../src/data/plantCatalog';
import { usePlants } from '../../src/state/PlantsContext';
import { theme } from '../../src/theme';
import { GrowSpeed, LightLevel, Plant, Toxicity, WaterNeeded } from '../../src/types';

export default function CreatePlantScreen() {
  const router = useRouter();
  const { addPlant, rooms } = usePlants();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = commonHouseplants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.aliases.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlantSelect = async (plant: PlantCatalogItemType) => {
    const defaultRoomId = 'no-room';

    // Map difficulty to care info
    const getGrowSpeed = (difficulty: string): GrowSpeed => {
      switch (difficulty) {
        case 'Easy':
          return GrowSpeed.FAST;
        case 'Moderate':
          return GrowSpeed.MODERATE;
        case 'Advanced':
          return GrowSpeed.SLOW;
        default:
          return GrowSpeed.MODERATE;
      }
    };

    const getToxicity = (difficulty: string): Toxicity => {
      switch (difficulty) {
        case 'Easy':
          return Toxicity.NON_TOXIC;
        case 'Moderate':
          return Toxicity.TOXIC_PETS;
        case 'Advanced':
          return Toxicity.TOXIC_HUMANS;
        default:
          return Toxicity.NON_TOXIC;
      }
    };

    const getWaterNeeded = (lightLevel: LightLevel): WaterNeeded => {
      // Plants that need more sun typically need more water
      if (lightLevel === LightLevel.SUN) {
        return WaterNeeded.HIGH;
      }
      return WaterNeeded.MODERATE;
    };

    const newPlant: Plant = {
      id: Crypto.randomUUID(),
      name: plant.name,
      roomId: defaultRoomId,
      wateringFrequencyDays: 7, // Default to weekly
      lastWateredDate: null,
      createdAt: new Date(),
      careInfo: {
        growSpeed: getGrowSpeed(plant.difficulty),
        lightNeeded: plant.lightLevel,
        toxicity: getToxicity(plant.difficulty),
        waterNeeded: getWaterNeeded(plant.lightLevel),
      },
      imageUrl: plant.imageUrl,
    };

    await addPlant(newPlant);
    router.replace(`/plant/create/${newPlant.id}/room`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.sage} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Add plant</Text>
          <Text style={styles.subtitle}>
            Select a plant from the catalog to add to your home.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search plants..."
            placeholderTextColor={theme.colors.textLight}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
            }}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Plant List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPlants.map(plant => (
          <PlantCatalogItem
            key={plant.id}
            plant={plant}
            onPress={() => handlePlantSelect(plant)}
          />
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.sage,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  headerContent: {
    marginTop: theme.spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.sageDark,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.sage,
  },
});
