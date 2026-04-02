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
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

const PERIODS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

export default function AdminAnalytics() {
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers] = useState(null);
  const [uploads, setUploads] = useState(null);
  const [activity, setActivity] = useState([]);

  const loadAll = async (selectedPeriod = period) => {
    try {
      const [usersRes, uploadsRes, activityRes] = await Promise.allSettled([
        api.get(`/admin/analytics/users?period=${selectedPeriod}`),
        api.get('/uploads/admin/stats'),
        api.get('/admin/activity-logs?limit=10'),
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.data || null);
      if (uploadsRes.status === 'fulfilled') setUploads(uploadsRes.value?.data || null);
      if (activityRes.status === 'fulfilled') {
        const logs = activityRes.value?.data || [];
        setActivity(Array.isArray(logs) ? logs.slice(0, 10) : []);
      }
    } catch {
      showToast('error', 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll(period);
  }, [period]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setLoading(true);
    loadAll(p);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const actionLabel = (action) => {
    const map = {
      approve_upload: 'Approved upload',
      reject_upload: 'Rejected upload',
      user_upload: 'New upload submitted',
      approve_question: 'Approved question',
      reject_question: 'Rejected question',
      update_settings: 'Updated settings',
    };
    return map[action] || action?.replace(/_/g, ' ') || 'Action';
  };

  const actionColor = (action) => {
    if (action?.includes('approve')) return colors.brand.accent;
    if (action?.includes('reject')) return colors.brand.error;
    if (action?.includes('upload')) return colors.brand.secondary;
    return colors.text.muted;
  };

  const StatBar = ({ value, max, color }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    );
  };

  const styles = createStyles(colors);

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
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.periodChip, period === p.value && styles.periodChipActive]}
                onPress={() => handlePeriodChange(p.value)}
              >
                <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.secondary} />
          </View>
        ) : (
          <>
            {/* Users */}
            <Text style={styles.sectionTitle}>Users</Text>
            <Card style={styles.card}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statBig}>{users?.totalUsers ?? '—'}</Text>
                  <Text style={styles.statSub}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statBig, { color: colors.brand.accent }]}>
                    {users?.newUsers ?? '—'}
                  </Text>
                  <Text style={styles.statSub}>New ({period})</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statBig, { color: colors.brand.secondary }]}>
                    {users?.studentEmailCount ?? '—'}
                  </Text>
                  <Text style={styles.statSub}>.edu emails</Text>
                </View>
              </View>

              {users?.byRole && Object.keys(users.byRole).length > 0 && (
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownTitle}>By Role</Text>
                  {Object.entries(users.byRole).map(([role, count]) => (
                    <View key={role} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{role}</Text>
                      <StatBar value={count} max={users.totalUsers} color={colors.brand.primary} />
                      <Text style={styles.breakdownValue}>{count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Content */}
            <Text style={styles.sectionTitle}>Uploads</Text>
            <Card style={styles.card}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statBig, { color: colors.brand.accent }]}>
                    {uploads?.approved ?? '—'}
                  </Text>
                  <Text style={styles.statSub}>Published</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statBig, { color: colors.brand.warning }]}>
                    {uploads?.pending ?? '—'}
                  </Text>
                  <Text style={styles.statSub}>Pending</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statBig, { color: colors.brand.error }]}>
                    {uploads?.rejected ?? '—'}
                  </Text>
                  <Text style={styles.statSub}>Rejected</Text>
                </View>
              </View>

              {uploads != null && (
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownTitle}>Approval Rate</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Approved</Text>
                    <StatBar
                      value={uploads.approved ?? 0}
                      max={(uploads.approved ?? 0) + (uploads.rejected ?? 0)}
                      color={colors.brand.accent}
                    />
                    <Text style={styles.breakdownValue}>
                      {(uploads.approved ?? 0) + (uploads.rejected ?? 0) > 0
                        ? `${Math.round(((uploads.approved ?? 0) / ((uploads.approved ?? 0) + (uploads.rejected ?? 0))) * 100)}%`
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Today</Text>
                    <StatBar
                      value={uploads.today ?? 0}
                      max={Math.max(uploads.today ?? 0, 5)}
                      color={colors.brand.secondary}
                    />
                    <Text style={styles.breakdownValue}>{uploads.today ?? 0}</Text>
                  </View>
                </View>
              )}
            </Card>

            {/* Coming Soon */}
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            <Card style={styles.card}>
              <View style={styles.comingSoonGrid}>
                {[
                  { icon: 'trending-up', label: 'Daily Active Users', note: 'PostHog / Mixpanel' },
                  { icon: 'map-pin', label: 'User Locations', note: 'IP geolocation API' },
                  { icon: 'smartphone', label: 'Crash Reports', note: 'Sentry SDK' },
                  { icon: 'bell', label: 'Push Open Rate', note: 'Expo Push tracking' },
                  { icon: 'share-2', label: 'Share Redemptions', note: 'Available in DB now' },
                  { icon: 'dollar-sign', label: 'Revenue', note: 'When payments go live' },
                ].map((item) => (
                  <View key={item.label} style={styles.comingSoonItem}>
                    <View style={[styles.comingSoonIcon, { backgroundColor: colors.background.tertiary }]}>
                      <Feather name={item.icon} size={18} color={colors.text.muted} />
                    </View>
                    <Text style={styles.comingSoonLabel}>{item.label}</Text>
                    <Text style={styles.comingSoonNote}>{item.note}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Card style={styles.card}>
              {activity.length === 0 ? (
                <Text style={styles.emptyText}>No recent activity</Text>
              ) : (
                activity.map((log, i) => (
                  <View
                    key={log.id || i}
                    style={[styles.activityRow, i < activity.length - 1 && styles.activityRowBorder]}
                  >
                    <View style={[styles.activityDot, { backgroundColor: actionColor(log.action) }]} />
                    <View style={styles.activityBody}>
                      <Text style={styles.activityAction}>{actionLabel(log.action)}</Text>
                      {log.details?.course_code && (
                        <Text style={styles.activityMeta}>{log.details.course_code}</Text>
                      )}
                    </View>
                    <Text style={styles.activityTime}>{formatDate(log.created_at)}</Text>
                  </View>
                ))
              )}
            </Card>

            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.primary },
    scrollContent: { paddingBottom: 40 },
    header: {
      paddingHorizontal: SIZES.padding * 1.5,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: SIZES.xl, color: colors.text.primary, ...FONTS.bold, marginBottom: 12 },
    periodRow: { flexDirection: 'row', gap: 8 },
    periodChip: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border,
    },
    periodChipActive: { backgroundColor: colors.brand.secondary, borderColor: colors.brand.secondary },
    periodText: { fontSize: SIZES.sm, color: colors.text.secondary, ...FONTS.medium },
    periodTextActive: { color: colors.background.primary },
    loadingContainer: { paddingVertical: 80, alignItems: 'center' },
    sectionTitle: {
      fontSize: SIZES.md, color: colors.text.primary, ...FONTS.semibold,
      paddingHorizontal: SIZES.padding * 1.5, marginTop: 20, marginBottom: 10,
    },
    card: { marginHorizontal: SIZES.padding * 1.5, marginBottom: 4 },
    statRow: { flexDirection: 'row', alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
    statBig: { fontSize: SIZES.xxl, color: colors.text.primary, ...FONTS.bold },
    statSub: { fontSize: SIZES.xs, color: colors.text.muted, marginTop: 4, ...FONTS.regular, textAlign: 'center' },
    statDivider: { width: 1, height: 40, backgroundColor: colors.border },
    breakdownSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
    breakdownTitle: { fontSize: SIZES.sm, color: colors.text.muted, ...FONTS.medium, marginBottom: 10 },
    breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    breakdownLabel: { width: 72, fontSize: SIZES.sm, color: colors.text.secondary, ...FONTS.regular, textTransform: 'capitalize' },
    barTrack: { flex: 1, height: 8, backgroundColor: colors.background.tertiary, borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 },
    barFill: { height: '100%', borderRadius: 4 },
    breakdownValue: { width: 36, fontSize: SIZES.sm, color: colors.text.muted, textAlign: 'right', ...FONTS.medium },
    comingSoonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    comingSoonItem: { width: '47%', alignItems: 'flex-start', paddingVertical: 4 },
    comingSoonIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    comingSoonLabel: { fontSize: SIZES.sm, color: colors.text.secondary, ...FONTS.medium, marginBottom: 2 },
    comingSoonNote: { fontSize: SIZES.xs, color: colors.text.inactive, ...FONTS.regular },
    activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    activityRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    activityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    activityBody: { flex: 1 },
    activityAction: { fontSize: SIZES.sm, color: colors.text.primary, ...FONTS.medium, textTransform: 'capitalize' },
    activityMeta: { fontSize: SIZES.xs, color: colors.text.muted, marginTop: 2, ...FONTS.regular },
    activityTime: { fontSize: SIZES.xs, color: colors.text.inactive, ...FONTS.regular },
    emptyText: { textAlign: 'center', color: colors.text.muted, ...FONTS.regular, fontSize: SIZES.base, paddingVertical: 8 },
  });
