import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import { WateringTask } from '../types';

interface PlantCardProps {
  task: WateringTask;
  isSelected: boolean;
  onToggleSelect: (plantId: string) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  task,
  isSelected,
  onToggleSelect,
}) => {
  const { plant, location, daysOverdue, isOverdue } = task;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Plant Image */}
        <View style={styles.imageContainer}>
          {plant.imageUrl ? (
            <Image source={{ uri: plant.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="leaf" size={32} color={theme.colors.primaryLight} />
            </View>
          )}
          {isOverdue && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{daysOverdue}d late</Text>
            </View>
          )}
        </View>

        {/* Plant Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{plant.name}</Text>
          <Text style={styles.location}>{location.name}</Text>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          onPress={() => onToggleSelect(plant.id)}
          activeOpacity={0.7}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={20} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.badge,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.badgeText,
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  bellButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});

