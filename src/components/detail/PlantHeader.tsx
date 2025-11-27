import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';

interface PlantHeaderProps {
  name: string;
  room: string;
  imageUrl?: string;
  onNamePress?: () => void;
  onRoomPress?: () => void;
  onImageUpload?: () => void;
}

export const PlantHeader: React.FC<PlantHeaderProps> = ({
  name,
  room,
  imageUrl,
  onNamePress,
  onRoomPress,
  onImageUpload,
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
        {/* Upload Button */}
        {onImageUpload && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={onImageUpload}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.info}>
          <TouchableOpacity
            onPress={onNamePress}
            disabled={!onNamePress}
            activeOpacity={0.7}
          >
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{name}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRoomPress}
            disabled={!onRoomPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationContainer}>
              <Text style={styles.location}>{room}</Text>
            </View>
          </TouchableOpacity>
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
    position: 'relative',
    minHeight: 180,
  },
  image: {
    width: '100%',
    height: 180,
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  location: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  uploadButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
});

