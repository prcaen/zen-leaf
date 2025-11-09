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

      <View style={styles.infoContainer}>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.sage,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    width: 180,
    height: 180,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  info: {
    alignItems: 'center',
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
});

