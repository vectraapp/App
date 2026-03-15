import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, Button } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

export default function SharePreviewScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) loadPreview();
  }, [code]);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/shares/preview/${code}`);
      setPreview(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load share preview');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const res = await api.post('/shares/redeem', { code });
      showToast('success', 'Content saved to your library!');
      const codeType = res.data?.codeType;
      const resource = res.data?.copiedResource;

      if (codeType === 'lecture' && resource?.id) {
        router.replace(`/lecture/${resource.id}`);
      } else {
        router.replace('/(tabs)/my-courses');
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to redeem');
    } finally {
      setRedeeming(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lecture': return 'mic';
      case 'pdf': return 'file-text';
      case 'notes': return 'edit-3';
      case 'jot_notes': return 'book';
      default: return 'file';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'lecture': return 'Lecture';
      case 'pdf': return 'PDF Document';
      case 'notes': return 'Notes';
      case 'jot_notes': return 'Jot Notes';
      case 'course_pdfs': return 'Course PDFs';
      default: return 'Content';
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Preview</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.brand.secondary} />
            <Text style={styles.loadingText}>Loading preview...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={48} color={colors.brand.error} />
            </View>
            <Text style={styles.errorTitle}>Couldn't load preview</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button
              title="Try Again"
              onPress={loadPreview}
              icon="refresh-cw"
              style={styles.retryBtn}
            />
          </View>
        ) : preview ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Share Code Badge */}
            <View style={styles.codeBadge}>
              <Feather name="hash" size={16} color={colors.brand.secondary} />
              <Text style={styles.codeBadgeText}>{preview.code}</Text>
            </View>

            {/* Type Badge */}
            <View style={styles.typeBadge}>
              <View style={styles.typeIconCircle}>
                <Feather name={getTypeIcon(preview.type)} size={32} color={colors.brand.secondary} />
              </View>
              <Text style={styles.typeLabel}>{getTypeLabel(preview.type)}</Text>
            </View>

            {/* Resource Details */}
            {preview.resource && (
              <Card style={styles.detailsCard}>
                {preview.resource.topic && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="book-open" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Topic</Text>
                      <Text style={styles.detailValue}>{preview.resource.topic}</Text>
                    </View>
                  </View>
                )}

                {(preview.resource.courseCode || preview.resource.courseName) && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="layers" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Course</Text>
                      <Text style={styles.detailValue}>
                        {preview.resource.courseCode}
                        {preview.resource.courseName ? ` - ${preview.resource.courseName}` : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {preview.resource.lecturer && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="user" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Lecturer</Text>
                      <Text style={styles.detailValue}>{preview.resource.lecturer}</Text>
                    </View>
                  </View>
                )}

                {preview.resource.date && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="calendar" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>{formatDate(preview.resource.date)}</Text>
                    </View>
                  </View>
                )}

                {preview.resource.duration > 0 && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="clock" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>{formatDuration(preview.resource.duration)}</Text>
                    </View>
                  </View>
                )}

                {preview.resource.name && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="file" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>File Name</Text>
                      <Text style={styles.detailValue}>{preview.resource.name}</Text>
                    </View>
                  </View>
                )}

                {preview.resource.pageCount && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="file-text" size={16} color={colors.brand.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Pages</Text>
                      <Text style={styles.detailValue}>{preview.resource.pageCount}</Text>
                    </View>
                  </View>
                )}
              </Card>
            )}

            {/* Shared By */}
            <Card style={styles.sharedByCard}>
              <Feather name="user" size={18} color={colors.text.muted} />
              <View style={styles.sharedByInfo}>
                <Text style={styles.sharedByLabel}>Shared by</Text>
                <Text style={styles.sharedByEmail}>{preview.creatorEmail}</Text>
              </View>
            </Card>

            {/* Expiry Info */}
            {preview.expiresAt && (
              <View style={styles.expiryBanner}>
                <Feather name="clock" size={16} color={colors.brand.warning} />
                <Text style={styles.expiryText}>
                  Expires on {formatDate(preview.expiresAt)}
                </Text>
              </View>
            )}

            {/* Actions */}
            <Button
              title={redeeming ? 'Saving...' : 'Save to My Library'}
              onPress={handleRedeem}
              disabled={redeeming}
              icon={redeeming ? undefined : 'download'}
              style={styles.redeemBtn}
            />

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Not now</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
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
  // Loading/Error states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  loadingText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    marginTop: 16,
    ...FONTS.regular,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tint.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.bold,
  },
  errorMessage: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 24,
    ...FONTS.regular,
  },
  retryBtn: {
    paddingHorizontal: 32,
  },
  // Content
  content: {
    padding: SIZES.padding,
    paddingBottom: 40,
    alignItems: 'center',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tint.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  codeBadgeText: {
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    letterSpacing: 2,
    ...FONTS.bold,
  },
  typeBadge: {
    alignItems: 'center',
    marginBottom: 24,
  },
  typeIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  // Details card
  detailsCard: {
    width: '100%',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.tint.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    marginBottom: 2,
    ...FONTS.medium,
  },
  detailValue: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  // Shared by
  sharedByCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sharedByInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sharedByLabel: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  sharedByEmail: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  // Expiry
  expiryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: 14,
    borderRadius: SIZES.radius,
    backgroundColor: colors.tint.warningLight,
    marginBottom: 24,
  },
  expiryText: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.medium,
  },
  // Actions
  redeemBtn: {
    width: '100%',
    marginBottom: 12,
  },
  cancelBtn: {
    padding: 12,
  },
  cancelBtnText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    ...FONTS.medium,
  },
});
