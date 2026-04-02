import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card, EmptyState } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import PDFViewer from '../../components/viewers/PDFViewer';

export default function AdminQuestions() {
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf') || url.includes('application/pdf');
  };

  const handlePreview = (item) => {
    const url = item.file_url || item.image_url;
    if (!url) {
      showToast('error', 'No file available to preview');
      return;
    }
    setPreviewItem(item);
    if (isPdf(url)) {
      setShowPdfViewer(true);
    } else {
      setShowImageViewer(true);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await api.get('/uploads/admin/all?upload_type=past_question');
      const data = res?.data || [];
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('error', 'Failed to load questions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadQuestions();
  }, []);

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Question',
      `Delete ${item.course_code || 'this question'}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await api.delete(`/uploads/admin/${item.id}`);
              setQuestions((prev) => prev.filter((q) => q.id !== item.id));
              showToast('success', 'Question deleted');
            } catch (err) {
              showToast('error', err.message || 'Failed to delete');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const styles = createStyles(colors);

  const renderQuestion = ({ item }) => {
    const isDeleting = deletingId === item.id;
    // Determine source: if user_email matches an admin pattern or admin_notes/published_by set
    const isAdminUpload = item.published_by != null || item.status === 'approved' && item.user_email?.includes('admin');
    const uploaderLabel = item.user_email || 'Unknown';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{item.course_code || 'N/A'}</Text>
          </View>
          <View style={[
            styles.sourceBadge,
            item.published_by ? styles.sourceBadgeAdmin : styles.sourceBadgeUser,
          ]}>
            <Feather
              name={item.published_by ? 'shield' : 'user'}
              size={10}
              color={item.published_by ? colors.brand.secondary : colors.text.muted}
            />
            <Text style={[
              styles.sourceText,
              item.published_by ? styles.sourceTextAdmin : styles.sourceTextUser,
            ]}>
              {item.published_by ? 'Admin' : 'User'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}
          >
            {isDeleting
              ? <ActivityIndicator size="small" color="#EF4444" />
              : <Feather name="trash-2" size={16} color="#EF4444" />
            }
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          {item.academic_session ? (
            <View style={styles.infoRow}>
              <Feather name="calendar" size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>{item.academic_session}</Text>
            </View>
          ) : null}
          {(item.exam_type || item.question_type) ? (
            <View style={styles.infoRow}>
              <Feather name="tag" size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>{item.exam_type || item.question_type}</Text>
            </View>
          ) : null}
          {item.semester ? (
            <View style={styles.infoRow}>
              <Feather name="layers" size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>{item.semester}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Feather name="user" size={14} color={colors.text.muted} />
            <Text style={styles.infoText} numberOfLines={1}>{uploaderLabel}</Text>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        {(item.file_url || item.image_url) && (
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => handlePreview(item)}
            activeOpacity={0.7}
          >
            <Feather
              name={isPdf(item.file_url || item.image_url) ? 'file-text' : 'image'}
              size={16}
              color={colors.brand.secondary}
            />
            <Text style={styles.previewBtnText}>View Document</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Questions</Text>
        <Text style={styles.countText}>{questions.length} total</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderQuestion}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.secondary}
              colors={[colors.brand.secondary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="file-text"
              title="No questions yet"
              message="Questions uploaded by admins and users will appear here"
            />
          }
        />
      )}

      {/* PDF Viewer */}
      {previewItem && isPdf(previewItem.file_url || previewItem.image_url) && (
        <PDFViewer
          url={previewItem.file_url || previewItem.image_url}
          title={`${previewItem.course_code || ''} ${previewItem.exam_type || ''}`}
          visible={showPdfViewer}
          onClose={() => { setShowPdfViewer(false); setPreviewItem(null); }}
        />
      )}

      {/* Image Viewer */}
      {previewItem && !isPdf(previewItem.file_url || previewItem.image_url) && (
        <Modal
          visible={showImageViewer}
          transparent
          animationType="fade"
          onRequestClose={() => { setShowImageViewer(false); setPreviewItem(null); }}
        >
          <View style={styles.imageViewerOverlay}>
            <TouchableOpacity
              style={styles.imageViewerClose}
              onPress={() => { setShowImageViewer(false); setPreviewItem(null); }}
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: previewItem.file_url || previewItem.image_url }}
              style={styles.imageViewerImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background.primary,
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
    headerTitle: {
      fontSize: SIZES.xl,
      color: colors.text.primary,
      ...FONTS.bold,
    },
    countText: {
      fontSize: SIZES.sm,
      color: colors.text.muted,
      ...FONTS.regular,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: SIZES.padding * 1.5,
      paddingBottom: 40,
      flexGrow: 1,
    },
    card: {
      marginBottom: 14,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    courseBadge: {
      backgroundColor: colors.tint.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    courseBadgeText: {
      fontSize: SIZES.sm,
      color: colors.brand.primary,
      ...FONTS.semibold,
    },
    sourceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 4,
    },
    sourceBadgeAdmin: {
      backgroundColor: colors.tint.secondary,
    },
    sourceBadgeUser: {
      backgroundColor: colors.background.tertiary,
    },
    sourceText: {
      fontSize: SIZES.xs,
      ...FONTS.semibold,
    },
    sourceTextAdmin: {
      color: colors.brand.secondary,
    },
    sourceTextUser: {
      color: colors.text.muted,
    },
    deleteBtn: {
      marginLeft: 'auto',
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: 'rgba(239,68,68,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: {
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    infoText: {
      fontSize: SIZES.md,
      color: colors.text.secondary,
      marginLeft: 8,
      flex: 1,
      ...FONTS.regular,
    },
    dateText: {
      fontSize: SIZES.sm,
      color: colors.text.muted,
      ...FONTS.regular,
    },
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tint.secondary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: SIZES.radius,
      gap: 8,
    },
    previewBtnText: {
      fontSize: SIZES.sm,
      color: colors.brand.secondary,
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
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').width * 1.4,
    },
  });
