import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../theme';

export type ButtonVariant = 'common' | 'destructive' | 'outline';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'common',
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    };

    switch (variant) {
      case 'common':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? '#242424' : '#242424',
          opacity: isDisabled ? 0.3 : 1,
        };
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? '#C94A4A' : '#C94A4A',
          opacity: isDisabled ? 0.3 : 1,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#242424',
          opacity: isDisabled ? 0.3 : 1,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: 16,
      fontWeight: '600' as const,
    };

    switch (variant) {
      case 'common':
      case 'destructive':
        return {
          ...baseStyle,
          color: theme.colors.white,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: '#242424',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#242424' : theme.colors.white} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

