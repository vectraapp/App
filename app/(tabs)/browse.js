import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, EmptyState } from '../../components/shared';
import { DUMMY_COURSES } from '../../services/dummyData';

export default function BrowseScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Derive departments from DUMMY_COURSES
  const allDepartments = useMemo(() => {
    const seen = new Set();
    const depts = [];
    DUMMY_COURSES.forEach((c) => {
      if (!seen.has(c.department)) {
        seen.add(c.department);
        depts.push({ id: c.department_id, name: c.department });
      }
    });
    return depts;
  }, []);

  // Get all unique levels
  const allLevels = useMemo(() => {
    const levels = new Set();
    DUMMY_COURSES.forEach((c) => { if (c.level) levels.add(c.level); });
    return ['all', ...Array.from(levels).sort()];
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = [...DUMMY_COURSES];
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((c) => c.department_id === selectedDepartment);
    }
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((c) => c.level === selectedLevel);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        (c.code || '').toLowerCase().includes(query) ||
        (c.title || '').toLowerCase().includes(query) ||
        (c.department || '').toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [selectedDepartment, selectedLevel, searchQuery]);

  // Group courses by department
  const groupedCourses = useMemo(() => {
    const groups = {};
    filteredCourses.forEach((course) => {
      const key = course.department || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(course);
    });
    return Object.entries(groups);
  }, [filteredCourses]);

  const styles = createStyles(colors);

  const renderCourse = (course) => {
    const courseCode = course.code || '';
    const courseName = course.title || '';
    const courseLevel = course.level || '';
    const questionCount = course.question_count || 0;

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
          {/* Department Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Dept:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedDepartment === 'all' && styles.filterChipSelected]}
                onPress={() => setSelectedDepartment('all')}
              >
                <Text style={[styles.filterChipText, selectedDepartment === 'all' && styles.filterChipTextSelected]}>All</Text>
              </TouchableOpacity>
              {allDepartments.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[styles.filterChip, selectedDepartment === dept.id && styles.filterChipSelected]}
                  onPress={() => setSelectedDepartment(dept.id)}
                >
                  <Text style={[styles.filterChipText, selectedDepartment === dept.id && styles.filterChipTextSelected]}>
                    {dept.name.length > 15 ? dept.name.substring(0, 15) + '...' : dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
            {`${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>

        {/* Course List */}
        {groupedCourses.length > 0 ? (
          <FlatList
            data={groupedCourses}
            keyExtractor={([key]) => key}
            renderItem={({ item: [department, deptCourses] }) => (
              <View style={styles.departmentGroup}>
                <Text style={styles.departmentTitle}>{department}</Text>
                <Card style={styles.coursesCard}>
                  {deptCourses.map((course, index) => (
                    <View key={(course.id || course.code) + (course.level || '') + index}>
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
