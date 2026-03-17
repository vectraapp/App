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
import { Feather, FontAwesome } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const signup = useAuthStore((s) => s.signup);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(email.trim(), password, displayName.trim(), termsAccepted);
      router.replace({ pathname: '/(auth)/verify-email', params: { email: email.trim() } });
    } catch (err) {
      showToast('error', err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      showToast('success', 'Account created with Google!');
      router.replace('/(auth)/onboarding');
    } catch (err) {
      showToast('error', err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const styles = createStyles(colors);

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
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Feather name="book-open" size={36} color={colors.brand.secondary} />
            </View>
            <Text style={styles.brand}>VECTRA</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign Up</Text>

            <Input
              label="Full Name"
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: '' }));
              }}
              placeholder="Enter your full name"
              error={errors.displayName}
              icon="user"
              autoComplete="name"
            />

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

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Create a password"
              error={errors.password}
              secureTextEntry
              icon="lock"
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              secureTextEntry
              icon="lock"
            />

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                setTermsAccepted(!termsAccepted);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted ? (
                  <Feather name="check" size={14} color={colors.white} />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => router.push('/legal/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => router.push('/legal/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? (
              <Text style={styles.termsError}>{errors.terms}</Text>
            ) : null}

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              disabled={!termsAccepted}
              style={styles.signupButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignup}
              disabled={googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <Feather name="loader" size={18} color={colors.text.secondary} />
              ) : (
                <FontAwesome name="google" size={18} color="#EA4335" />
              )}
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
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
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
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
    marginTop: 20,
  },
  brand: {
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: 5,
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
    paddingTop: 28,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
    ...FONTS.bold,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  termsText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.muted,
    lineHeight: 20,
    ...FONTS.regular,
  },
  termsLink: {
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
  termsError: {
    fontSize: SIZES.xs,
    color: colors.brand.error,
    marginTop: 4,
    marginLeft: 32,
    ...FONTS.regular,
  },
  signupButton: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: SIZES.sm,
    color: colors.text.inactive,
    ...FONTS.regular,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.tertiary,
    marginBottom: 4,
  },
  googleBtnText: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
});
