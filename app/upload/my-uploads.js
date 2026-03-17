import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState, Card } from '../../components/shared';
import { delay, DUMMY_MY_UPLOADS } from '../../services/dummyData';

const STATUS_CONFIG = {
  pending: {
    label: 'Under Review',
    icon: 'clock',
    color: '#F59E0B',
    bg: '#FEF3C7',
    desc: 'Your upload is awaiting admin review.',
  },
  reviewing: {
    label: 'Reviewing',
    icon: 'eye',
    color: '#3B82F6',
    bg: '#DBEAFE',
    desc: 'An admin is currently reviewing your upload.',
  },
  approved: {
    label: 'Published',
    icon: 'check-circle',
    color: '#10B981',
    bg: '#D1FAE5',
    desc: 'Your upload is live and visible to other students.',
  },
  rejected: {
    label: 'Rejected',
    icon: 'x-circle',
    color: '#EF4444',
    bg: '#FEE2E2',
    desc: 'Your upload was not approved.',
  },
};

export default function MyUploadsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUploads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await delay(400);
      setUploads(DUMMY_MY_UPLOADS);
    } catch (err) {
      console.error('Failed to fetch my uploads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUploads(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const renderItem = ({ item }) => {
    const status = item.status || 'pending';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const uploadType = item.upload_type === 'past_question' ? 'Past Question' : 'Textbook';
    const title = item.title || item.course_code || 'Untitled';
    const session = item.academic_session || '';
    const examType = item.exam_type || '';

    return (
      <Card style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.typeRow}>
            <View style={[styles.typeBadge, { backgroundColor: colors.tint.primary }]}>
              <Text style={[styles.typeText, { color: colors.brand.primary }]}>{uploadType}</Text>
            </View>
            <Text style={styles.courseCode}>{item.course_code}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Feather name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.uploadTitle} numberOfLines={2}>{title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          {session ? (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color={colors.text.muted} />
              <Text style={styles.metaText}>{session}</Text>
            </View>
          ) : null}
          {examType ? (
            <View style={styles.metaItem}>
              <Feather name="tag" size={12} color={colors.text.muted} />
              <Text style={styles.metaText}>{examType}</Text>
            </View>
          ) : null}
          {item.file_size ? (
            <View style={styles.metaItem}>
              <Feather name="file" size={12} color={colors.text.muted} />
              <Text style={styles.metaText}>{formatSize(item.file_size)}</Text>
            </View>
          ) : null}
        </View>

        {/* Status note */}
        <View style={[styles.statusNote, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusNoteText, { color: cfg.color }]}>{cfg.desc}</Text>
        </View>

        {/* Rejection reason */}
        {status === 'rejected' && item.rejection_reason ? (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionLabel}>Reason:</Text>
            <Text style={styles.rejectionText}>{item.rejection_reason}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <Text style={styles.uploadDate}>Submitted {formatDate(item.created_at)}</Text>
      </Card>
    );
  };

  const counts = {
    pending: uploads.filter((u) => u.status === 'pending' || u.status === 'reviewing').length,
    approved: uploads.filter((u) => u.status === 'approved').length,
    rejected: uploads.filter((u) => u.status === 'rejected').length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Uploads</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : (
          <>
            {/* Summary chips */}
            {uploads.length > 0 && (
              <View style={styles.summaryRow}>
                <View style={[styles.summaryChip, { backgroundColor: '#FEF3C7' }]}>
                  <Feather name="clock" size={12} color="#F59E0B" />
                  <Text style={[styles.summaryText, { color: '#F59E0B' }]}>{counts.pending} pending</Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: '#D1FAE5' }]}>
                  <Feather name="check-circle" size={12} color="#10B981" />
                  <Text style={[styles.summaryText, { color: '#10B981' }]}>{counts.approved} published</Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: '#FEE2E2' }]}>
                  <Feather name="x-circle" size={12} color="#EF4444" />
                  <Text style={[styles.summaryText, { color: '#EF4444' }]}>{counts.rejected} rejected</Text>
                </View>
              </View>
            )}

            <FlatList
              data={uploads}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.brand.primary]}
                  tintColor={colors.brand.primary}
                />
              }
              ListEmptyComponent={
                <EmptyState
                  icon="upload"
                  title="No uploads yet"
                  message="Upload past questions or textbooks to help your peers. They'll appear here once submitted."
                />
              }
            />
          </>
        )}
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
    fontSize: SIZES.xl,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: 12,
    gap: 8,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  summaryText: {
    fontSize: SIZES.xs,
    ...FONTS.semibold,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 8,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 14,
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    fontSize: SIZES.xs,
    ...FONTS.semibold,
  },
  courseCode: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: SIZES.xs,
    ...FONTS.semibold,
  },
  uploadTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    paddingHorizontal: 14,
    marginBottom: 8,
    ...FONTS.medium,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  statusNote: {
    marginHorizontal: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 10,
  },
  statusNoteText: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
  },
  rejectionBox: {
    marginHorizontal: 14,
    padding: 10,
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    marginBottom: 10,
  },
  rejectionLabel: {
    fontSize: SIZES.xs,
    color: '#EF4444',
    ...FONTS.semibold,
    marginBottom: 2,
  },
  rejectionText: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.regular,
  },
  uploadDate: {
    fontSize: SIZES.xs,
    color: colors.text.inactive,
    paddingHorizontal: 14,
    paddingBottom: 12,
    ...FONTS.regular,
  },
});
