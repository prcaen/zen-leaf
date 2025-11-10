import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlantCatalogItem as PlantCatalogItemType } from '../data/plantCatalog';
import { theme } from '../theme';

interface PlantCatalogItemProps {
  plant: PlantCatalogItemType;
  onPress: () => void;
}

export const PlantCatalogItem: React.FC<PlantCatalogItemProps> = ({ plant, onPress }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return theme.colors.primaryLight;
      case 'Moderate':
        return theme.colors.textLight;
      case 'Advanced':
        return theme.colors.sageDark;
      default:
        return theme.colors.primaryLight;
    }
  };

  const getIconName = (icon: string) => {
    switch (icon) {
      case 'person':
        return 'person-outline';
      case 'sun':
        return 'sunny-outline';
      case 'cloud':
        return 'water-outline';
      default:
        return 'help-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {plant.imageUrl ? (
          <Image source={{ uri: plant.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="leaf" size={32} color={theme.colors.primaryLight} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{plant.name}</Text>
        {plant.aliases && (
          <Text style={styles.aliases} numberOfLines={1}>
            {plant.aliases}
          </Text>
        )}
        <View style={styles.careInfo}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(plant.difficulty) }]}>
            <Text style={styles.difficultyText}>{plant.difficulty}</Text>
          </View>
          <View style={styles.iconsContainer}>
            {plant.careIcons.map((icon, index) => (
              <Ionicons
                key={index}
                name={getIconName(icon) as any}
                size={14}
                color={theme.colors.textSecondary}
                style={styles.icon}
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: theme.colors.sageLight,
    marginRight: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.sageDark,
    marginBottom: 4,
  },
  aliases: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  careInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.white,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },
});

