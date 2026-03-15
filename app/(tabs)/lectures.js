import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, EmptyState } from '../../components/shared';
import api from '../../services/api';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

// Map backend snake_case fields to UI camelCase
function mapLecture(item) {
  return {
    id: item.id,
    courseCode: item.course_code || '',
    courseName: item.course_name || '',
    topic: item.topic || '',
    lecturer: item.lecturer || '',
    date: item.date || '',
    duration: item.duration || 0,
    status: item.status || 'draft',
    isFavorite: item.is_favorite || false,
    audioUrl: item.audio_url || null,
    transcript: item.transcript || null,
    structuredMarkdown: item.structured_markdown || null,
    photos: (item.images || []).map((img) => ({
      id: img.id,
      uri: img.image_url,
      timestamp: img.order_index,
    })),
    createdAt: item.created_at || null,
  };
}

export default function LecturesScreen() {
  const router = useRouter();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const response = await api.getLectures();
      if (response.success) {
        const mapped = (response.data || []).map(mapLecture);
        setLectures(mapped);
      }
    } catch (err) {
      console.error('Failed to load lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLectures();
    }, [])
  );

  const renderLecture = ({ item }) => {
    const isProcessing = item.status === 'processing';
    const hasPhotos = item.photos && item.photos.length > 0;

    return (
      <Card
        style={styles.lectureCard}
        onPress={() => router.push(`/lecture/${item.id}`)}
      >
        <View style={styles.lectureHeader}>
          <View style={styles.courseCodeBadge}>
            <Text style={styles.courseCodeText}>{item.courseCode}</Text>
          </View>
          {isProcessing ? (
            <View style={styles.processingBadge}>
              <Feather name="loader" size={12} color={colors.brand.warning} />
              <Text style={styles.processingText}>Processing</Text>
            </View>
          ) : (
            <View style={styles.completedBadge}>
              <Feather name="check-circle" size={12} color={colors.brand.accent} />
              <Text style={styles.completedText}>Ready</Text>
            </View>
          )}
        </View>

        <Text style={styles.lectureTopic}>{item.topic}</Text>
        <Text style={styles.lectureCourseName}>{item.courseName}</Text>

        <View style={styles.lectureFooter}>
          <View style={styles.lectureDetail}>
            <Feather name="user" size={13} color={colors.text.muted} />
            <Text style={styles.lectureDetailText}>{item.lecturer}</Text>
          </View>
          <View style={styles.lectureDetail}>
            <Feather name="clock" size={13} color={colors.text.muted} />
            <Text style={styles.lectureDetailText}>{formatDuration(item.duration)}</Text>
          </View>
          {hasPhotos && (
            <View style={styles.lectureDetail}>
              <Feather name="image" size={13} color={colors.brand.secondary} />
              <Text style={[styles.lectureDetailText, { color: colors.brand.secondary }]}>
                {item.photos.length}
              </Text>
            </View>
          )}
        </View>

        {item.isFavorite ? (
          <View style={styles.favoriteIndicator}>
            <Feather name="star" size={14} color={colors.brand.warning} />
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lectures</Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => router.push('/lecture/select-course')}
          >
            <Feather name="plus" size={20} color={colors.background.primary} />
            <Text style={styles.recordButtonText}>Record</Text>
          </TouchableOpacity>
        </View>

        {/* Study Groups banner */}
        <TouchableOpacity
          style={[styles.groupsBanner, { backgroundColor: colors.tint.accent }]}
          onPress={() => router.push('/groups/index')}
          activeOpacity={0.85}
        >
          <View style={styles.groupsBannerLeft}>
            <Feather name="users" size={16} color={colors.brand.accent} />
            <Text style={[styles.groupsBannerTitle, { color: colors.brand.accent }]}>Study Groups</Text>
          </View>
          <Text style={[styles.groupsBannerSub, { color: colors.brand.accent }]}>
            Join or create a group →
          </Text>
        </TouchableOpacity>

        {/* Lecture List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.secondary} />
          </View>
        ) : lectures.length > 0 ? (
          <FlatList
            data={lectures}
            renderItem={renderLecture}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="mic"
            title="No lectures recorded"
            message="Start recording your lectures to get AI-powered notes and summaries."
            actionLabel="Record Lecture"
            onAction={() => router.push('/lecture/select-course')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
  },
  recordButtonText: {
    fontSize: SIZES.md,
    color: colors.background.primary,
    marginLeft: 6,
    ...FONTS.semibold,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 16,
    paddingBottom: 20,
  },
  lectureCard: {
    marginBottom: 12,
    position: 'relative',
  },
  lectureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseCodeBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseCodeText: {
    fontSize: SIZES.sm,
    color: colors.white,
    ...FONTS.semibold,
  },
  processingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  processingText: {
    fontSize: SIZES.xs,
    color: colors.brand.warning,
    marginLeft: 4,
    ...FONTS.medium,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    fontSize: SIZES.xs,
    color: colors.brand.accent,
    marginLeft: 4,
    ...FONTS.medium,
  },
  lectureTopic: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 2,
    ...FONTS.semibold,
  },
  lectureCourseName: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 12,
    ...FONTS.regular,
  },
  lectureFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lectureDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lectureDetailText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginLeft: 4,
    ...FONTS.regular,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  groupsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZES.padding * 1.5,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
  },
  groupsBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupsBannerTitle: { fontSize: SIZES.sm, ...FONTS.semibold },
  groupsBannerSub: { fontSize: SIZES.xs, ...FONTS.regular },
});
