import React, { useState, useEffect, useCallback } from 'react';
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
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button, Loader } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const TOTAL_STEPS = 6;

const SEMESTERS = [
  { id: 'first', name: 'First Semester' },
  { id: 'second', name: 'Second Semester' },
];

const STEP_CONFIG = [
  { key: 'university', title: 'Select University', subtitle: 'Choose your institution' },
  { key: 'faculty', title: 'Select Faculty', subtitle: 'Pick your faculty' },
  { key: 'department', title: 'Select Department', subtitle: 'Choose your department' },
  { key: 'level', title: 'Select Level', subtitle: 'What level are you in?' },
  { key: 'semester', title: 'Select Semester', subtitle: 'Which semester are you in?' },
  { key: 'courses', title: 'Your Courses', subtitle: 'Review your courses for this semester' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Data from API
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);

  // Selections
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  const styles = createStyles(colors);
  const step = STEP_CONFIG[currentStep];

  // --------------------------------------------------
  // Fetch universities on mount
  // --------------------------------------------------
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setFetching(true);
    try {
      const res = await api.getUniversities();
      if (res.success && Array.isArray(res.data)) {
        setUniversities(res.data);
      } else {
        setUniversities([]);
      }
    } catch (err) {
      showToast('error', 'Failed to load universities. Pull down to retry.');
      setUniversities([]);
    } finally {
      setFetching(false);
    }
  };

  // --------------------------------------------------
  // Fetch faculties when university changes
  // --------------------------------------------------
  const fetchFaculties = useCallback(async (universityId) => {
    setFetching(true);
    setFaculties([]);
    try {
      const res = await api.getFaculties(universityId);
      if (res.success && Array.isArray(res.data)) {
        setFaculties(res.data);
      }
    } catch (err) {
      showToast('error', 'Failed to load faculties.');
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  // --------------------------------------------------
  // Fetch departments when faculty changes
  // --------------------------------------------------
  const fetchDepartments = useCallback(async (facultyId) => {
    setFetching(true);
    setDepartments([]);
    try {
      const res = await api.getDepartments(facultyId);
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (err) {
      showToast('error', 'Failed to load departments.');
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  // --------------------------------------------------
  // Fetch levels when university is known (for step 3)
  // --------------------------------------------------
  const fetchLevels = useCallback(async (universityId) => {
    setFetching(true);
    setLevels([]);
    try {
      const res = await api.getLevels(universityId);
      if (res.success && Array.isArray(res.data)) {
        setLevels(res.data);
      }
    } catch (err) {
      showToast('error', 'Failed to load levels.');
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  // --------------------------------------------------
  // Fetch courses for department + level + semester
  // --------------------------------------------------
  const fetchCourses = useCallback(async (departmentId, level, semester) => {
    setFetching(true);
    setCourses([]);
    try {
      // Map semester id to full name expected by the DB
      const semesterMap = { first: 'First Semester', second: 'Second Semester' };
      const semesterFull = semesterMap[semester] || semester;
      const encodedLevel = encodeURIComponent(level);
      const encodedSemester = encodeURIComponent(semesterFull);
      const res = await api.get(
        `/data/courses/${departmentId}?level=${encodedLevel}&semester=${encodedSemester}`
      );
      if (res.success && Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      showToast('error', 'Failed to load courses.');
      setCourses([]);
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  // --------------------------------------------------
  // Build list items for each step
  // --------------------------------------------------
  const getItems = () => {
    switch (currentStep) {
      case 0:
        return universities.map((u) => ({
          id: u.id,
          title: u.name,
          subtitle: u.short_name ? `${u.short_name} — ${u.state || ''}`.trim() : u.state || '',
          data: u,
        }));
      case 1:
        return faculties.map((f) => ({
          id: f.id,
          title: f.name,
          subtitle: '',
          data: f,
        }));
      case 2:
        return departments.map((d) => ({
          id: d.id,
          title: d.name,
          subtitle: d.degree_type ? `Degree: ${d.degree_type}` : '',
          data: d,
        }));
      case 3:
        return levels.map((level, index) => ({
          id: level,
          title: level,
          subtitle: '',
          data: level,
        }));
      case 4:
        return SEMESTERS.map((s) => ({
          id: s.id,
          title: s.name,
          subtitle: '',
          data: s.id,
        }));
      default:
        return [];
    }
  };

  const getSelectedId = () => {
    switch (currentStep) {
      case 0: return selectedUniversity?.id || null;
      case 1: return selectedFaculty?.id || null;
      case 2: return selectedDepartment?.id || null;
      case 3: return selectedLevel || null;
      case 4: return selectedSemester || null;
      default: return null;
    }
  };

  // --------------------------------------------------
  // Selection handlers
  // --------------------------------------------------
  const handleSelect = (item) => {
    switch (currentStep) {
      case 0:
        setSelectedUniversity(item.data);
        setSelectedFaculty(null);
        setSelectedDepartment(null);
        setSelectedLevel(null);
        setSelectedSemester(null);
        setCourses([]);
        break;
      case 1:
        setSelectedFaculty(item.data);
        setSelectedDepartment(null);
        setSelectedLevel(null);
        setSelectedSemester(null);
        setCourses([]);
        break;
      case 2:
        setSelectedDepartment(item.data);
        setSelectedLevel(null);
        setSelectedSemester(null);
        setCourses([]);
        break;
      case 3:
        setSelectedLevel(item.data);
        setSelectedSemester(null);
        setCourses([]);
        break;
      case 4:
        setSelectedSemester(item.data);
        setCourses([]);
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedUniversity;
      case 1: return !!selectedFaculty;
      case 2: return !!selectedDepartment;
      case 3: return !!selectedLevel;
      case 4: return !!selectedSemester;
      default: return false;
    }
  };

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------
  const handleNext = async () => {
    const nextStep = currentStep + 1;

    if (currentStep === 0 && selectedUniversity) {
      setCurrentStep(nextStep);
      fetchFaculties(selectedUniversity.id);
      return;
    }

    if (currentStep === 1 && selectedFaculty) {
      setCurrentStep(nextStep);
      fetchDepartments(selectedFaculty.id);
      return;
    }

    if (currentStep === 2 && selectedDepartment) {
      setCurrentStep(nextStep);
      fetchLevels(selectedUniversity.id);
      return;
    }

    if (currentStep === 3 && selectedLevel) {
      setCurrentStep(nextStep);
      return;
    }

    if (currentStep === 4 && selectedSemester) {
      setCurrentStep(nextStep);
      fetchCourses(selectedDepartment.id, selectedLevel, selectedSemester);
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --------------------------------------------------
  // Finish: enroll in all courses and complete onboarding
  // --------------------------------------------------
  const handleFinish = async () => {
    setEnrolling(true);
    try {
      // Enroll in all displayed courses
      if (courses.length > 0) {
        const courseIds = courses.map((c) => c.id);
        await api.enrollInCourses(courseIds);
      }

      // Save onboarding profile locally
      const semesterMap = { first: 'First Semester', second: 'Second Semester' };
      await completeOnboarding({
        universityId: selectedUniversity.id,
        universityName: selectedUniversity.name,
        universityAbbreviation: selectedUniversity.short_name || '',
        facultyId: selectedFaculty.id,
        facultyName: selectedFaculty.name,
        departmentId: selectedDepartment.id,
        departmentName: selectedDepartment.name,
        level: selectedLevel,
        semester: semesterMap[selectedSemester] || selectedSemester,
      });

      showToast('success', 'You\'re all set! Welcome to Vectra.');
      router.replace('/(tabs)/my-courses');
    } catch (err) {
      showToast('error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // --------------------------------------------------
  // Progress
  // --------------------------------------------------
  const progress = (currentStep + 1) / TOTAL_STEPS;
  const items = getItems();
  const selectedId = getSelectedId();

  // --------------------------------------------------
  // Render selection card (steps 0-4)
  // --------------------------------------------------
  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={[styles.optionSubtitle, isSelected && styles.optionSubtitleSelected]}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
        {isSelected ? (
          <View style={styles.checkCircle}>
            <Feather name="check" size={16} color={colors.background.primary} />
          </View>
        ) : (
          <View style={styles.emptyCircle} />
        )}
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Render course card (step 5)
  // --------------------------------------------------
  const renderCourseItem = ({ item }) => {
    return (
      <View style={[styles.optionCard, styles.courseCardSelected]}>
        <View style={styles.optionContent}>
          <Text style={styles.courseCode}>{item.code || item.course_code || ''}</Text>
          <Text style={styles.courseTitle}>{item.title || item.name || ''}</Text>
          {item.credit_units ? (
            <Text style={styles.courseUnits}>
              {item.credit_units} Credit Unit{item.credit_units !== 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>
        <View style={styles.checkCircleGreen}>
          <Feather name="check" size={16} color={colors.background.primary} />
        </View>
      </View>
    );
  };

  // --------------------------------------------------
  // Courses step (step 5)
  // --------------------------------------------------
  if (currentStep === 5) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={22} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.stepIndicator}>
                Step {currentStep + 1} of {TOTAL_STEPS}
              </Text>
              <View style={styles.backPlaceholder} />
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>

            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>

            {/* Course count badge */}
            {!fetching && courses.length > 0 && (
              <View style={styles.courseBadgeRow}>
                <View style={styles.courseBadge}>
                  <Feather name="book-open" size={14} color={colors.brand.accent} />
                  <Text style={styles.courseBadgeText}>
                    {courses.length} course{courses.length !== 1 ? 's' : ''} found
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Course list or loading/empty */}
          {fetching ? (
            <Loader />
          ) : courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Feather name="inbox" size={48} color={colors.text.muted} />
              </View>
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptyMessage}>
                There are no courses registered for {selectedLevel}, {selectedSemester === 'first' ? 'First' : 'Second'} Semester in {selectedDepartment?.name || 'this department'} yet.
              </Text>
              <Button
                title="Go Back"
                onPress={handleBack}
                variant="outline"
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <FlatList
              data={courses}
              renderItem={renderCourseItem}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Bottom action */}
          {!fetching && courses.length > 0 && (
            <View style={styles.bottom}>
              <Button
                title="Let's Go!"
                onPress={handleFinish}
                loading={enrolling}
                disabled={enrolling}
                icon="arrow-right"
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------
  // Selection steps (steps 0-4)
  // --------------------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {currentStep > 0 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={22} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
            <Text style={styles.stepIndicator}>
              Step {currentStep + 1} of {TOTAL_STEPS}
            </Text>
            <View style={styles.backPlaceholder} />
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        </View>

        {/* List or loader */}
        {fetching ? (
          <Loader />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Feather name="alert-circle" size={48} color={colors.text.muted} />
                </View>
                <Text style={styles.emptyTitle}>Nothing available</Text>
                <Text style={styles.emptyMessage}>
                  No options found for this selection. Please go back and try a different choice.
                </Text>
              </View>
            }
          />
        )}

        {/* Bottom */}
        {!fetching && (
          <View style={styles.bottom}>
            <Button
              title="Next"
              onPress={handleNext}
              disabled={!canProceed()}
              loading={loading}
              icon="arrow-right"
            />
          </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  stepIndicator: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.secondary,
    borderRadius: 2,
  },
  title: {
    fontSize: SIZES.xxl,
    color: colors.text.primary,
    marginBottom: 4,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 16,
    paddingBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  optionCardSelected: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.tint.secondaryLight,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  optionTitleSelected: {
    color: colors.brand.secondary,
  },
  optionSubtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  optionSubtitleSelected: {
    color: colors.brand.secondary,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginLeft: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  // Course-specific styles (step 5)
  courseCardSelected: {
    borderColor: colors.brand.accent,
    backgroundColor: colors.tint.accent,
  },
  courseCode: {
    fontSize: SIZES.sm,
    color: colors.brand.accent,
    letterSpacing: 0.5,
    marginBottom: 2,
    ...FONTS.bold,
  },
  courseTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  courseUnits: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 3,
    ...FONTS.regular,
  },
  checkCircleGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  courseBadgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  courseBadgeText: {
    fontSize: SIZES.sm,
    color: colors.brand.accent,
    marginLeft: 6,
    ...FONTS.semibold,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    ...FONTS.semibold,
  },
  emptyMessage: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    ...FONTS.regular,
  },
  emptyButton: {
    minWidth: 160,
  },
  bottom: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.secondary,
  },
});
