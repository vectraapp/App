import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

const SEMESTERS = [
  { id: 1, label: 'First Semester', ordinal: 'first' },
  { id: 2, label: 'Second Semester', ordinal: 'second' },
];

export default function SemesterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const semester = useAuthStore((s) => s.semester);
  const setSemester = useAuthStore((s) => s.setSemester);

  const handleSelect = (id) => {
    if (id === semester) return;

    const target = SEMESTERS.find((s) => s.id === id);
    Alert.alert(
      'Switch Semester?',
      `Your courses and materials will update to show ${target.label} content.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await setSemester(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Current Semester</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Select your active semester. Your course list updates automatically.
        </Text>

        {/* Options */}
        <View style={styles.options}>
          {SEMESTERS.map((item) => {
            const isActive = semester === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.option, isActive && styles.optionActive]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.numCircle, isActive && styles.numCircleActive]}>
                    <Text style={[styles.numText, isActive && styles.numTextActive]}>
                      {item.id}
                    </Text>
                  </View>
                  <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                    {item.label}
                  </Text>
                </View>
                {isActive && (
                  <Feather name="check" size={20} color={colors.brand.secondary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <Text style={styles.info}>
          Most students change this twice a year. Your selected semester is saved automatically.
        </Text>
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
  description: {
    fontSize: SIZES.base,
    color: colors.text.secondary,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 24,
    paddingBottom: 16,
    ...FONTS.regular,
  },
  options: {
    paddingHorizontal: SIZES.padding * 1.5,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    padding: 16,
  },
  optionActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.tint.secondary,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  numCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numCircleActive: {
    backgroundColor: colors.brand.secondary,
  },
  numText: {
    fontSize: SIZES.lg,
    color: colors.text.muted,
    ...FONTS.bold,
  },
  numTextActive: {
    color: colors.background.primary,
  },
  optionLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  optionLabelActive: {
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
  info: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 20,
    lineHeight: 20,
    ...FONTS.regular,
  },
});
