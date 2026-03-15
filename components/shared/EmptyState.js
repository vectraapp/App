import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export default function EmptyState({
  icon = 'inbox',
  title = 'Nothing here yet',
  message = '',
  actionLabel,
  onAction,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.background.tertiary }]}>
        <Feather name={icon} size={48} color={colors.text.muted} />
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.text.muted }]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: 40,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.lg,
    textAlign: 'center',
    marginBottom: 8,
    ...FONTS.semibold,
  },
  message: {
    fontSize: SIZES.md,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    ...FONTS.regular,
  },
  button: {
    minWidth: 160,
  },
});
