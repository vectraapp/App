import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function Card({ children, style, onPress }) {
  const { colors } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? { onPress, activeOpacity: 0.7 }
    : {};

  return (
    <Wrapper
      style={[
        styles.card,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.border,
        },
        style,
      ]}
      {...wrapperProps}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
});
