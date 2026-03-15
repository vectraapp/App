import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import { useTheme } from '../../context/ThemeContext';

export default function RedeemCodeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const inputRefs = useRef([]);

  const handleCodeChange = (value, index) => {
    const newCode = [...code];

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || '';
      }
      setCode(newCode);
      if (pastedCode.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    // Handle single character
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRedeem = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter a complete 6-character code');
      return;
    }

    Keyboard.dismiss();
    // Navigate to preview screen with the code
    router.push({ pathname: '/sharing/preview', params: { code: fullCode } });
  };

  const handleViewLecture = () => {
    router.back();
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem Code</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {!success ? (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Feather name="gift" size={48} color={colors.brand.secondary} />
              </View>

              <Text style={styles.title}>Enter Share Code</Text>
              <Text style={styles.subtitle}>
                Enter the 6-character code to access shared content
              </Text>

              {/* Code Input */}
              <View style={styles.codeInputContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      error && styles.codeInputError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={6}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    keyboardType="default"
                    placeholder="-"
                    placeholderTextColor={colors.text.inactive}
                  />
                ))}
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color={colors.brand.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Redeem Button */}
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  code.join('').length !== 6 && styles.redeemButtonDisabled,
                ]}
                onPress={handleRedeem}
                disabled={isRedeeming || code.join('').length !== 6}
              >
                {isRedeeming ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.redeemButtonText}>Redeem Code</Text>
                )}
              </TouchableOpacity>

              {/* Info */}
              <Card style={styles.infoCard}>
                <Feather name="info" size={16} color={colors.brand.primary} />
                <Text style={styles.infoText}>
                  Share codes are case-insensitive and expire after the time set by the sender.
                </Text>
              </Card>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={styles.successIconContainer}>
                <Feather name="check-circle" size={64} color={colors.brand.accent} />
              </View>

              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successSubtitle}>
                You now have access to this lecture
              </Text>

              <Card style={styles.lectureCard}>
                <View style={styles.lectureIcon}>
                  <Feather name="book-open" size={24} color={colors.brand.secondary} />
                </View>
                <View style={styles.lectureInfo}>
                  <Text style={styles.lectureTitle}>{success.title}</Text>
                  <Text style={styles.lectureMeta}>
                    {success.course} - Shared by {success.sharedBy}
                  </Text>
                </View>
              </Card>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewLecture}
              >
                <Text style={styles.viewButtonText}>View Lecture</Text>
                <Feather name="arrow-right" size={18} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.laterButton}
                onPress={() => router.back()}
              >
                <Text style={styles.laterButtonText}>View Later</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: SIZES.xxl,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 32,
    ...FONTS.regular,
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: SIZES.radiusSm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: SIZES.xl,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  codeInputFilled: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.tint.secondaryLight,
  },
  codeInputError: {
    borderColor: colors.brand.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: colors.brand.error,
    ...FONTS.medium,
  },
  redeemButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: colors.brand.primary,
    marginTop: 16,
    marginBottom: 24,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonText: {
    fontSize: SIZES.base,
    color: colors.white,
    ...FONTS.semibold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.tint.primaryLight,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    ...FONTS.regular,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: SIZES.xxxl,
    color: colors.brand.accent,
    marginBottom: 8,
    ...FONTS.bold,
  },
  successSubtitle: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    marginBottom: 32,
    ...FONTS.regular,
  },
  lectureCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  lectureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 4,
    ...FONTS.semibold,
  },
  lectureMeta: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  viewButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: colors.brand.primary,
    marginBottom: 12,
  },
  viewButtonText: {
    fontSize: SIZES.base,
    color: colors.white,
    ...FONTS.semibold,
  },
  laterButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: colors.background.tertiary,
  },
  laterButtonText: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
});
