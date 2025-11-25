import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getCareTaskTitle } from '../../lib/careTask';
import { CareHistory, CareTask } from '../../types';
import { theme } from '../../theme';

interface HistoryListProps {
  history: CareHistory[];
  careTasks: CareTask[]; // Required to look up taskType from taskId
  limit?: number;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, careTasks, limit }) => {
  const displayHistory = limit ? history.slice(0, limit) : history;
  
  // Create a map of taskId to CareTask for quick lookup
  const taskMap = new Map(careTasks.map(t => [t.id, t]));

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (displayHistory.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No history yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {displayHistory.map(entry => (
        <View key={entry.id} style={styles.historyItem}>
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>
              {taskMap.get(entry.taskId) 
                ? getCareTaskTitle(taskMap.get(entry.taskId)!.type)
                : 'Unknown Task'}
            </Text>
            <Text style={styles.historyDate}>{formatDate(entry.completedAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: theme.spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

