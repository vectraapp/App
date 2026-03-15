import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Share,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../shared/Toast';

export default function ShareCodeModal({ visible, onClose, shareCode, shareLink, expiryDate }) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const shareMessage = shareCode
    ? `Hey! I shared lecture notes with you on Vectra. Use code: ${shareCode} to access them in the app.`
    : `Hey! Check out my shared lecture notes on Vectra: ${shareLink}`;

  const handleCopyCode = async () => {
    if (shareCode) {
      await Clipboard.setStringAsync(shareCode);
      showToast('success', 'Code copied!');
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await Clipboard.setStringAsync(shareLink);
      showToast('success', 'Link copied!');
    }
  };

  const handleWhatsApp = async () => {
    try {
      const encoded = encodeURIComponent(shareMessage);
      const url = `whatsapp://send?text=${encoded}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showToast('error', 'WhatsApp is not installed');
      }
    } catch (error) {
      showToast('error', 'Could not open WhatsApp');
    }
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({ message: shareMessage, title: 'Share Lecture' });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const styles = createStyles(colors);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Feather name="check-circle" size={48} color={colors.brand.accent} />
          </View>

          <Text style={styles.title}>Share Created</Text>
          <Text style={styles.subtitle}>Your lecture is ready to share</Text>

          {shareCode && (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Share Code</Text>
              <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode} activeOpacity={0.7}>
                <Text style={styles.codeText}>{shareCode}</Text>
                <View style={styles.copyBadge}>
                  <Feather name="copy" size={14} color={colors.brand.secondary} />
                  <Text style={styles.copyBadgeText}>Tap to copy</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {shareLink && (
            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel}>Share Link</Text>
              <TouchableOpacity style={styles.linkBox} onPress={handleCopyLink} activeOpacity={0.7}>
                <Text style={styles.linkText} numberOfLines={1}>{shareLink}</Text>
                <Feather name="copy" size={16} color={colors.brand.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {expiryDate && (
            <View style={styles.expiryInfo}>
              <Feather name="clock" size={14} color={colors.text.muted} />
              <Text style={styles.expiryText}>Expires on {formatDate(expiryDate)}</Text>
            </View>
          )}

          {/* Share Actions */}
          <Text style={styles.shareViaLabel}>Share via</Text>
          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareOption} onPress={handleWhatsApp}>
              <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                <Feather name="message-circle" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.shareOptionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleNativeShare}>
              <View style={[styles.shareIconCircle, { backgroundColor: colors.brand.primary }]}>
                <Feather name="share-2" size={20} color={colors.white} />
              </View>
              <Text style={styles.shareOptionText}>More</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareOption}
              onPress={shareCode ? handleCopyCode : handleCopyLink}
            >
              <View style={[styles.shareIconCircle, { backgroundColor: colors.brand.secondary }]}>
                <Feather name="clipboard" size={20} color={colors.white} />
              </View>
              <Text style={styles.shareOptionText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modal: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tint.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 4,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 24,
    ...FONTS.regular,
  },
  codeContainer: {
    width: '100%',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 8,
    ...FONTS.medium,
  },
  codeBox: {
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: SIZES.xxl,
    color: colors.brand.secondary,
    letterSpacing: 6,
    textAlign: 'center',
    ...FONTS.bold,
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  copyBadgeText: {
    fontSize: SIZES.xs,
    color: colors.brand.secondary,
    ...FONTS.medium,
  },
  linkContainer: {
    width: '100%',
    marginBottom: 16,
  },
  linkLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 8,
    ...FONTS.medium,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    ...FONTS.regular,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  expiryText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  // Share via section
  shareViaLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 12,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
    width: '100%',
  },
  shareOption: {
    alignItems: 'center',
    gap: 6,
  },
  shareIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionText: {
    fontSize: SIZES.xs,
    color: colors.text.secondary,
    ...FONTS.medium,
  },
  doneButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: colors.background.tertiary,
  },
  doneButtonText: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
});
