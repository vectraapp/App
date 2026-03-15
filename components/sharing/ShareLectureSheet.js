import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONTENT_OPTIONS = [
  { key: 'notes', icon: 'file-text', label: 'AI Structured Notes', description: 'Formatted lecture notes' },
  { key: 'transcript', icon: 'mic', label: 'Full Transcript', description: 'Raw audio transcription' },
  { key: 'pdf', icon: 'download', label: 'Lecture PDF', description: 'Downloadable PDF document' },
  { key: 'images', icon: 'image', label: 'Lecture Photos', description: 'Photos taken during lecture' },
];

export default function ShareLectureSheet({ visible, onClose, lecture, onShare }) {
  const { colors } = useTheme();
  const [shareMethod, setShareMethod] = useState('code');
  const [expiryDays, setExpiryDays] = useState('7');
  const [selectedContent, setSelectedContent] = useState(['notes', 'pdf']);
  const [isGenerating, setIsGenerating] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset selections when opening
      setSelectedContent(['notes', 'pdf']);
      setIsGenerating(false);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleContent = (key) => {
    setSelectedContent(prev => {
      if (prev.includes(key)) {
        // Don't allow deselecting all
        if (prev.length <= 1) return prev;
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleGenerateCode = async () => {
    if (selectedContent.length === 0) return;
    setIsGenerating(true);
    try {
      await onShare({
        lectureId: lecture?.id,
        method: shareMethod,
        expiryDays: parseInt(expiryDays, 10),
        contentTypes: selectedContent,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter available content based on lecture data
  const availableContent = CONTENT_OPTIONS.filter(opt => {
    if (opt.key === 'notes') return lecture?.structured_markdown || lecture?.ai_notes;
    if (opt.key === 'transcript') return lecture?.transcript;
    if (opt.key === 'pdf') return lecture?.pdf_url;
    if (opt.key === 'images') return lecture?.images?.length > 0;
    return true;
  });

  const styles = createStyles(colors);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text style={styles.title}>Share Lecture</Text>
            {lecture && (
              <Text style={styles.lectureName} numberOfLines={2}>
                {lecture.topic || lecture.title}
              </Text>
            )}

            {/* Content Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What to Share</Text>
              {availableContent.map(opt => {
                const isSelected = selectedContent.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.contentOption, isSelected && styles.contentOptionSelected]}
                    onPress={() => toggleContent(opt.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && (
                        <Feather name="check" size={14} color={colors.white} />
                      )}
                    </View>
                    <View style={styles.contentIcon}>
                      <Feather
                        name={opt.icon}
                        size={18}
                        color={isSelected ? colors.brand.secondary : colors.text.muted}
                      />
                    </View>
                    <View style={styles.contentInfo}>
                      <Text style={[styles.contentLabel, isSelected && styles.contentLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.contentDesc}>{opt.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {availableContent.length === 0 && (
                <View style={styles.emptyContent}>
                  <Feather name="alert-circle" size={20} color={colors.text.muted} />
                  <Text style={styles.emptyContentText}>
                    No content available to share yet. Process the lecture first.
                  </Text>
                </View>
              )}
            </View>

            {/* Share Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Share Method</Text>
              <View style={styles.methodOptions}>
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    shareMethod === 'code' && styles.methodOptionActive,
                  ]}
                  onPress={() => setShareMethod('code')}
                >
                  <Feather
                    name="hash"
                    size={20}
                    color={shareMethod === 'code' ? colors.brand.secondary : colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      shareMethod === 'code' && styles.methodTextActive,
                    ]}
                  >
                    Share Code
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    shareMethod === 'link' && styles.methodOptionActive,
                  ]}
                  onPress={() => setShareMethod('link')}
                >
                  <Feather
                    name="link"
                    size={20}
                    color={shareMethod === 'link' ? colors.brand.secondary : colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      shareMethod === 'link' && styles.methodTextActive,
                    ]}
                  >
                    Share Link
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expires After</Text>
              <View style={styles.expiryOptions}>
                {[
                  { value: '1', label: '1 Day' },
                  { value: '7', label: '7 Days' },
                  { value: '30', label: '30 Days' },
                  { value: '90', label: '90 Days' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.expiryOption,
                      expiryDays === opt.value && styles.expiryOptionActive,
                    ]}
                    onPress={() => setExpiryDays(opt.value)}
                  >
                    <Text
                      style={[
                        styles.expiryText,
                        expiryDays === opt.value && styles.expiryTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Feather name="info" size={16} color={colors.brand.primary} />
              <Text style={styles.infoText}>
                {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected.{' '}
                {shareMethod === 'code'
                  ? 'Recipients enter the code in-app to access.'
                  : 'Anyone with the link can access until expiry.'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (isGenerating || selectedContent.length === 0) && styles.generateButtonDisabled,
                ]}
                onPress={handleGenerateCode}
                disabled={isGenerating || selectedContent.length === 0}
              >
                {isGenerating ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Feather name="share-2" size={18} color={colors.white} />
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.82,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
    ...FONTS.bold,
  },
  lectureName: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 24,
    ...FONTS.regular,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  // Content selection
  contentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.radius,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  contentOptionSelected: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.tint.secondaryLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  contentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  contentLabelSelected: {
    color: colors.brand.secondary,
  },
  contentDesc: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: colors.tint.warningLight,
    borderRadius: SIZES.radius,
  },
  emptyContentText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.regular,
  },
  // Method selection
  methodOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: SIZES.radius,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodOptionActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.tint.secondaryLight,
  },
  methodText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  methodTextActive: {
    color: colors.brand.secondary,
  },
  // Expiry
  expiryOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  expiryOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  expiryOptionActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.tint.secondaryLight,
  },
  expiryText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.semibold,
  },
  expiryTextActive: {
    color: colors.brand.secondary,
  },
  // Info
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: colors.tint.primaryLight,
    borderRadius: SIZES.radiusSm,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    ...FONTS.regular,
  },
  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: colors.background.tertiary,
  },
  cancelButtonText: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: colors.brand.primary,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: SIZES.base,
    color: colors.white,
    ...FONTS.semibold,
  },
});
