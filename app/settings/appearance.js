import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import { useTheme } from '../../context/ThemeContext';

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, setTheme, isDark, colors } = useTheme();

  const themeOptions = [
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Perfect for late night studying',
      icon: 'moon',
    },
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Clear view for daytime studying',
      icon: 'sun',
    },
    {
      id: 'auto',
      label: 'Auto (System)',
      description: 'Match your device settings',
      icon: 'smartphone',
    },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appearance</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Options */}
          <Text style={styles.sectionTitle}>Theme</Text>
          <Card style={styles.optionsCard}>
            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  index < themeOptions.length - 1 && styles.optionBorder,
                ]}
                onPress={() => setTheme(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.iconContainer,
                    theme === option.id && styles.iconContainerActive,
                  ]}>
                    <Feather
                      name={option.icon}
                      size={20}
                      color={theme === option.id ? colors.brand.secondary : colors.text.muted}
                    />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    <Text style={styles.optionDesc}>{option.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioOuter,
                  theme === option.id && styles.radioOuterActive,
                ]}>
                  {theme === option.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Theme Preview */}
          <Text style={styles.sectionTitle}>Preview</Text>
          <Card style={styles.previewCard}>
            <View style={[styles.previewHeader, { backgroundColor: colors.background.navbar }]}>
              <View style={styles.previewHeaderLeft}>
                <View style={[styles.previewDot, { backgroundColor: colors.brand.primary }]} />
                <View style={[styles.previewDot, { backgroundColor: colors.brand.secondary }]} />
                <View style={[styles.previewDot, { backgroundColor: colors.brand.accent }]} />
              </View>
              <Text style={[styles.previewTitle, { color: colors.text.primary }]}>Vectra</Text>
            </View>
            <View style={[styles.previewBody, { backgroundColor: colors.background.primary }]}>
              <View style={[styles.previewTextLine, { backgroundColor: colors.background.tertiary }]} />
              <View style={[styles.previewTextLine, { backgroundColor: colors.background.tertiary, width: '80%' }]} />
              <View style={[styles.previewTextLine, { backgroundColor: colors.background.tertiary, width: '60%' }]} />
            </View>
            <View style={[styles.previewNav, { backgroundColor: colors.background.navbar, borderTopColor: colors.border }]}>
              <View style={styles.previewNavItem}>
                <Feather name="book-open" size={16} color={colors.brand.secondary} />
              </View>
              <View style={styles.previewNavItem}>
                <Feather name="search" size={16} color={colors.text.muted} />
              </View>
              <View style={styles.previewNavItem}>
                <Feather name="mic" size={16} color={colors.text.muted} />
              </View>
              <View style={styles.previewNavItem}>
                <Feather name="user" size={16} color={colors.text.muted} />
              </View>
            </View>
          </Card>

          {/* Current Theme Info */}
          <Card style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name="info" size={18} color={colors.brand.primary} />
            </View>
            <Text style={styles.infoText}>
              {isDark
                ? 'Dark mode is active. Great for reducing eye strain in low-light conditions.'
                : 'Light mode is active. Optimized for well-lit environments.'}
            </Text>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  content: {
    padding: SIZES.padding * 1.5,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerActive: {
    backgroundColor: colors.tint.secondary,
  },
  optionTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  optionDesc: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.brand.secondary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.secondary,
  },
  previewCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.brand.secondary,
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewHeaderLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewTitle: {
    fontSize: SIZES.sm,
    ...FONTS.bold,
  },
  previewBody: {
    padding: 16,
    minHeight: 80,
  },
  previewTextLine: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  previewNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
  },
  previewNavItem: {
    padding: 6,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.tint.primaryLight,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    ...FONTS.regular,
  },
});
