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
import { api } from '../../services/api';

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
      const res = await api.getMyUploads();
      const data = res?.data || res?.uploads || [];
      setUploads(Array.isArray(data) ? data : []);
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
    const uploadType = item.upload_type === 'past_question' ? 'Past Question' : 'Textbook';
    const title = item.title || item.course_code || 'Untitled';
    const session = item.academic_session || '';
    const examType = item.exam_type || '';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeRow}>
            <View style={[styles.typeBadge, { backgroundColor: colors.tint.primary }]}>
              <Text style={[styles.typeText, { color: colors.brand.primary }]}>{uploadType}</Text>
            </View>
            {item.course_code ? (
              <Text style={styles.courseCode}>{item.course_code}</Text>
            ) : null}
          </View>
          <Feather name="file-text" size={16} color={colors.text.muted} />
        </View>

        <Text style={styles.uploadTitle} numberOfLines={2}>{title}</Text>

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

        <Text style={styles.uploadDate}>Uploaded {formatDate(item.created_at)}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
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
          <FlatList
            data={uploads}
            keyExtractor={(item) => String(item.id || item._id)}
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
                message="Upload past questions or textbooks to help your peers."
              />
            }
          />
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
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 16,
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
  uploadDate: {
    fontSize: SIZES.xs,
    color: colors.text.inactive,
    paddingHorizontal: 14,
    paddingBottom: 12,
    ...FONTS.regular,
  },
});
