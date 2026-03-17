import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card, EmptyState } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';
import { delay, DUMMY_PENDING_UPLOADS } from '../../services/dummyData';
import PDFViewer from '../../components/viewers/PDFViewer';

export default function AdminUploads() {
  const router = useRouter();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
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

  const loadUploads = async () => {
    try {
      await delay(400);
      setUploads(DUMMY_PENDING_UPLOADS);
    } catch (err) {
      showToast('error', 'Failed to load pending uploads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUploads();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await delay(600);
      setUploads((prev) => prev.filter((u) => u.id !== id));
      showToast('success', 'Upload approved successfully');
    } catch (err) {
      showToast('error', 'Failed to approve upload');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (id) => {
    Alert.prompt(
      'Reject Upload',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || !reason.trim()) {
              showToast('error', 'Please provide a rejection reason');
              return;
            }
            setActionLoading(id);
            try {
              await delay(600);
              setUploads((prev) => prev.filter((u) => u.id !== id));
              showToast('success', 'Upload rejected');
            } catch (err) {
              showToast('error', 'Failed to reject upload');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
      'plain-text',
      '',
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const styles = createStyles(colors);

  const renderUpload = ({ item }) => {
    const isProcessing = actionLoading === item.id;

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {item.type || 'Upload'}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.cardBody}>
          {item.course_code ? (
            <View style={styles.infoRow}>
              <Feather name="book" size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>{item.course_code}</Text>
            </View>
          ) : null}
          {(item.uploader_email || item.email) ? (
            <View style={styles.infoRow}>
              <Feather name="user" size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>{item.uploader_email || item.email}</Text>
            </View>
          ) : null}
          {item.file_size ? (
            <View style={styles.infoRow}>
              <Feather name="hard-drive" size={14} color={colors.text.muted} />
              <Text style={styles.infoText}>{formatFileSize(item.file_size)}</Text>
            </View>
          ) : null}
        </View>

        {(item.file_url || item.image_url) && (
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => handlePreview(item)}
            activeOpacity={0.7}
          >
            <Feather name={isPdf(item.file_url || item.image_url) ? 'file-text' : 'image'} size={16} color={colors.brand.secondary} />
            <Text style={styles.previewBtnText}>View Document</Text>
          </TouchableOpacity>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id)}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item.id)}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <Feather name="x" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Uploads</Text>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => router.push('/upload/admin-upload')}
        >
          <Feather name="plus" size={20} color={colors.white} />
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      ) : (
        <FlatList
          data={uploads}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUpload}
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
              icon="check-circle"
              title="All caught up!"
              message="No pending uploads to review"
            />
          }
        />
      )}
      {/* PDF Viewer Modal */}
      {previewItem && isPdf(previewItem.file_url || previewItem.image_url) && (
        <PDFViewer
          url={previewItem.file_url || previewItem.image_url}
          title={`${previewItem.course_code || ''} Upload`}
          visible={showPdfViewer}
          onClose={() => { setShowPdfViewer(false); setPreviewItem(null); }}
        />
      )}

      {/* Image Viewer Modal */}
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
    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.brand.secondary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    uploadBtnText: {
      fontSize: SIZES.sm,
      color: colors.white,
      ...FONTS.semibold,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeBadge: {
      backgroundColor: colors.tint.accent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    typeBadgeText: {
      fontSize: SIZES.sm,
      color: colors.brand.accent,
      ...FONTS.semibold,
      textTransform: 'capitalize',
    },
    dateText: {
      fontSize: SIZES.sm,
      color: colors.text.muted,
      ...FONTS.regular,
    },
    cardBody: {
      marginBottom: 14,
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
      ...FONTS.regular,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: SIZES.radiusSm,
    },
    approveButton: {
      backgroundColor: '#10B981',
    },
    rejectButton: {
      backgroundColor: '#EF4444',
    },
    actionButtonText: {
      fontSize: SIZES.sm,
      color: '#FFFFFF',
      marginLeft: 6,
      ...FONTS.semibold,
    },
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tint.secondary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: SIZES.radius,
      marginBottom: 14,
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
