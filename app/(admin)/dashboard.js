import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';
import { delay, DUMMY_ADMIN_DASHBOARD } from '../../services/dummyData';

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      await delay(500);
      setStats(DUMMY_ADMIN_DASHBOARD);
    } catch (err) {
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  const styles = createStyles(colors);

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: 'users',
      color: colors.brand.primary,
      tint: colors.tint.primary,
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      icon: 'file-text',
      color: colors.brand.warning,
      tint: colors.tint.warning,
    },
    {
      label: 'Total Questions',
      value: stats?.totalQuestions ?? 0,
      icon: 'upload',
      color: colors.brand.accent,
      tint: colors.tint.accent,
    },
    {
      label: 'Total Lectures',
      value: stats?.totalLectures ?? 0,
      icon: 'mic',
      color: colors.brand.secondary,
      tint: colors.tint.secondary,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.secondary}
            colors={[colors.brand.secondary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
        </View>

        {/* Switch to Student App */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => router.replace('/(tabs)/my-courses')}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={18} color={colors.brand.primary} />
          <Text style={styles.switchButtonText}>Switch to Student App</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.secondary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.tint }]}>
                  <Feather name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SIZES.padding * 1.5,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: SIZES.xl,
      color: colors.text.primary,
      ...FONTS.bold,
    },
    adminBadge: {
      backgroundColor: colors.brand.error,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginLeft: 10,
    },
    adminBadgeText: {
      fontSize: SIZES.xs,
      color: '#FFFFFF',
      ...FONTS.bold,
      letterSpacing: 0.5,
    },
    switchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: SIZES.padding * 1.5,
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.tint.primary,
      borderRadius: SIZES.radius,
    },
    switchButtonText: {
      fontSize: SIZES.md,
      color: colors.brand.primary,
      marginLeft: 8,
      ...FONTS.semibold,
    },
    loadingContainer: {
      paddingVertical: 60,
      alignItems: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: SIZES.padding * 1.5,
      marginTop: 20,
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: 20,
      marginBottom: 14,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: SIZES.xxxl,
      color: colors.text.primary,
      ...FONTS.bold,
    },
    statLabel: {
      fontSize: SIZES.sm,
      color: colors.text.muted,
      marginTop: 4,
      ...FONTS.medium,
    },
  });
