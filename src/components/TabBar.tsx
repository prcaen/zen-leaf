import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

export interface Tab<T = string> {
  value: T;
  label: string;
}

interface TabBarProps<T = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  containerStyle?: ViewStyle;
}

export function TabBar<T = string>({
  tabs,
  activeTab,
  onTabChange,
  containerStyle,
}: TabBarProps<T>) {
  return (
    <View style={[
      styles.container,
      containerStyle
    ]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={String(tab.value)}
          style={[
            styles.tab,
            activeTab === tab.value && styles.tabActive
          ]}
          onPress={() => onTabChange(tab.value)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.value && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.sageLight,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});

