import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface PlantHeaderProps {
  name: string;
  location: string;
  imageUrl?: string;
}

export const PlantHeader: React.FC<PlantHeaderProps> = ({
  name,
  location,
  imageUrl,
}) => {
  return (
    <View style={styles.container}>
      {/* Plant Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="leaf" size={64} color={theme.colors.primaryLight} />
          </View>
        )}
      </View>

      {/* Plant Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    width: 180,
    height: 180,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  location: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: theme.colors.sageLight,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  actionLabelSecondary: {
    color: theme.colors.text,
  },
});

