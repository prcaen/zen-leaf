import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TabType } from '../types';
import { theme } from '../theme';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'today' && styles.tabActive]}
        onPress={() => onTabChange('today')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
          Today
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'soon' && styles.tabActive]}
        onPress={() => onTabChange('soon')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'soon' && styles.tabTextActive]}>
          Soon
        </Text>
      </TouchableOpacity>
    </View>
  );
};

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

