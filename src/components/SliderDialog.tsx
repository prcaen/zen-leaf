import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../theme';

interface SliderDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  title: string;
  description?: string;
  initialValue: number;
  minValue: number;
  maxValue: number;
  step?: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const SliderDialog: React.FC<SliderDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  initialValue,
  minValue,
  maxValue,
  step = 1,
  unit = '',
  minLabel,
  maxLabel,
  confirmText = 'Save',
  cancelText = 'Cancel',
  icon = 'resize-outline',
  iconColor = theme.colors.primary,
}) => {
  const [value, setValue] = useState(initialValue);

  React.useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
  };

  const displayValue = () => {
    if (value >= maxValue && maxLabel) {
      return maxLabel;
    }
    if (value <= minValue && minLabel) {
      return minLabel;
    }

    return `${value}${unit}`;
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

          <View style={styles.valueContainer}>
            <Text style={styles.value}>{displayValue()}</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={minValue}
              maximumValue={maxValue}
              value={value}
              onValueChange={setValue}
              step={step}
              minimumTrackTintColor={iconColor}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={iconColor}
            />
            <View style={styles.labels}>
              <Text style={styles.labelText}>{minLabel || `${minValue}${unit}`}</Text>
              <Text style={styles.labelText}>{maxLabel || `${maxValue}${unit}`}</Text>
            </View>
          </View>

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
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  valueLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sliderContainer: {
    marginBottom: theme.spacing.xl,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  labelText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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

