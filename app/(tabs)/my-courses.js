import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, EmptyState, Loader } from '../../components/shared';
import useAuthStore from '../../store/authStore';
import { delay, DUMMY_COURSES } from '../../services/dummyData';

export default function MyCoursesScreen() {
  const router = useRouter();
  const getProfile = useAuthStore((s) => s.getProfile);
  const user = useAuthStore((s) => s.user);
  const semester = useAuthStore((s) => s.semester);
  const { colors } = useTheme();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    let result = courses.filter((c) => (c.semester ?? 1) === semester);
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (c) =>
        (c.code || c.course_code || '').toLowerCase().includes(q) ||
        (c.name || c.title || '').toLowerCase().includes(q)
    );
  }, [courses, searchQuery, semester]);

  const styles = createStyles(colors);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userProfile = await getProfile();
      setProfile(userProfile);
      await delay(500);
      const levelCourses = userProfile?.level
        ? DUMMY_COURSES.filter((c) => c.level === userProfile.level)
        : DUMMY_COURSES;
      setCourses(levelCourses.length > 0 ? levelCourses : DUMMY_COURSES);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCourse = ({ item }) => {
    const courseCode = item.code || item.course_code || '';
    const courseName = item.name || item.title || '';
    const courseUnits = item.units || item.credit_units || 0;
    const questionCount = item.question_count || 0;

    return (
      <Card
        style={styles.courseCard}
        onPress={() => router.push(`/course/${encodeURIComponent(courseCode)}`)}
      >
        <View style={styles.courseHeader}>
          <View style={styles.courseCodeBadge}>
            <Text style={styles.courseCodeText}>{courseCode}</Text>
          </View>
          <View style={styles.unitsBadge}>
            <Text style={styles.unitsText}>{courseUnits} units</Text>
          </View>
        </View>
        <Text style={styles.courseName}>{courseName}</Text>
        <View style={styles.courseFooter}>
          <Feather name="file-text" size={14} color={colors.text.muted} />
          <Text style={styles.questionCount}>
            {questionCount} past question{questionCount !== 1 ? 's' : ''} available
          </Text>
          <Feather name="chevron-right" size={16} color={colors.text.muted} />
        </View>
      </Card>
    );
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.display_name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Student'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {profile?.departmentName || 'Department'} · {profile?.level ? `Part ${profile.level}` : 'Level'} · {semester === 1 ? '1st' : '2nd'} Semester
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push('/settings')}
          >
            <Feather name="settings" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          <Text style={styles.sectionCount}>
            {filteredCourses.length}{searchQuery ? ` of ${courses.length}` : ''} courses
          </Text>
        </View>

        {/* Course List */}
        {filteredCourses.length > 0 ? (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourse}
            keyExtractor={(item) => item.id || item._id || item.code || item.course_code}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <EmptyState
            icon="book"
            title="No courses found"
            message={
              searchQuery
                ? `No ${semester === 1 ? 'first' : 'second'} semester courses match your search.`
                : `No ${semester === 1 ? 'first' : 'second'} semester courses found for your level.`
            }
          />
        )}

        {/* Bookmark FAB */}
        <TouchableOpacity
          style={styles.bookmarkFAB}
          onPress={() => router.push('/bookmarks')}
          activeOpacity={0.85}
        >
          <Feather name="bookmark" size={22} color={colors.white} />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding * 1.5,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.regular,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  sectionCount: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingBottom: 20,
  },
  courseCard: {
    marginBottom: 12,
  },
  courseHeader: {
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
  unitsBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitsText: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  courseName: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 10,
    ...FONTS.medium,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginLeft: 6,
    flex: 1,
    ...FONTS.regular,
  },
  bookmarkFAB: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand.warning,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
});
