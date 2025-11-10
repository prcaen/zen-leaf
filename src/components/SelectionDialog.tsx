import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../theme';

export interface SelectionOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SelectionDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedId: string) => void;
  title: string;
  description?: string;
  options: SelectionOption[];
  initialSelectedId: string;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const SelectionDialog: React.FC<SelectionDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  options,
  initialSelectedId,
  confirmText = 'Save',
  cancelText = 'Cancel',
  icon = 'list-outline',
  iconColor = theme.colors.primary,
}) => {
  const [selectedId, setSelectedId] = useState(initialSelectedId);

  React.useEffect(() => {
    if (visible) {
      setSelectedId(initialSelectedId);
    }
  }, [visible, initialSelectedId]);

  const handleConfirm = () => {
    onConfirm(selectedId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.dialog}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
              <Ionicons name={icon} size={32} color={theme.colors.white} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  selectedId === option.id && styles.optionSelected,
                ]}
                onPress={() => setSelectedId(option.id)}
                activeOpacity={0.7}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selectedId === option.id ? theme.colors.primary : theme.colors.textSecondary}
                    style={styles.optionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    selectedId === option.id && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedId === option.id && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  dialog: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...theme.shadows.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  optionsList: {
    maxHeight: 300,
    marginBottom: theme.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: theme.colors.sageLight,
    borderColor: theme.colors.primary,
  },
  optionIcon: {
    marginRight: theme.spacing.sm,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.sageLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

