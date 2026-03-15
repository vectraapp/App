import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function getDaysLeft(dateStr) {
  const examDate = new Date(dateStr);
  const now = new Date();
  const diffMs = examDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  return diffDays;
}

function getCountdownLabel(days) {
  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function getBorderColor(colorKey, colors) {
  if (colorKey === 'primary') return colors.brand.primary;
  if (colorKey === 'secondary') return colors.brand.secondary;
  if (colorKey === 'accent') return colors.brand.accent;
  return colors.brand.primary;
}

function getExamTypeBg(colorKey, colors) {
  if (colorKey === 'primary') return colors.tint.primary;
  if (colorKey === 'secondary') return colors.tint.secondary;
  if (colorKey === 'accent') return colors.tint.accent;
  return colors.tint.primary;
}

function getExamTypeText(colorKey, colors) {
  if (colorKey === 'primary') return colors.brand.primary;
  if (colorKey === 'secondary') return colors.brand.secondary;
  if (colorKey === 'accent') return colors.brand.accent;
  return colors.brand.primary;
}

export default function ExamCountdown({ exams }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!exams || exams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="calendar" size={20} color={colors.text.inactive} />
        <Text style={styles.emptyText}>No exams scheduled</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {exams.map((exam) => {
        const days = getDaysLeft(exam.exam_date);
        const borderColor = getBorderColor(exam.color, colors);
        const badgeBg = getExamTypeBg(exam.color, colors);
        const badgeText = getExamTypeText(exam.color, colors);
        const urgent = days <= 3 && days >= 0;

        return (
          <View
            key={exam.id}
            style={[styles.card, { borderLeftColor: borderColor }]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.courseCode}>{exam.course_code}</Text>
              <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.typeText, { color: badgeText }]}>{exam.exam_type}</Text>
              </View>
            </View>
            <Text style={styles.courseName} numberOfLines={2}>{exam.course_name}</Text>
            <View style={[
              styles.countdownBadge,
              urgent && { backgroundColor: colors.tint.error },
            ]}>
              <Feather
                name="clock"
                size={12}
                color={urgent ? colors.brand.error : colors.text.muted}
              />
              <Text style={[
                styles.countdownText,
                urgent && { color: colors.brand.error },
              ]}>
                {getCountdownLabel(days)}
              </Text>
            </View>
            <View style={styles.venueRow}>
              <Feather name="map-pin" size={11} color={colors.text.inactive} />
              <Text style={styles.venueText} numberOfLines={1}>{exam.venue}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (c) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 4,
    gap: 12,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    gap: 8,
  },
  emptyText: {
    fontSize: SIZES.sm,
    color: c.text.inactive,
    ...FONTS.regular,
  },
  card: {
    width: 170,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: c.border,
    ...SHADOWS.small,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  courseCode: {
    fontSize: SIZES.sm,
    color: c.text.primary,
    ...FONTS.bold,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    fontSize: SIZES.xs,
    ...FONTS.semibold,
  },
  courseName: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    marginBottom: 10,
    ...FONTS.regular,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.semibold,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueText: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    flex: 1,
    ...FONTS.regular,
  },
});
