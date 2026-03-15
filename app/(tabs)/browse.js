import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, EmptyState } from '../../components/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const CACHE_KEY_PREFIX = 'browse_cache_';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export default function BrowseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const getProfile = useAuthStore((s) => s.getProfile);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  // API-driven state
  const [faculties, setFaculties] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [questionCounts, setQuestionCounts] = useState({});
  const [userDepartmentId, setUserDepartmentId] = useState(null);
  const [universityId, setUniversityId] = useState(null);

  const getCachedData = async (universityId) => {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${universityId}`);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.cachedAt > CACHE_TTL) return null;
      return cached;
    } catch { return null; }
  };

  const setCachedData = async (universityId, data) => {
    try {
      await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${universityId}`, JSON.stringify({
        ...data,
        cachedAt: Date.now(),
      }));
    } catch { /* silently fail */ }
  };

  // Load user's university from profile, then fetch faculties
  useEffect(() => {
    loadUserUniversity();
  }, []);

  // Load cached question counts on mount
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('browse_question_counts');
        if (cached) setQuestionCounts(JSON.parse(cached));
      } catch {}
    })();
  }, []);

  const loadUserUniversity = async () => {
    try {
      const profile = await getProfile();
      const uniId = profile?.universityId || null;
      const deptId = profile?.departmentId || null;
      if (deptId) setUserDepartmentId(deptId);

      if (uniId) {
        setUniversityId(uniId);
        // Try cache first
        const cached = await getCachedData(uniId);
        if (cached) {
          setFaculties(cached.faculties || []);
          setAllDepartments(cached.departments || []);
          setCourses(cached.courses || []);
          setLoading(false);
          // Refresh in background
          refreshData(uniId, true);
          return;
        }
        // No cache - load fresh
        await fetchFaculties(uniId);
      } else {
        try {
          const response = await api.getUniversities();
          if (response.success && response.data?.length > 0) {
            const firstUni = response.data[0];
            const uid = firstUni.id || firstUni._id;
            setUniversityId(uid);
            await fetchFaculties(uid);
          }
        } catch (err) {
          console.error('Failed to load universities:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load user university:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async (uniId, silent = false) => {
    if (!silent) setLoadingFaculties(true);
    try {
      const response = await api.getFaculties(uniId);
      if (response.success) {
        const facultyList = response.data || [];
        setFaculties(facultyList);

        const allDepts = [];
        for (const fac of facultyList) {
          const facId = fac.id || fac._id;
          const deptResp = await api.getDepartments(facId);
          if (deptResp.success && deptResp.data) {
            allDepts.push(...deptResp.data.map(d => ({ ...d, facultyId: facId })));
          }
        }
        setAllDepartments(allDepts);

        if (!silent) setLoadingCourses(true);
        const allCourses = [];
        for (const dept of allDepts) {
          const deptId = dept.id || dept._id;
          const courseResp = await api.getCourses(deptId);
          if (courseResp.success && courseResp.data) {
            allCourses.push(...courseResp.data.map(c => ({
              ...c,
              departmentId: deptId,
              departmentName: dept.name || dept.short_name || '',
              departmentCode: dept.code || dept.short_name || '',
              facultyId: dept.facultyId,
            })));
          }
        }
        setCourses(allCourses);

        // Save to cache
        await setCachedData(uniId, {
          faculties: facultyList,
          departments: allDepts,
          courses: allCourses,
        });
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      if (!silent) {
        setLoadingFaculties(false);
        setLoadingCourses(false);
      }
    }
  };

  const fetchFaculties = async (uniId) => {
    await refreshData(uniId, false);
  };

  // Get all unique levels from loaded courses
  const allLevels = useMemo(() => {
    const levels = new Set();
    courses.forEach((c) => {
      if (c.level) levels.add(c.level);
    });
    return ['all', ...Array.from(levels).sort()];
  }, [courses]);

  // Get departments based on selected faculty
  const availableDepartments = useMemo(() => {
    let depts = selectedFaculty === 'all'
      ? allDepartments
      : allDepartments.filter((d) => {
          const dFacId = d.facultyId || d.faculty_id;
          return dFacId === selectedFaculty;
        });

    // Prioritize user's department
    if (userDepartmentId) {
      depts = [...depts].sort((a, b) => {
        const aId = a.id || a._id;
        const bId = b.id || b._id;
        if (aId === userDepartmentId) return -1;
        if (bId === userDepartmentId) return 1;
        return 0;
      });
    }

    return depts;
  }, [selectedFaculty, allDepartments, userDepartmentId]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Filter by faculty
    if (selectedFaculty !== 'all') {
      const deptIdsInFaculty = availableDepartments.map((d) => d.id || d._id);
      filtered = filtered.filter((c) => deptIdsInFaculty.includes(c.departmentId));
    }

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((c) => c.departmentId === selectedDepartment);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((c) => c.level === selectedLevel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        (c.code || '').toLowerCase().includes(query) ||
        (c.name || c.title || '').toLowerCase().includes(query) ||
        (c.departmentName || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [courses, selectedFaculty, selectedDepartment, selectedLevel, searchQuery, availableDepartments]);

  // Group courses by department
  const groupedCourses = useMemo(() => {
    const groups = {};
    filteredCourses.forEach((course) => {
      const key = course.departmentName || 'Other';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(course);
    });
    return Object.entries(groups);
  }, [filteredCourses]);

  const getQuestionCount = (courseCode) => {
    return questionCounts[courseCode] || 0;
  };

  // Fetch question count for a course (lazy / on-demand could be added later)
  const fetchQuestionCount = useCallback(async (courseCode) => {
    if (questionCounts[courseCode] !== undefined) return;
    try {
      const response = await api.getQuestions({ courseCode });
      if (response.success) {
        const count = Array.isArray(response.data) ? response.data.length : 0;
        setQuestionCounts((prev) => {
          const updated = { ...prev, [courseCode]: count };
          AsyncStorage.setItem('browse_question_counts', JSON.stringify(updated)).catch(() => {});
          return updated;
        });
      }
    } catch (err) {
      // Set to 0 on error to prevent infinite retries
      setQuestionCounts((prev) => {
        const updated = { ...prev, [courseCode]: 0 };
        AsyncStorage.setItem('browse_question_counts', JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    }
  }, [questionCounts]);

  const styles = createStyles(colors);

  const renderCourse = (course) => {
    const courseCode = course.code || course.course_code || '';
    const courseName = course.name || course.title || '';
    const courseLevel = course.level || '';
    const questionCount = getQuestionCount(courseCode);

    // Lazy-fetch question count when rendering
    if (questionCounts[courseCode] === undefined) {
      fetchQuestionCount(courseCode);
    }

    return (
      <TouchableOpacity
        key={(course.id || course._id || courseCode) + courseLevel}
        style={styles.courseItem}
        onPress={() => router.push(`/course/${encodeURIComponent(courseCode)}`)}
        activeOpacity={0.7}
      >
        <View style={styles.courseItemLeft}>
          <View style={styles.courseCodeSmall}>
            <Text style={styles.courseCodeSmallText}>{courseCode}</Text>
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseItemName} numberOfLines={1}>{courseName}</Text>
            <Text style={styles.courseItemMeta}>
              {courseLevel}{courseLevel ? ' - ' : ''}{questionCount} question{questionCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.text.muted} />
      </TouchableOpacity>
    );
  };

  const LevelChip = ({ level, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {level === 'all' ? 'All' : level}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Browse Courses</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          {/* Faculty Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Faculty:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedFaculty === 'all' && styles.filterChipSelected]}
                onPress={() => {
                  setSelectedFaculty('all');
                  setSelectedDepartment('all');
                }}
              >
                <Text style={[styles.filterChipText, selectedFaculty === 'all' && styles.filterChipTextSelected]}>All</Text>
              </TouchableOpacity>
              {faculties.map((fac) => {
                const facId = fac.id || fac._id;
                const facName = fac.name || fac.short_name || '';
                return (
                  <TouchableOpacity
                    key={facId}
                    style={[styles.filterChip, selectedFaculty === facId && styles.filterChipSelected]}
                    onPress={() => {
                      setSelectedFaculty(facId);
                      setSelectedDepartment('all');
                    }}
                  >
                    <Text style={[styles.filterChipText, selectedFaculty === facId && styles.filterChipTextSelected]}>
                      {facName.length > 15 ? facName.substring(0, 15) + '...' : facName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Department Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Department:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedDepartment === 'all' && styles.filterChipSelected]}
                onPress={() => setSelectedDepartment('all')}
              >
                <Text style={[styles.filterChipText, selectedDepartment === 'all' && styles.filterChipTextSelected]}>All</Text>
              </TouchableOpacity>
              {availableDepartments.map((dept) => {
                const deptId = dept.id || dept._id;
                const deptCode = dept.code || dept.short_name || dept.name || '';
                return (
                  <TouchableOpacity
                    key={deptId}
                    style={[styles.filterChip, selectedDepartment === deptId && styles.filterChipSelected]}
                    onPress={() => setSelectedDepartment(deptId)}
                  >
                    <Text style={[styles.filterChipText, selectedDepartment === deptId && styles.filterChipTextSelected]}>
                      {deptCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Level Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelScroll}>
            {allLevels.map((level) => (
              <LevelChip
                key={level}
                level={level}
                isSelected={selectedLevel === level}
                onPress={() => setSelectedLevel(level)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {loadingCourses ? 'Loading...' : `${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>

        {/* Course List */}
        {loadingCourses ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : groupedCourses.length > 0 ? (
          <FlatList
            data={groupedCourses}
            keyExtractor={([key]) => key}
            renderItem={({ item: [department, deptCourses] }) => (
              <View style={styles.departmentGroup}>
                <Text style={styles.departmentTitle}>{department}</Text>
                <Card style={styles.coursesCard}>
                  {deptCourses.map((course, index) => (
                    <View key={(course.id || course._id || course.code) + (course.level || '') + index}>
                      {renderCourse(course)}
                      {index < deptCourses.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </Card>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="search"
            title="No courses found"
            message="Try adjusting your filters or search query."
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    marginHorizontal: SIZES.padding * 1.5,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.regular,
  },
  filtersSection: {
    paddingTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    width: 80,
    ...FONTS.medium,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.medium,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  levelScroll: {
    paddingHorizontal: SIZES.padding * 1.5,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  chipText: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.medium,
  },
  chipTextSelected: {
    color: colors.background.primary,
  },
  resultsHeader: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsCount: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 16,
    paddingBottom: 20,
  },
  departmentGroup: {
    marginBottom: 20,
  },
  departmentTitle: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  coursesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  courseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courseCodeSmall: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  courseCodeSmallText: {
    fontSize: SIZES.xs,
    color: colors.white,
    ...FONTS.semibold,
  },
  courseInfo: {
    flex: 1,
  },
  courseItemName: {
    fontSize: SIZES.md,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  courseItemMeta: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 14,
  },
});
