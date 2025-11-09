import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

interface TaskSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actionButton?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  subtitle,
  children,
  actionButton,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.title}>{title}</Text>

        {/* Content */}
        <View style={styles.content}>{children}</View>

        {/* Action Button */}
        {actionButton && (
          <TouchableOpacity
            style={[styles.button, actionButton.disabled && styles.buttonDisabled]}
            onPress={actionButton.onPress}
            disabled={actionButton.disabled}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{actionButton.label}</Text>
          </TouchableOpacity>
        )}

        {/* Subtitle */}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.sageLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

