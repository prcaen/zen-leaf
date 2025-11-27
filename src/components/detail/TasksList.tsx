import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCareTaskDescription, getCareTaskTitle, isDueToday } from '../../lib/careTask';
import { theme } from '../../theme';
import { CareTask, CareTaskType } from '../../types';

interface TasksListProps {
  tasks: CareTask[];
  onTaskPress?: (taskId: string) => void;
}

export const TasksList: React.FC<TasksListProps> = ({ tasks, onTaskPress }) => {
  const getTaskIcon = (type: CareTaskType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case CareTaskType.WATER:
        return 'water-outline';
      case CareTaskType.FERTILIZE:
        return 'flask-outline';
      case CareTaskType.REPOT:
        return 'arrow-up-circle-outline';
      case CareTaskType.PRUNE:
        return 'cut-outline';
      case CareTaskType.PEST_CHECK:
        return 'bug-outline';
      default:
        return 'ellipse-outline';
    }
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No tasks for now</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.map(task => (
        <TouchableOpacity
          key={task.id}
          style={styles.taskItem}
          onPress={() => onTaskPress?.(task.id)}
          disabled={task.isLocked || !onTaskPress}
          activeOpacity={0.7}
        >
          <View style={styles.taskIcon}>
            <Ionicons name={getTaskIcon(task.type)} size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{getCareTaskTitle(task.type)}</Text>
            {getCareTaskDescription(task.type) && (
              <Text style={styles.taskDescription}>{getCareTaskDescription(task.type)}</Text>
            )}
          </View>
          {task.isLocked ? (
            <Ionicons name="lock-closed" size={20} color={theme.colors.textLight} />
          ) : isDueToday(task) ? (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  taskDescription: {
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

