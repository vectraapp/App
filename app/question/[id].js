import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, Image, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import PDFViewer from '../../components/viewers/PDFViewer';
import { delay, DUMMY_QUESTIONS } from '../../services/dummyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  goBack: {
    fontSize: SIZES.md,
    color: colors.brand.secondary,
    marginTop: 12,
    ...FONTS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SIZES.padding * 1.5,
  },
  infoSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 12,
    ...FONTS.bold,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginLeft: 6,
    ...FONTS.regular,
  },
  pdfPlaceholder: {
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radiusLg,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  documentImage: {
    width: '100%',
    height: 400,
    borderRadius: SIZES.radiusLg,
    backgroundColor: colors.background.tertiary,
  },
  tapToZoom: {
    textAlign: 'center',
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    marginTop: 8,
    ...FONTS.medium,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.4,
  },
  placeholderTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginTop: 16,
    ...FONTS.semibold,
  },
  placeholderText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    ...FONTS.regular,
  },
});

// Map backend snake_case fields to UI camelCase
function mapQuestion(item) {
  return {
    id: item.id,
    courseCode: item.course_code || '',
    title: item.course_title || `${item.course_code || ''} ${item.question_type || ''} ${item.academic_session || ''}`.trim(),
    session: item.academic_session || '',
    semester: item.semester || '',
    type: item.question_type || '',
    pages: item.pages || null,
    imageUrl: item.image_url || item.file_url || null,
    level: item.level || '',
    hasAccess: item.hasAccess || false,
  };
}

export default function QuestionViewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      await delay(400);
      const found = DUMMY_QUESTIONS.find((q) => q.id === id) || DUMMY_QUESTIONS[0];
      // Map to the shape this screen expects
      setQuestion({
        id: found.id,
        courseCode: found.courseCode,
        title: `${found.courseCode} ${found.examType} ${found.session}`,
        session: found.session,
        semester: '',
        type: found.examType,
        pages: null,
        imageUrl: found.fileUrl || null,
        level: '',
        hasAccess: true,
      });
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setLoading(false);
    }
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf') || url.includes('application/pdf');
  };

  const handleOpenDocument = () => {
    if (!question.imageUrl) return;
    if (isPdf(question.imageUrl)) {
      setShowPdfViewer(true);
    } else {
      setShowImageViewer(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this past question: ${question.courseCode} ${question.type} - ${question.session}`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Question not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.goBack}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{question.courseCode}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Feather name="share-2" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Question Info */}
          <View style={styles.infoSection}>
            <Text style={styles.title}>{question.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={14} color={colors.text.muted} />
                <Text style={styles.metaText}>{question.session}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="book-open" size={14} color={colors.text.muted} />
                <Text style={styles.metaText}>{question.semester}</Text>
              </View>
              {question.pages != null && (
                <View style={styles.metaItem}>
                  <Feather name="file" size={14} color={colors.text.muted} />
                  <Text style={styles.metaText}>{question.pages} pages</Text>
                </View>
              )}
            </View>
          </View>

          {/* Document Viewer */}
          {question.imageUrl ? (
            isPdf(question.imageUrl) ? (
              <TouchableOpacity
                style={styles.pdfPlaceholder}
                onPress={handleOpenDocument}
                activeOpacity={0.7}
              >
                <Feather name="file-text" size={64} color={colors.brand.primary} />
                <Text style={styles.placeholderTitle}>View PDF Document</Text>
                <Text style={styles.placeholderText}>
                  Tap to open the {(question.type || 'exam').toLowerCase()} paper
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleOpenDocument}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: question.imageUrl }}
                  style={styles.documentImage}
                  resizeMode="contain"
                />
                <Text style={styles.tapToZoom}>Tap to view full screen</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.pdfPlaceholder}>
              <Feather name="file-text" size={64} color={colors.border} />
              <Text style={styles.placeholderTitle}>No Document Available</Text>
              <Text style={styles.placeholderText}>
                The document for this {(question.type || 'exam').toLowerCase()} paper has not been uploaded yet.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* PDF Viewer Modal */}
        {question.imageUrl && isPdf(question.imageUrl) && (
          <PDFViewer
            url={question.imageUrl}
            title={`${question.courseCode} ${question.type} - ${question.session}`}
            visible={showPdfViewer}
            onClose={() => setShowPdfViewer(false)}
          />
        )}

        {/* Image Viewer Modal */}
        {question.imageUrl && !isPdf(question.imageUrl) && (
          <Modal
            visible={showImageViewer}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImageViewer(false)}
          >
            <View style={styles.imageViewerOverlay}>
              <TouchableOpacity
                style={styles.imageViewerClose}
                onPress={() => setShowImageViewer(false)}
              >
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
              <Image
                source={{ uri: question.imageUrl }}
                style={styles.imageViewerImage}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}
