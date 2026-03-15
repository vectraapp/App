import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  icon,
  style,
  ...rest
}) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? colors.brand.error
    : isFocused
    ? colors.brand.primary
    : colors.border;

  const styles = createStyles(colors);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.container, { borderColor }]}>
        {icon ? (
          <Feather
            name={icon}
            size={18}
            color={isFocused ? colors.brand.primary : colors.text.muted}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.inactive}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={18}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.md,
    color: colors.text.primary,
    marginBottom: 6,
    ...FONTS.medium,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: colors.background.tertiary,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.regular,
    padding: 0,
  },
  error: {
    fontSize: SIZES.sm,
    color: colors.brand.error,
    marginTop: 4,
    ...FONTS.regular,
  },
});
