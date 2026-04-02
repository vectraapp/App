import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button, Card } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { api } from '../../services/api';

const EXAM_TYPES = ['Exam', 'Test', 'Quiz', 'Assignment'];
const SEMESTERS = ['First Semester', 'Second Semester'];

export default function AdminUploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  // Data
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState(['2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026']);

  // Selections
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [session, setSession] = useState('');
  const [semester, setSemester] = useState('');
  const [examType, setExamType] = useState('');
  const [description, setDescription] = useState('');

  // Loading states
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Picker modal
  const [picker, setPicker] = useState({ visible: false, type: null, options: [], title: '' });
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    loadUniversities();
    loadSessions();
  }, []);

  const loadUniversities = async () => {
    setLoadingUniversities(true);
    try {
      const res = await api.getUniversities();
      const data = res?.universities || res?.data?.universities || res?.data || [];
      setUniversities(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const loadFaculties = async (universityId) => {
    setLoadingFaculties(true);
    setFaculties([]);
    setDepartments([]);
    setCourses([]);
    try {
      const res = await api.getFaculties(universityId);
      const data = res?.faculties || res?.data?.faculties || res?.data || [];
      setFaculties(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load faculties');
    } finally {
      setLoadingFaculties(false);
    }
  };

  const loadDepartments = async (facultyId) => {
    setLoadingDepartments(true);
    setDepartments([]);
    setCourses([]);
    try {
      const res = await api.getDepartments(facultyId);
      const data = res?.departments || res?.data?.departments || res?.data || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadCourses = async (departmentId) => {
    setLoadingCourses(true);
    setCourses([]);
    try {
      const res = await api.getCourses(departmentId);
      const data = res?.courses || res?.data?.courses || res?.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await api.getSessions();
      const data = res?.sessions || res?.data?.sessions || res?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data.map((s) => (typeof s === 'string' ? s : s.name || s.value || s)));
      }
    } catch {
      // Keep default sessions
    }
  };

  const openPicker = (type, options, title) => {
    setPickerSearch('');
    setPicker({ visible: true, type, options, title });
  };

  const onPickerSelect = (item) => {
    setPicker({ visible: false, type: null, options: [], title: '' });
    switch (picker.type) {
      case 'university':
        setSelectedUniversity(item);
        setSelectedFaculty(null);
        setSelectedDepartment(null);
        setSelectedCourse(null);
        loadFaculties(item.id);
        break;
      case 'faculty':
        setSelectedFaculty(item);
        setSelectedDepartment(null);
        setSelectedCourse(null);
        loadDepartments(item.id);
        break;
      case 'department':
        setSelectedDepartment(item);
        setSelectedCourse(null);
        loadCourses(item.id);
        break;
      case 'course':
        setSelectedCourse(item);
        break;
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
    } catch {
      showToast('error', 'Failed to pick file');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!selectedFile) return showToast('error', 'Please select a file');
    if (!selectedCourse) return showToast('error', 'Please select a course');
    if (!session) return showToast('error', 'Please select a session');
    if (!examType) return showToast('error', 'Please select the exam type');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/pdf',
        name: selectedFile.name || 'upload.pdf',
      });
      formData.append('course_code', selectedCourse.course_code || selectedCourse.code || '');
      formData.append('course_name', selectedCourse.course_name || selectedCourse.name || '');
      if (selectedUniversity?.id) formData.append('university_id', selectedUniversity.id);
      if (selectedFaculty?.id) formData.append('faculty_id', selectedFaculty.id);
      if (selectedDepartment?.id) formData.append('department_id', selectedDepartment.id);
      formData.append('academic_session', session);
      if (semester) formData.append('semester', semester);
      formData.append('exam_type', examType);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('admin_approved', 'true');

      await api.uploadPastQuestion(formData);
      showToast('success', 'Question uploaded and published successfully');
      router.back();
    } catch (err) {
      showToast('error', err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const styles = createStyles(colors);
  const filteredOptions = picker.options.filter((o) => {
    const label = o.name || o.title || o.course_name || o.course_code || o.code || o.abbreviation || '';
    return label.toLowerCase().includes(pickerSearch.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Upload</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeBtn}>
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

          {/* University */}
          <Text style={styles.sectionTitle}>Institution</Text>
          <Card style={styles.formCard}>
            <SelectRow
              label="University"
              value={selectedUniversity?.name || selectedUniversity?.abbreviation}
              loading={loadingUniversities}
              placeholder="Select university"
              onPress={() => openPicker('university', universities, 'Select University')}
              colors={colors}
              styles={styles}
            />
            <SelectRow
              label="Faculty"
              value={selectedFaculty?.name}
              loading={loadingFaculties}
              placeholder={selectedUniversity ? 'Select faculty' : 'Select university first'}
              disabled={!selectedUniversity}
              onPress={() => openPicker('faculty', faculties, 'Select Faculty')}
              colors={colors}
              styles={styles}
            />
            <SelectRow
              label="Department"
              value={selectedDepartment?.name}
              loading={loadingDepartments}
              placeholder={selectedFaculty ? 'Select department' : 'Select faculty first'}
              disabled={!selectedFaculty}
              onPress={() => openPicker('department', departments, 'Select Department')}
              colors={colors}
              styles={styles}
            />
            <SelectRow
              label="Course"
              value={selectedCourse ? `${selectedCourse.course_code || selectedCourse.code || ''} — ${selectedCourse.course_name || selectedCourse.name || selectedCourse.title || ''}` : null}
              loading={loadingCourses}
              placeholder={selectedDepartment ? 'Select course' : 'Select department first'}
              disabled={!selectedDepartment}
              onPress={() => openPicker('course', courses, 'Select Course')}
              colors={colors}
              styles={styles}
              isLast
            />
          </Card>

          {/* Session & Type */}
          <Text style={styles.sectionTitle}>Session & Type</Text>
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Session *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sessions.slice(-5).reverse().map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, session === s && styles.chipSelected]}
                    onPress={() => setSession(s)}
                  >
                    <Text style={[styles.chipText, session === s && styles.chipTextSelected]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Semester</Text>
              <View style={styles.chipRow}>
                {SEMESTERS.map((sem) => (
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

            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Exam Type *</Text>
              <View style={styles.chipRow}>
                {EXAM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, examType === type && styles.chipSelected]}
                    onPress={() => setExamType(type)}
                  >
                    <Text style={[styles.chipText, examType === type && styles.chipTextSelected]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Description */}
          <Text style={styles.sectionTitle}>Additional Info</Text>
          <Card style={styles.formCard}>
            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes about this question..."
                placeholderTextColor={colors.text.inactive}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </Card>

          <Button
            title={uploading ? 'Uploading...' : 'Upload & Publish'}
            onPress={handleSubmit}
            disabled={uploading}
            icon={uploading ? undefined : 'upload'}
            style={styles.submitBtn}
          />
        </ScrollView>
      </View>

      {/* Picker Modal */}
      <Modal
        visible={picker.visible}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker({ ...picker, visible: false })}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{picker.title}</Text>
              <TouchableOpacity
                style={styles.pickerClose}
                onPress={() => setPicker({ ...picker, visible: false })}
              >
                <Feather name="x" size={22} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color={colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor={colors.text.inactive}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoFocus={false}
              />
            </View>
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.id || item.name)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const label = picker.type === 'course'
                  ? `${item.course_code || item.code || ''} — ${item.course_name || item.name || item.title || ''}`
                  : item.name || item.abbreviation || '';
                return (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => onPickerSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerItemText}>{label}</Text>
                    <Feather name="chevron-right" size={16} color={colors.text.muted} />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.pickerEmpty}>
                  <Text style={styles.pickerEmptyText}>
                    {pickerSearch ? 'No results found' : 'No options available'}
                  </Text>
                </View>
              }
              contentContainerStyle={{ flexGrow: 1 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SelectRow({ label, value, loading, placeholder, disabled, onPress, colors, styles, isLast }) {
  return (
    <View style={[styles.inputGroup, isLast && { marginBottom: 0 }]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectRow, disabled && styles.selectRowDisabled]}
        onPress={disabled ? null : onPress}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.brand.secondary} />
        ) : (
          <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
            {value || placeholder}
          </Text>
        )}
        {!loading && <Feather name="chevron-down" size={18} color={disabled ? colors.text.inactive : colors.text.muted} />}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.primary },
    container: { flex: 1 },
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
    content: { padding: SIZES.padding, paddingBottom: 40 },
    sectionTitle: {
      fontSize: SIZES.md,
      color: colors.text.primary,
      marginBottom: 12,
      marginTop: 8,
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
    uploadTitle: { fontSize: SIZES.base, color: colors.text.primary, ...FONTS.medium },
    uploadSubtitle: { fontSize: SIZES.sm, color: colors.text.muted, marginTop: 4, ...FONTS.regular },
    fileCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    fileIcon: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: 'rgba(239,68,68,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    fileInfo: { flex: 1 },
    fileName: { fontSize: SIZES.base, color: colors.text.primary, ...FONTS.medium },
    fileMeta: { fontSize: SIZES.sm, color: colors.text.muted, marginTop: 2, ...FONTS.regular },
    removeBtn: { padding: 8 },
    formCard: { marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: SIZES.sm, color: colors.text.muted, marginBottom: 8, ...FONTS.medium },
    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.tertiary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radius,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 46,
    },
    selectRowDisabled: { opacity: 0.5 },
    selectText: { flex: 1, fontSize: SIZES.base, color: colors.text.primary, ...FONTS.regular, marginRight: 8 },
    selectPlaceholder: { color: colors.text.inactive },
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
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
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
    chipSelected: { backgroundColor: colors.brand.secondary, borderColor: colors.brand.secondary },
    chipText: { fontSize: SIZES.sm, color: colors.text.secondary, ...FONTS.medium },
    chipTextSelected: { color: colors.background.primary },
    submitBtn: { marginTop: 8 },
    // Picker
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    pickerSheet: {
      backgroundColor: colors.background.secondary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '75%',
    },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SIZES.padding * 1.5,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerTitle: { fontSize: SIZES.lg, color: colors.text.primary, ...FONTS.semibold },
    pickerClose: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: SIZES.padding,
      marginVertical: 12,
      backgroundColor: colors.background.tertiary,
      borderRadius: SIZES.radius,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      paddingLeft: 8,
      fontSize: SIZES.base,
      color: colors.text.primary,
      ...FONTS.regular,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SIZES.padding * 1.5,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerItemText: { flex: 1, fontSize: SIZES.base, color: colors.text.primary, ...FONTS.regular, marginRight: 8 },
    pickerEmpty: { padding: 32, alignItems: 'center' },
    pickerEmptyText: { fontSize: SIZES.base, color: colors.text.muted, ...FONTS.regular },
  });
