import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { api } from '../../src/lib/api';
import { tempPlantStorage } from '../../src/lib/storage';
import { theme } from '../../src/theme';
import { PlantBasicInfo, PlantCatalogItem as PlantCatalogItemType } from '../../src/types';

export default function CreatePlantScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogPlants, setCatalogPlants] = useState<PlantCatalogItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const plants = await api.getPlantCatalog();
        setCatalogPlants(plants);
      } catch (error) {
        console.error('Error loading plant catalog:', error);
        // Fallback to empty array on error
        setCatalogPlants([]);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const filteredPlants = catalogPlants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.aliases.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlantSelect = async (plant: PlantCatalogItemType) => {
    // Prepare basic plant info (without saving yet)
    const basicInfo: PlantBasicInfo = {
      name: plant.name,
      catalogItemId: plant.id,
      imageUrl: plant.imageUrl,
    };

    // Save basic plant info to local storage
    await tempPlantStorage.save(basicInfo);
    router.push('/plant/create/room');
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading plant catalog...</Text>
          </View>
        ) : filteredPlants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No plants found matching your search.' : 'No plants available in the catalog.'}
            </Text>
          </View>
        ) : (
          filteredPlants.map(plant => (
            <PlantCatalogItem
              key={plant.id}
              plant={plant}
              onPress={() => handlePlantSelect(plant)}
            />
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
