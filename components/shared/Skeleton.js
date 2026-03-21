/**
 * Vectra — Skeleton Loader System
 *
 * Base: <SkeletonBox> — an animated shimmer rectangle.
 *
 * Screen-specific layouts exported below:
 *   SkeletonCourseList   — My Courses tab
 *   SkeletonLectureList  — Lectures tab
 *   SkeletonProfile      — Profile tab
 *   SkeletonStreaks       — Streaks tab
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Base animated shimmer box ────────────────────────────────────────────────

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.background.tertiary, opacity },
        style,
      ]}
    />
  );
}

// ─── SkeletonCourseList — My Courses screen ──────────────────────────────────

function CourseCardSkeleton({ colors }) {
  return (
    <View style={[skStyles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border }]}>
      {/* Badge row */}
      <View style={skStyles.row}>
        <SkeletonBox width={72} height={24} borderRadius={6} />
        <SkeletonBox width={52} height={24} borderRadius={6} />
      </View>
      {/* Course name */}
      <SkeletonBox width="85%" height={16} style={{ marginTop: 12 }} />
      <SkeletonBox width="60%" height={14} style={{ marginTop: 6 }} />
      {/* Footer */}
      <View style={[skStyles.row, { marginTop: 14 }]}>
        <SkeletonBox width={140} height={13} borderRadius={6} />
        <SkeletonBox width={16} height={16} borderRadius={8} />
      </View>
    </View>
  );
}

export function SkeletonCourseList() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={[skStyles.header, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <SkeletonBox width={140} height={22} borderRadius={6} />
          <SkeletonBox width={200} height={14} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>
      {/* Search */}
      <View style={skStyles.searchWrap}>
        <SkeletonBox height={44} borderRadius={SIZES.radius} />
      </View>
      {/* Section header */}
      <View style={[skStyles.row, skStyles.sectionRow]}>
        <SkeletonBox width={110} height={16} borderRadius={6} />
        <SkeletonBox width={60} height={14} borderRadius={6} />
      </View>
      {/* Cards */}
      <View style={skStyles.listPad}>
        {[1, 2, 3, 4].map((i) => <CourseCardSkeleton key={i} colors={colors} />)}
      </View>
    </SafeAreaView>
  );
}

// ─── SkeletonLectureList — Lectures tab ──────────────────────────────────────

function LectureCardSkeleton({ colors }) {
  return (
    <View style={[skStyles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border }]}>
      <View style={skStyles.row}>
        <SkeletonBox width={68} height={22} borderRadius={6} />
        <SkeletonBox width={80} height={22} borderRadius={6} />
      </View>
      <SkeletonBox width="90%" height={17} style={{ marginTop: 10 }} />
      <SkeletonBox width="65%" height={14} style={{ marginTop: 6 }} />
      <View style={[skStyles.row, { marginTop: 12 }]}>
        <SkeletonBox width={70} height={13} borderRadius={6} />
        <SkeletonBox width={70} height={13} borderRadius={6} />
        <SkeletonBox width={70} height={13} borderRadius={6} />
      </View>
    </View>
  );
}

export function SkeletonLectureList() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, paddingHorizontal: SIZES.padding * 1.5 }}>
      {[1, 2, 3, 4].map((i) => <LectureCardSkeleton key={i} colors={colors} />)}
    </View>
  );
}

// ─── SkeletonProfile — Profile tab ───────────────────────────────────────────

export function SkeletonProfile() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Hero header */}
      <View style={[skStyles.profileHero, { backgroundColor: colors.background.secondary }]}>
        <SkeletonBox width={88} height={88} borderRadius={44} />
        <SkeletonBox width={160} height={20} borderRadius={6} style={{ marginTop: 12 }} />
        <SkeletonBox width={120} height={14} borderRadius={6} style={{ marginTop: 6 }} />
      </View>
      {/* Stats row */}
      <View style={[skStyles.statsRow, { borderBottomColor: colors.border }]}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={skStyles.statItem}>
            <SkeletonBox width={36} height={22} borderRadius={6} />
            <SkeletonBox width={52} height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
      {/* Info cards */}
      <View style={skStyles.listPad}>
        <SkeletonBox height={52} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
        <SkeletonBox height={52} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
        <SkeletonBox height={52} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
        <SkeletonBox height={52} borderRadius={SIZES.radius} />
      </View>
    </SafeAreaView>
  );
}

// ─── SkeletonStreaks — Streaks tab ────────────────────────────────────────────

export function SkeletonStreaks() {
  const { colors } = useTheme();
  const cellSize = (SCREEN_WIDTH - SIZES.padding * 3 - 24) / 7;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={[skStyles.header, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border }]}>
        <SkeletonBox width={160} height={22} borderRadius={6} />
      </View>

      <View style={skStyles.listPad}>
        {/* Big streak card */}
        <View style={[skStyles.streakCard, { backgroundColor: colors.background.secondary, borderColor: colors.border }]}>
          <SkeletonBox width={64} height={64} borderRadius={32} style={{ alignSelf: 'center' }} />
          <SkeletonBox width={80} height={16} borderRadius={6} style={{ alignSelf: 'center', marginTop: 10 }} />
          <SkeletonBox width={120} height={13} borderRadius={6} style={{ alignSelf: 'center', marginTop: 6 }} />
        </View>

        {/* Stats row */}
        <View style={[skStyles.row, { marginTop: 16, gap: 10 }]}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[skStyles.miniStat, { backgroundColor: colors.background.secondary, borderColor: colors.border, flex: 1 }]}>
              <SkeletonBox width={40} height={22} borderRadius={6} style={{ alignSelf: 'center' }} />
              <SkeletonBox width={60} height={12} borderRadius={6} style={{ alignSelf: 'center', marginTop: 6 }} />
            </View>
          ))}
        </View>

        {/* Heatmap grid */}
        <View style={[skStyles.heatmapCard, { backgroundColor: colors.background.secondary, borderColor: colors.border }]}>
          <SkeletonBox width={100} height={14} borderRadius={6} style={{ marginBottom: 14 }} />
          {/* Day labels */}
          <View style={skStyles.heatmapRow}>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <SkeletonBox key={d} width={cellSize} height={10} borderRadius={3} style={{ marginHorizontal: 2 }} />
            ))}
          </View>
          {/* 5 weeks of cells */}
          {[0, 1, 2, 3, 4].map((week) => (
            <View key={week} style={[skStyles.heatmapRow, { marginTop: 6 }]}>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <SkeletonBox key={day} width={cellSize} height={cellSize} borderRadius={4} style={{ marginHorizontal: 2 }} />
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const skStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  searchWrap: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 12,
  },
  sectionRow: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 20,
    paddingBottom: 12,
  },
  listPad: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 4,
  },
  card: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Profile
  profileHero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: SIZES.padding,
  },
  statsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  // Streaks
  streakCard: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 24,
    marginBottom: 4,
  },
  miniStat: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  heatmapCard: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
