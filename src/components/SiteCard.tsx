import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import { Plant } from '../types';

interface SiteCardProps {
  locationId: string;
  locationName: string;
  plantsInLocation: Plant[];
  overdueCount: number;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  locationId,
  locationName,
  plantsInLocation,
  overdueCount,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/room/${locationId}`);
  };

  // Get up to 4 plant images for the grid
  const plantImages = plantsInLocation.slice(0, 4);

  const renderImageGrid = () => {
    if (plantImages.length === 0) {
      return (
        <View style={styles.emptyGrid}>
          <Ionicons name="leaf-outline" size={48} color="#4a4a4a" />
        </View>
      );
    }

    if (plantImages.length === 1) {
      return (
        <View style={styles.singleImage}>
          {plantImages[0].imageUrl ? (
            <Image source={{ uri: plantImages[0].imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderSingle}>
              <Ionicons name="leaf" size={64} color="#4a4a4a" />
            </View>
          )}
        </View>
      );
    }

    if (plantImages.length === 2) {
      return (
        <View style={styles.twoImagesGrid}>
          {plantImages.map((plant, index) => (
            <View key={plant.id} style={index === 0 ? styles.halfImage : styles.halfImageLast}>
              {plant.imageUrl ? (
                <Image source={{ uri: plant.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.placeholderHalf}>
                  <Ionicons name="leaf" size={32} color="#4a4a4a" />
                </View>
              )}
            </View>
          ))}
        </View>
      );
    }

    // 3 or 4 images - grid layout
    return (
      <View style={styles.gridContainer}>
        {plantImages.map((plant, index) => {
          const isThree = plantImages.length === 3;
          const isLargeImage = isThree && index === 0;
          const isLastInRow = (isThree && index === 0) || (!isThree && index % 2 === 1) || (isThree && index > 0 && index % 2 === 0);

          return (
            <View
              key={plant.id}
              style={[
                styles.gridItem,
                isLargeImage && styles.gridItemLarge,
                isThree && index > 0 && styles.gridItemSmall,
                !isLastInRow && { marginRight: 1 },
              ]}
            >
              {plant.imageUrl ? (
                <Image source={{ uri: plant.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.placeholderGrid}>
                  <Ionicons name="leaf" size={24} color="#4a4a4a" />
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {renderImageGrid()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.locationName}>{locationName}</Text>
        <Text style={styles.plantCount}>{plantsInLocation.length} plantes</Text>
        {overdueCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{overdueCount} tâches</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: '#2a2a2a',
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#1a1a1a',
  },
  emptyGrid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  singleImage: {
    flex: 1,
  },
  twoImagesGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  halfImage: {
    flex: 1,
    marginRight: 1,
  },
  halfImageLast: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '49.5%',
    height: 99,
    marginBottom: 1,
  },
  gridItemLarge: {
    width: '100%',
    height: 99,
    marginBottom: 1,
  },
  gridItemSmall: {
    width: '49.5%',
    height: 99,
    marginBottom: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderSingle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  placeholderHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  placeholderGrid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  footer: {
    padding: theme.spacing.md,
    position: 'relative',
  },
  locationName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  plantCount: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  badge: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

