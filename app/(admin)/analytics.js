import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { DUMMY_ANALYTICS, delay } from '../../services/dummyData';

const DAU_MAX_HEIGHT = 80;

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      await delay(500);
      setData(DUMMY_ANALYTICS);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  const { overview, dau_trend, mau_trend, feature_usage, top_courses, retention } = data;

  const dauMax = Math.max(...dau_trend.map((d) => d.value));
  const mauMax = Math.max(...mau_trend.map((d) => d.value));

  const overviewCards = [
    { label: 'Total Users', value: overview.total_users.toLocaleString(), icon: 'users', color: colors.brand.primary, bg: colors.tint.primary },
    { label: 'Active Today', value: overview.active_today.toString(), icon: 'activity', color: colors.brand.accent, bg: colors.tint.accent },
    { label: 'Questions', value: overview.total_questions.toLocaleString(), icon: 'file-text', color: colors.brand.secondary, bg: colors.tint.secondary },
    { label: 'Lectures', value: overview.total_lectures.toLocaleString(), icon: 'mic', color: colors.brand.warning, bg: colors.tint.warning },
  ];

  const retentionCards = [
    { label: 'Day 1', value: retention.day1 },
    { label: 'Day 7', value: retention.day7 },
    { label: 'Day 14', value: retention.day14 },
    { label: 'Day 30', value: retention.day30 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Feather name="bar-chart-2" size={22} color={colors.brand.secondary} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Overview stat cards — 2-column grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.gridRow}>
          {overviewCards.map((card) => (
            <View key={card.label} style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: card.bg }]}>
                <Feather name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={styles.overviewValue}>{card.value}</Text>
              <Text style={styles.overviewLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Additional overview */}
        <View style={styles.extraRow}>
          <View style={styles.extraCard}>
            <Text style={styles.extraValue}>{overview.active_this_week.toLocaleString()}</Text>
            <Text style={styles.extraLabel}>Active This Week</Text>
          </View>
          <View style={styles.extraCard}>
            <Text style={styles.extraValue}>{overview.avg_session_minutes} min</Text>
            <Text style={styles.extraLabel}>Avg. Session</Text>
          </View>
          <View style={styles.extraCard}>
            <Text style={styles.extraValue}>{overview.questions_viewed_today.toLocaleString()}</Text>
            <Text style={styles.extraLabel}>Q Views Today</Text>
          </View>
        </View>

        {/* DAU Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.chartTitle}>Daily Active Users (This Week)</Text>
          <View style={styles.barChart}>
            {dau_trend.map((item) => {
              const barHeight = dauMax > 0 ? Math.max(4, (item.value / dauMax) * DAU_MAX_HEIGHT) : 4;
              return (
                <View key={item.label} style={styles.barGroup}>
                  <Text style={styles.barValue}>{item.value}</Text>
                  <View style={[styles.bar, { height: barHeight, backgroundColor: colors.brand.primary }]} />
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* MAU Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.chartTitle}>Monthly Active Users (Last 7 Months)</Text>
          <View style={styles.barChart}>
            {mau_trend.map((item) => {
              const barHeight = mauMax > 0 ? Math.max(4, (item.value / mauMax) * DAU_MAX_HEIGHT) : 4;
              return (
                <View key={item.label} style={styles.barGroup}>
                  <Text style={styles.barValue}>{item.value}</Text>
                  <View style={[styles.bar, { height: barHeight, backgroundColor: colors.brand.secondary }]} />
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Feature Usage */}
        <View style={styles.section}>
          <Text style={styles.chartTitle}>Feature Usage</Text>
          {feature_usage.map((item) => (
            <View key={item.feature} style={styles.featureRow}>
              <View style={styles.featureNameRow}>
                <Text style={styles.featureName}>{item.feature}</Text>
                <Text style={styles.featurePct}>{item.pct}%</Text>
              </View>
              <View style={styles.featureBarBg}>
                <View style={[styles.featureBarFill, { width: `${item.pct}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Top Courses */}
        <View style={styles.section}>
          <Text style={styles.chartTitle}>Top Courses</Text>
          {top_courses.map((course, idx) => (
            <View key={course.code} style={styles.courseRow}>
              <View style={styles.courseRankContainer}>
                <Text style={styles.courseRank}>#{idx + 1}</Text>
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseCode}>{course.code}</Text>
                <Text style={styles.courseName}>{course.name}</Text>
              </View>
              <View style={styles.courseStats}>
                <View style={styles.courseStatItem}>
                  <Feather name="eye" size={11} color={colors.text.muted} />
                  <Text style={styles.courseStatText}>{course.views}</Text>
                </View>
                <View style={styles.courseStatItem}>
                  <Feather name="file-text" size={11} color={colors.text.muted} />
                  <Text style={styles.courseStatText}>{course.questions}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Retention */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.chartTitle}>User Retention</Text>
          <View style={styles.retentionGrid}>
            {retentionCards.map((card) => (
              <View key={card.label} style={styles.retentionCard}>
                <Text style={styles.retentionValue}>{card.value}%</Text>
                <Text style={styles.retentionLabel}>{card.label}</Text>
                <View style={styles.retentionBarBg}>
                  <View
                    style={[
                      styles.retentionBarFill,
                      {
                        width: `${card.value}%`,
                        backgroundColor:
                          card.value >= 60
                            ? colors.brand.accent
                            : card.value >= 40
                            ? colors.brand.warning
                            : colors.brand.error,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: c.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    color: c.text.primary,
    ...FONTS.bold,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.base,
    color: c.text.primary,
    marginBottom: 12,
    ...FONTS.semibold,
  },

  // Overview grid
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  overviewCard: {
    width: '47.5%',
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'flex-start',
    ...SHADOWS.small,
  },
  overviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  overviewValue: {
    fontSize: SIZES.xxl,
    color: c.text.primary,
    ...FONTS.bold,
  },
  overviewLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },

  // Extra row
  extraRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  extraCard: {
    flex: 1,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radiusSm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  extraValue: {
    fontSize: SIZES.md,
    color: c.text.primary,
    ...FONTS.bold,
  },
  extraLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    textAlign: 'center',
    marginTop: 2,
    ...FONTS.regular,
  },

  // Section card
  section: {
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: c.border,
    ...SHADOWS.small,
  },
  chartTitle: {
    fontSize: SIZES.sm,
    color: c.text.primary,
    marginBottom: 14,
    ...FONTS.semibold,
  },

  // Bar chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: DAU_MAX_HEIGHT + 36,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    marginBottom: 4,
    ...FONTS.medium,
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    marginTop: 5,
    ...FONTS.medium,
  },

  // Feature usage
  featureRow: {
    marginBottom: 10,
  },
  featureNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  featureName: {
    fontSize: SIZES.sm,
    color: c.text.secondary,
    ...FONTS.medium,
  },
  featurePct: {
    fontSize: SIZES.sm,
    color: c.brand.primary,
    ...FONTS.semibold,
  },
  featureBarBg: {
    height: 6,
    backgroundColor: c.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  featureBarFill: {
    height: '100%',
    backgroundColor: c.brand.primary,
    borderRadius: 3,
  },

  // Top courses
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  courseRankContainer: {
    width: 28,
    alignItems: 'center',
  },
  courseRank: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    ...FONTS.semibold,
  },
  courseInfo: {
    flex: 1,
    marginLeft: 8,
  },
  courseCode: {
    fontSize: SIZES.sm,
    color: c.brand.primary,
    ...FONTS.semibold,
  },
  courseName: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.regular,
  },
  courseStats: {
    alignItems: 'flex-end',
    gap: 3,
  },
  courseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  courseStatText: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.regular,
  },

  // Retention
  retentionGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  retentionCard: {
    width: '47%',
    backgroundColor: c.background.tertiary,
    borderRadius: SIZES.radiusSm,
    padding: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  retentionValue: {
    fontSize: SIZES.xxl,
    color: c.text.primary,
    ...FONTS.bold,
  },
  retentionLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    marginBottom: 8,
    ...FONTS.medium,
  },
  retentionBarBg: {
    height: 4,
    backgroundColor: c.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  retentionBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
