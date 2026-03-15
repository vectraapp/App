import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, EmptyState, Loader } from '../../components/shared';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function MyCoursesScreen() {
  const router = useRouter();
  const getProfile = useAuthStore((s) => s.getProfile);
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState({});

  const styles = createStyles(colors);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userProfile = await getProfile();
      setProfile(userProfile);

      if (userProfile?.departmentId && userProfile?.level) {
        // Fetch courses for the user's department from the API
        const response = await api.getCourses(userProfile.departmentId);
        if (response.success && response.data) {
          // Filter by user's level if courses have a level field
          const allCourses = response.data;
          const levelCourses = allCourses.filter(
            (c) => c.level === userProfile.level
          );
          // Use level-filtered courses if any match, otherwise show all department courses
          setCourses(levelCourses.length > 0 ? levelCourses : allCourses);

          // Fetch question counts for each course
          const courseCodes = (levelCourses.length > 0 ? levelCourses : allCourses).map(
            (c) => c.code || c.course_code || ''
          );
          fetchQuestionCounts(courseCodes);
        }
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionCounts = async (courseCodes) => {
    const counts = {};
    for (const code of courseCodes) {
      if (!code) continue;
      try {
        const response = await api.getQuestions({ courseCode: code });
        if (response.success) {
          counts[code] = Array.isArray(response.data) ? response.data.length : 0;
        }
      } catch (err) {
        // silently handle individual failures
      }
    }
    setQuestionCounts(counts);
  };

  const getQuestionCount = (courseCode) => {
    return questionCounts[courseCode] || 0;
  };

  const renderCourse = ({ item }) => {
    const courseCode = item.code || item.course_code || '';
    const courseName = item.name || item.title || '';
    const courseUnits = item.units || item.credit_units || 0;
    const questionCount = getQuestionCount(courseCode);

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
              Hello, {user?.displayName?.split(' ')[0] || 'Student'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {profile?.departmentName || 'Department'} - {profile?.level || 'Level'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => router.push('/settings')}
            >
              <Feather name="settings" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          <Text style={styles.sectionCount}>{courses.length} courses</Text>
        </View>

        {/* Course List */}
        {courses.length > 0 ? (
          <FlatList
            data={courses}
            renderItem={renderCourse}
            keyExtractor={(item) => item.id || item._id || item.code || item.course_code}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="book"
            title="No courses found"
            message="Complete your profile setup to see courses for your department and level."
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
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
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
});
