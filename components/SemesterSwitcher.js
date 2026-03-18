import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FONTS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function SemesterSwitcher({ activeSemester, onSemesterChange }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.switcher}>
        <TouchableOpacity
          style={[styles.tab, activeSemester === 1 && styles.tabActive]}
          onPress={() => onSemesterChange(1)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeSemester === 1 && styles.tabTextActive]}>
            First Semester
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSemester === 2 && styles.tabActive]}
          onPress={() => onSemesterChange(2)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeSemester === 2 && styles.tabTextActive]}>
            Second Semester
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding * 1.5,
    marginTop: 12,
    marginBottom: 4,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: SIZES.radius - 2,
  },
  tabActive: {
    backgroundColor: colors.brand.secondary,
  },
  tabText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.semibold,
  },
  tabTextActive: {
    color: colors.background.primary,
  },
});
