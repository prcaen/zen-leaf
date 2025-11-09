import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

interface PlantGridItemProps {
  plantId: string;
  plantName: string;
  imageUrl?: string;
}

export const PlantGridItem: React.FC<PlantGridItemProps> = ({
  plantId,
  plantName,
  imageUrl,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/plant/${plantId}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="leaf" size={48} color="#4a4a4a" />
          </View>
        )}
      </View>
      <Text style={styles.plantName} numberOfLines={2}>
        {plantName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    marginBottom: theme.spacing.sm,
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
    backgroundColor: '#2a2a2a',
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 18,
  },
});

