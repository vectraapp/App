import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, Loader } from '../../components/shared';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

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
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  description: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 16,
    paddingBottom: 8,
    ...FONTS.regular,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 8,
    paddingBottom: 20,
  },
  courseCard: {
    marginBottom: 10,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseCode: {
    fontSize: SIZES.base,
    color: colors.brand.primary,
    ...FONTS.bold,
  },
  courseName: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
});

export default function SelectCourseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const getProfile = useAuthStore((s) => s.getProfile);
  const styles = createStyles(colors);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const profile = await getProfile();
      if (profile?.department_id || profile?.departmentId) {
        const deptId = profile.department_id || profile.departmentId;
        const response = await api.getCourses(deptId);
        if (response.success && response.data) {
          setCourses(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCourse = ({ item }) => (
    <Card
      style={styles.courseCard}
      onPress={() => router.push({
        pathname: '/lecture/record',
        params: { courseCode: item.code, courseName: item.title || item.name },
      })}
    >
      <View style={styles.courseRow}>
        <View>
          <Text style={styles.courseCode}>{item.code}</Text>
          <Text style={styles.courseName}>{item.title || item.name}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.text.muted} />
      </View>
    </Card>
  );

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Course</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.description}>
          Choose a course to start recording a lecture.
        </Text>

        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
