import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      showToast('error', err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.successContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            <View style={styles.mailIconContainer}>
              <Feather name="mail" size={36} color={colors.brand.secondary} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We sent a password reset link to {email}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backToLogin}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Feather name="book-open" size={36} color={colors.brand.secondary} />
            </View>
            <Text style={styles.brand}>VECTRA</Text>
            <Text style={styles.subtitle}>From lecture to exam success</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Reset Password</Text>
            <Text style={styles.formDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="Enter your email"
              error={errors.email}
              icon="mail"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Back to Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: 6,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    marginTop: 8,
    ...FONTS.regular,
  },
  formCard: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 32,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    ...FONTS.bold,
  },
  formDescription: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    ...FONTS.regular,
  },
  submitButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  loginLink: {
    fontSize: SIZES.base,
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
  successContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
  },
  successContainer: {
    alignItems: 'center',
  },
  mailIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    ...FONTS.bold,
  },
  successSubtitle: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    ...FONTS.regular,
  },
  backToLogin: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToLoginText: {
    fontSize: SIZES.base,
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
});
