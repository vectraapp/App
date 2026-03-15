import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import useAuthStore from '../../store/authStore';

export default function UploadTextbookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const getProfile = useAuthStore((s) => s.getProfile);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [edition, setEdition] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

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
        type: 'application/pdf',
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
    if (!title.trim()) {
      showToast('error', 'Please enter the textbook title');
      return;
    }
    if (!materialType) {
      showToast('error', 'Please select the material type');
      return;
    }

    setUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('success', 'Textbook uploaded successfully! It will be reviewed before publishing.');
      router.back();
    } catch (err) {
      showToast('error', 'Failed to upload textbook');
    } finally {
      setUploading(false);
    }
  };

  const styles = createStyles(colors);

  const materialTypes = ['Textbook', 'Lecture Notes', 'Study Guide', 'Reference', 'Slides'];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Textbook</Text>
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
              Share study materials with your peers. Please only upload materials you have the right to share.
            </Text>
          </Card>

          {/* File Upload */}
          <Text style={styles.sectionTitle}>PDF File</Text>
          {selectedFile ? (
            <Card style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <Feather name="file-text" size={24} color={colors.brand.error} />
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
              <Text style={styles.uploadTitle}>Tap to upload PDF</Text>
              <Text style={styles.uploadSubtitle}>Max file size: 50MB</Text>
            </TouchableOpacity>
          )}

          {/* Material Type */}
          <Text style={styles.sectionTitle}>Material Type</Text>
          <View style={styles.chipRow}>
            {materialTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, materialType === type && styles.chipSelected]}
                onPress={() => setMaterialType(type)}
              >
                <Text style={[styles.chipText, materialType === type && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Book Details */}
          <Text style={styles.sectionTitle}>Material Details</Text>
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Introduction to Algorithms"
                placeholderTextColor={colors.text.inactive}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Author(s)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Thomas H. Cormen"
                placeholderTextColor={colors.text.inactive}
                value={author}
                onChangeText={setAuthor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Edition / Year</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 4th Edition (2022)"
                placeholderTextColor={colors.text.inactive}
                value={edition}
                onChangeText={setEdition}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Course Code (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., CSC 301"
                placeholderTextColor={colors.text.inactive}
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />
            </View>
          </Card>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Card style={styles.formCard}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Briefly describe this material and what topics it covers..."
              placeholderTextColor={colors.text.inactive}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          {/* Submit Button */}
          <Button
            title={uploading ? 'Uploading...' : 'Submit Material'}
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
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
  submitBtn: {
    marginTop: 8,
  },
});
