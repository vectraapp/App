import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/shared';

const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    // Simulate resend delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setResendLoading(false);
    setCooldown(RESEND_COOLDOWN);
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:').catch(() => {});
  };

  const handleContinue = () => {
    router.replace('/(auth)/onboarding');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Feather name="mail" size={40} color={colors.brand.secondary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification link to
        </Text>
        <Text style={styles.email}>{email || 'your email address'}</Text>
        <Text style={styles.instruction}>
          Click the link in the email to activate your account before signing in.
        </Text>

        {/* Open Email App */}
        <TouchableOpacity style={styles.openEmailBtn} onPress={handleOpenEmail} activeOpacity={0.8}>
          <Feather name="external-link" size={16} color={colors.brand.secondary} />
          <Text style={styles.openEmailText}>Open Email App</Text>
        </TouchableOpacity>

        {/* Continue button */}
        <Button
          title="I've Verified My Email"
          onPress={handleContinue}
          style={styles.continueBtn}
        />

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive it? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={cooldown > 0 || resendLoading}
          >
            <Text style={[
              styles.resendLink,
              (cooldown > 0 || resendLoading) && styles.resendLinkDisabled,
            ]}>
              {resendLoading
                ? 'Sending...'
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend Email'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to login */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.backRow}
        >
          <Feather name="arrow-left" size={14} color={colors.text.muted} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.tint.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: SIZES.xxl,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    ...FONTS.regular,
  },
  email: {
    fontSize: SIZES.base,
    color: colors.brand.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    ...FONTS.semibold,
  },
  instruction: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    ...FONTS.regular,
  },
  openEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    marginBottom: 20,
  },
  openEmailText: {
    fontSize: SIZES.base,
    color: colors.brand.secondary,
    ...FONTS.medium,
  },
  continueBtn: {
    width: '100%',
    marginBottom: 20,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  resendLink: {
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
  resendLinkDisabled: {
    color: colors.text.inactive,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
});
