import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { DUMMY_STUDY_STREAK, delay } from '../../services/dummyData';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getIntensityColor(intensity, colors) {
  if (intensity === 0) return colors.border;
  if (intensity === 1) return colors.tint.accent;
  if (intensity === 2) return 'rgba(16, 185, 129, 0.5)';
  return colors.brand.accent;
}

export default function StreaksTab() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      await delay(400);
      setData(DUMMY_STUDY_STREAK);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Study Streaks</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  const heatmapRows = [];
  for (let row = 0; row < 5; row++) {
    heatmapRows.push(data.heatmap.slice(row * 7, row * 7 + 7));
  }

  const weekProgress = data.this_week_days / 7;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Streaks</Text>
        <View style={styles.levelBadge}>
          <Feather name="award" size={13} color={colors.brand.secondary} />
          <Text style={styles.levelText}>Lv {data.level} · {data.level_name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero streak card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconContainer}>
              <Feather name="zap" size={32} color={colors.brand.warning} />
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroNumber}>{data.current_streak}</Text>
              <Text style={styles.heroLabel}>Day Streak</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>{data.xp_points.toLocaleString()} XP</Text>
            </View>
          </View>

          <View style={styles.xpProgressRow}>
            <Text style={styles.xpProgressLabel}>
              {data.xp_to_next_level} XP to {data.next_level_name}
            </Text>
          </View>
          <View style={styles.xpProgressBar}>
            <View
              style={[
                styles.xpProgressFill,
                { width: `${Math.round((data.xp_points / (data.xp_points + data.xp_to_next_level)) * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="zap" size={18} color={colors.brand.warning} />
            <Text style={styles.statNumber}>{data.current_streak}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Feather name="trending-up" size={18} color={colors.brand.primary} />
            <Text style={styles.statNumber}>{data.longest_streak}</Text>
            <Text style={styles.statLabel}>Longest</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="calendar" size={18} color={colors.brand.accent} />
            <Text style={styles.statNumber}>{data.total_study_days}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
        </View>

        {/* This week progress */}
        <View style={styles.section}>
          <View style={styles.weekRow}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <Text style={styles.weekCount}>{data.this_week_days} / 7 days</Text>
          </View>
          <View style={styles.weekBarBg}>
            <View style={[styles.weekBarFill, { width: `${weekProgress * 100}%` }]} />
          </View>
        </View>

        {/* Activity heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity (Last 35 Days)</Text>
          <View style={styles.heatmapDayRow}>
            {DAYS.map((d, i) => (
              <Text key={i} style={styles.heatmapDayLabel}>{d}</Text>
            ))}
          </View>
          {heatmapRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.heatmapRow}>
              {row.map((cell) => (
                <View
                  key={cell.day}
                  style={[styles.heatmapCell, { backgroundColor: getIntensityColor(cell.intensity, colors) }]}
                />
              ))}
            </View>
          ))}
          <View style={styles.heatmapLegend}>
            <Text style={styles.legendLabel}>Less</Text>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.legendCell, { backgroundColor: getIntensityColor(i, colors) }]} />
            ))}
            <Text style={styles.legendLabel}>More</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <FlatList
            horizontal
            data={data.badges}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeListContent}
            renderItem={({ item }) => (
              <View style={[styles.badgeCard, !item.earned && styles.badgeCardUnearned]}>
                <View style={[
                  styles.badgeIconContainer,
                  { backgroundColor: item.earned ? colors.tint.accent : colors.background.tertiary },
                ]}>
                  <Feather
                    name={item.icon}
                    size={22}
                    color={item.earned ? colors.brand.accent : colors.text.inactive}
                  />
                </View>
                <Text style={[styles.badgeName, !item.earned && styles.badgeNameUnearned]} numberOfLines={2}>
                  {item.name}
                </Text>
                {!item.earned && (
                  <Feather name="lock" size={10} color={colors.text.inactive} style={{ marginTop: 2 }} />
                )}
              </View>
            )}
          />
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
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tint.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  levelText: {
    fontSize: SIZES.sm,
    color: c.brand.secondary,
    ...FONTS.semibold,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Hero
  heroCard: {
    margin: SIZES.padding,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding * 1.25,
    borderWidth: 1,
    borderColor: c.border,
    ...SHADOWS.medium,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.tint.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroNumber: {
    fontSize: 52,
    color: c.text.primary,
    lineHeight: 58,
    ...FONTS.bold,
  },
  heroLabel: {
    fontSize: SIZES.base,
    color: c.text.muted,
    ...FONTS.medium,
  },
  xpBadge: {
    backgroundColor: c.tint.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  xpText: {
    fontSize: SIZES.sm,
    color: c.brand.accent,
    ...FONTS.semibold,
  },
  xpProgressRow: {
    marginBottom: 6,
  },
  xpProgressLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.regular,
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: c.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: c.brand.accent,
    borderRadius: 3,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  statCardMiddle: {
    borderColor: c.brand.primary,
  },
  statNumber: {
    fontSize: SIZES.xxl,
    color: c.text.primary,
    marginTop: 6,
    marginBottom: 2,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.regular,
  },

  // Sections
  section: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: c.border,
  },
  sectionTitle: {
    fontSize: SIZES.base,
    color: c.text.primary,
    marginBottom: 12,
    ...FONTS.semibold,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekCount: {
    fontSize: SIZES.sm,
    color: c.brand.secondary,
    ...FONTS.semibold,
  },
  weekBarBg: {
    height: 10,
    backgroundColor: c.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  weekBarFill: {
    height: '100%',
    backgroundColor: c.brand.secondary,
    borderRadius: 5,
  },

  // Heatmap
  heatmapDayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  heatmapDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.xs,
    color: c.text.inactive,
    ...FONTS.medium,
  },
  heatmapRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 2,
    borderRadius: 3,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  legendLabel: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    ...FONTS.regular,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },

  // Badges
  badgeListContent: {
    paddingRight: 4,
    gap: 10,
  },
  badgeCard: {
    width: 80,
    alignItems: 'center',
    padding: 10,
    backgroundColor: c.background.tertiary,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: c.border,
  },
  badgeCardUnearned: {
    opacity: 0.55,
  },
  badgeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: SIZES.xs,
    color: c.text.primary,
    textAlign: 'center',
    ...FONTS.medium,
  },
  badgeNameUnearned: {
    color: c.text.inactive,
  },
});
