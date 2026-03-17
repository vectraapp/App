import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button, Card } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import { delay, DUMMY_SESSIONS } from '../../services/dummyData';

export default function UploadQuestionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const getProfile = useAuthStore((s) => s.getProfile);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [session, setSession] = useState('');
  const [semester, setSemester] = useState('');
  const [examType, setExamType] = useState('');
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadProfile();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      await delay(300);
      setSessions(DUMMY_SESSIONS.map((s) => s.value));
    } catch (err) {
      setSessions(['2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026']);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (err) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      showToast('error', 'Failed to pick file');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('error', 'Please select a file to upload');
      return;
    }
    if (!courseCode.trim()) {
      showToast('error', 'Please enter the course code');
      return;
    }
    if (!session) {
      showToast('error', 'Please select a session');
      return;
    }
    if (!examType) {
      showToast('error', 'Please select the exam type');
      return;
    }

    setUploading(true);
    try {
      await delay(1500);
      showToast('success', 'Question uploaded successfully! It will be reviewed before publishing.');
      router.back();
    } catch (err) {
      showToast('error', err.message || 'Failed to upload question');
    } finally {
      setUploading(false);
    }
  };

  const styles = createStyles(colors);

  const recentSessions = sessions.length > 0 ? sessions.slice(-5).reverse() : ['2022/2023', '2023/2024', '2024/2025', '2025/2026'];
  const examTypes = ['Exam', 'Test', 'Quiz', 'Assignment'];
  const semesters = ['First Semester', 'Second Semester'];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Past Question</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Feather name="info" size={20} color={colors.brand.secondary} />
            <Text style={styles.infoText}>
              Help your fellow students by uploading past questions. All uploads will be reviewed before publishing.
            </Text>
          </Card>

          {/* File Upload */}
          <Text style={styles.sectionTitle}>Question File</Text>
          {selectedFile ? (
            <Card style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <Feather
                  name={selectedFile.mimeType?.includes('pdf') ? 'file-text' : 'image'}
                  size={24}
                  color={colors.brand.error}
                />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.fileMeta}>{formatFileSize(selectedFile.size)}</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveFile} style={styles.removeBtn}>
                <Feather name="x" size={20} color={colors.brand.error} />
              </TouchableOpacity>
            </Card>
          ) : (
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickFile}>
              <View style={styles.uploadIcon}>
                <Feather name="upload-cloud" size={32} color={colors.brand.secondary} />
              </View>
              <Text style={styles.uploadTitle}>Tap to upload</Text>
              <Text style={styles.uploadSubtitle}>PDF or Image (max 10MB)</Text>
            </TouchableOpacity>
          )}

          {/* Course Details */}
          <Text style={styles.sectionTitle}>Course Details</Text>
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Course Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., CSC 101"
                placeholderTextColor={colors.text.inactive}
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Course Name (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Introduction to Computer Science"
                placeholderTextColor={colors.text.inactive}
                value={courseName}
                onChangeText={setCourseName}
              />
            </View>
          </Card>

          {/* Session & Type */}
          <Text style={styles.sectionTitle}>Session & Type</Text>
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Session *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {recentSessions.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, session === s && styles.chipSelected]}
                    onPress={() => setSession(s)}
                  >
                    <Text style={[styles.chipText, session === s && styles.chipTextSelected]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Semester</Text>
              <View style={styles.chipRow}>
                {semesters.map(sem => (
                  <TouchableOpacity
                    key={sem}
                    style={[styles.chip, semester === sem && styles.chipSelected]}
                    onPress={() => setSemester(sem)}
                  >
                    <Text style={[styles.chipText, semester === sem && styles.chipTextSelected]}>
                      {sem.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exam Type *</Text>
              <View style={styles.chipRow}>
                {examTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, examType === type && styles.chipSelected]}
                    onPress={() => setExamType(type)}
                  >
                    <Text style={[styles.chipText, examType === type && styles.chipTextSelected]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Additional Info */}
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <Card style={styles.formCard}>
            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional notes about this question..."
                placeholderTextColor={colors.text.inactive}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </Card>

          {/* Submit Button */}
          <Button
            title={uploading ? 'Uploading...' : 'Submit Question'}
            onPress={handleSubmit}
            disabled={uploading}
            icon={uploading ? undefined : 'upload'}
            style={styles.submitBtn}
          />
        </ScrollView>
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
    flex: 1,
    fontSize: SIZES.lg,
    color: colors.text.primary,
    textAlign: 'center',
    ...FONTS.bold,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.md,
    color: colors.text.secondary,
    marginLeft: 12,
    lineHeight: 20,
    ...FONTS.regular,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    color: colors.text.primary,
    marginBottom: 12,
    ...FONTS.semibold,
  },
  uploadArea: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  uploadSubtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 4,
    ...FONTS.regular,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  fileMeta: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  removeBtn: {
    padding: 8,
  },
  formCard: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 8,
    ...FONTS.medium,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.regular,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginHorizontal: -4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
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
  submitBtn: {
    marginTop: 8,
  },
});
