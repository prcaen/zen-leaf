import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { tempPlantStorage } from '../../../src/lib/storage';
import { usePlants } from '../../../src/state/PlantsContext';
import { theme } from '../../../src/theme';
import { LightLevel, Plant, PlantBasicInfo } from '../../../src/types';

export default function SelectRoomScreen() {
  const router = useRouter();
  const { rooms, plants, addPlant } = usePlants();
  const [filterIndoor, setFilterIndoor] = useState(true);
  const [plantData, setPlantData] = useState<PlantBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Load plant data from storage
  useEffect(() => {
    const loadPlantData = async () => {
      try {
        const data = await tempPlantStorage.get();
        setPlantData(data);
      } catch (error) {
        console.error('Error loading plant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlantData();
  }, []);

  const plantLightNeeded = plantData?.careInfo?.lightNeeded;

  // Filter rooms by indoor/outdoor
  const filteredRooms = rooms.filter(room => {
    if (room.id === 'no-room') {
      return false;
    }
    if (filterIndoor) {
      return room.settings?.isIndoor !== false; // Show indoor or undefined
    }
    return room.settings?.isIndoor === false; // Show only outdoor
  });

  // Check if room is recommended based on light level compatibility
  const isRoomRecommended = (room: typeof rooms[0]): boolean => {
    if (!plantLightNeeded || !room.settings?.lightLevel) {
      return false;
    }

    const roomLight = room.settings.lightLevel;
    
    // Simple compatibility logic:
    // - Sun plants work best in Sun or Part Sun rooms
    // - Part Sun plants work in Part Sun, Sun, or Shade rooms
    // - Shade plants work in Shade, Part Sun, or Dark rooms
    // - Dark plants work in Dark or Shade rooms
    switch (plantLightNeeded) {
      case LightLevel.SUN:
        return roomLight === LightLevel.SUN || roomLight === LightLevel.PART_SUN;
      case LightLevel.PART_SUN:
        return roomLight === LightLevel.PART_SUN || roomLight === LightLevel.SUN || roomLight === LightLevel.SHADE;
      case LightLevel.SHADE:
        return roomLight === LightLevel.SHADE || roomLight === LightLevel.PART_SUN || roomLight === LightLevel.DARK;
      case LightLevel.DARK:
        return roomLight === LightLevel.DARK || roomLight === LightLevel.SHADE;
      default:
        return false;
    }
  };

  // Get plant images for a room
  const getRoomPlantImages = (roomId: string) => {
    return plants.filter(p => p.roomId === roomId && p.imageUrl).slice(0, 4);
  };

  const handleRoomSelect = async (roomId: string) => {
    if (!plantData) {
      console.error('Plant data is missing');
      router.back();
      return;
    }

    try {
      // Create the plant with the selected room
      const newPlant: Plant = {
        id: Crypto.randomUUID(),
        name: plantData.name,
        roomId: roomId,
        wateringFrequencyDays: plantData.wateringFrequencyDays,
        lastWateredDate: plantData.lastWateredDate,
        createdAt: new Date(),
        careInfo: plantData.careInfo,
        imageUrl: plantData.imageUrl,
      };

      await addPlant(newPlant);
      // Clear temporary plant data after successful creation
      await tempPlantStorage.clear();
      router.replace(`/plant/${newPlant.id}`);
    } catch (error) {
      console.error('Error creating plant:', error);
      // You might want to show an error dialog here
    }
  };

  const handleCreateRoom = () => {
    router.push('/room/create?returnTo=/plant/create/room');
  };

  const renderRoomImages = (roomId: string) => {
    const roomPlants = getRoomPlantImages(roomId);
    
    if (roomPlants.length === 0) {
      return (
        <View style={styles.emptyImageContainer}>
          <Ionicons name="leaf-outline" size={32} color={theme.colors.white} />
        </View>
      );
    }

    if (roomPlants.length === 1) {
      return (
        <View style={styles.singleImageContainer}>
          <Image source={{ uri: roomPlants[0].imageUrl }} style={styles.roomImage} />
        </View>
      );
    }

    if (roomPlants.length === 2) {
      return (
        <View style={styles.twoImagesContainer}>
          {roomPlants.map((plant) => (
            <Image key={plant.id} source={{ uri: plant.imageUrl }} style={styles.roomImageSmall} />
          ))}
        </View>
      );
    }

    // 3 or 4 images
    return (
      <View style={styles.gridContainer}>
        {roomPlants.slice(0, 4).map((plant, index) => {
          const isThree = roomPlants.length === 3;
          const isLarge = isThree && index === 0;
          
          return (
            <View
              key={plant.id}
              style={[
                styles.gridItem,
                isLarge && styles.gridItemLarge,
                isThree && index > 0 && styles.gridItemSmall,
              ]}
            >
              <Image source={{ uri: plant.imageUrl }} style={styles.roomImageGrid} />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.sageDark} />

      {/* Header */}
      <View style={styles.header}/>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <Text style={styles.question}>Where is the plant placed?</Text>
        
        {loading ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loading...</Text>
          </View>
        ) : !plantData ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Plant data is missing. Please go back and try again.</Text>
          </View>
        ) : null}

        {/* Create Room Button */}
        <Button
          title="Create a new site"
          onPress={handleCreateRoom}
          variant="common"
          style={styles.createRoomButton}
        />

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, filterIndoor && styles.filterButtonActive]}
          onPress={() => setFilterIndoor(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterButtonText, filterIndoor && styles.filterButtonTextActive]}>
            Indoor site
          </Text>
        </TouchableOpacity>

        {/* Rooms List */}
        {filteredRooms.map((room) => {
          const isRecommended = isRoomRecommended(room);
          
          return (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => handleRoomSelect(room.id)}
              activeOpacity={0.7}
            >
              <View style={styles.roomImageSection}>
                {renderRoomImages(room.id)}
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <View style={styles.recommendationBadge}>
                  <View
                    style={[
                      styles.badgeContainer,
                      isRecommended ? styles.badgeRecommended : styles.badgeNotRecommended,
                    ]}
                  >
                    <Ionicons
                      name="sunny-outline"
                      size={12}
                      color={theme.colors.white}
                      style={styles.badgeIcon}
                    />
                    <Text style={styles.badgeText}>
                      {isRecommended ? 'Recommended' : 'Not recommended'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
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
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '50%',
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.sageDark,
    marginBottom: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  createRoomButton: {
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    marginBottom: theme.spacing.lg,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  roomImageSection: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.primary,
  },
  emptyImageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleImageContainer: {
    width: '100%',
    height: '100%',
  },
  twoImagesContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    gap: 2,
  },
  gridContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: '49%',
    height: '49%',
  },
  gridItemLarge: {
    width: '100%',
    height: '49%',
  },
  gridItemSmall: {
    width: '49%',
    height: '49%',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  roomImageSmall: {
    flex: 1,
    height: '100%',
    resizeMode: 'cover',
  },
  roomImageGrid: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  roomInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  recommendationBadge: {
    alignSelf: 'flex-start',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  badgeRecommended: {
    backgroundColor: theme.colors.primary,
  },
  badgeNotRecommended: {
    backgroundColor: '#EF4444',
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.white,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});

