import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setError('Group name is required'); return; }
    if (!courseCode.trim()) { setError('Course code is required'); return; }
    setError('');
    setLoading(true);
    try {
      const response = await api.createGroup({
        name: name.trim(),
        course_code: courseCode.trim(),
        course_name: courseName.trim() || undefined,
        description: description.trim() || undefined,
      });
      if (response.success && response.data?.id) {
        router.replace({
          pathname: '/groups/[id]',
          params: { id: response.data.id, name: response.data.name },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Group</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionHint}>
            Create a study group for your course and invite classmates to join and collaborate.
          </Text>

          {/* Group Name */}
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. PHY301 Study Squad"
            placeholderTextColor={colors.text.muted}
            value={name}
            onChangeText={setName}
            maxLength={60}
          />

          {/* Course Code */}
          <Text style={styles.label}>Course Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. PHY301"
            placeholderTextColor={colors.text.muted}
            value={courseCode}
            onChangeText={(t) => setCourseCode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={10}
          />

          {/* Course Name */}
          <Text style={styles.label}>Course Name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Electromagnetic Theory"
            placeholderTextColor={colors.text.muted}
            value={courseName}
            onChangeText={setCourseName}
            maxLength={100}
          />

          {/* Description */}
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What is this group for?"
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.createBtn, loading && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Feather name="users" size={18} color={colors.white} />
                <Text style={styles.createBtnText}>Create Group</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: SIZES.xl, color: colors.text.primary, ...FONTS.bold },
  content: { padding: SIZES.padding * 1.5 },
  sectionHint: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    lineHeight: 20,
    marginBottom: 24,
    ...FONTS.regular,
  },
  label: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    marginBottom: 6,
    ...FONTS.semibold,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 16,
    ...FONTS.regular,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  errorText: {
    color: colors.brand.error,
    fontSize: SIZES.sm,
    marginBottom: 12,
    ...FONTS.regular,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 15,
    gap: 8,
    marginTop: 8,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: colors.white, fontSize: SIZES.base, ...FONTS.semibold },
});
