import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { capitalizeFirstLetter } from '../../lib/string';
import { theme } from '../../theme';

export interface SettingItemData {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  lowerCaseValue?: boolean;
  onPress: () => void;
}

interface SettingsSectionProps {
  title: string;
  items: SettingItemData[];
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.itemIcon}>
              <Ionicons name={item.icon} size={20} color={theme.colors.text} />
              {(!item.value || item.value === 'Not set') && (
                <View style={styles.pastille} />
              )}
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {item.value && <Text style={styles.itemValue}>{item.lowerCaseValue ? item.value.toLowerCase() : capitalizeFirstLetter(item.value)}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  itemsContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  pastille: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

