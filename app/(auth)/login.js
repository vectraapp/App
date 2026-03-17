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
import { Feather, AntDesign } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast('success', 'Welcome back!');

      // Navigate based on role and onboarding status
      const { onboardingCompleted, user: loggedInUser } = useAuthStore.getState();
      const userRole = loggedInUser?.profile?.role || loggedInUser?.role || 'user';

      if (userRole === 'admin' || userRole === 'super_admin') {
        router.replace('/(admin)/dashboard');
      } else if (onboardingCompleted) {
        router.replace('/(tabs)/my-courses');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch (err) {
      showToast('error', err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      showToast('success', 'Signed in with Google!');
      const { onboardingCompleted, user: loggedInUser } = useAuthStore.getState();
      const userRole = loggedInUser?.role || 'user';
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.replace('/(admin)/dashboard');
      } else if (onboardingCompleted) {
        router.replace('/(tabs)/my-courses');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch (err) {
      showToast('error', err.message || 'Google sign-in failed. Please try again.');
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
            <Text style={styles.formTitle}>Sign In</Text>

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
              placeholder="Enter your password"
              error={errors.password}
              secureTextEntry
              icon="lock"
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
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
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <AntDesign name="loading1" size={18} color={colors.text.secondary} />
              ) : (
                <AntDesign name="google" size={18} color="#EA4335" />
              )}
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: 24,
    textAlign: 'center',
    ...FONTS.bold,
  },
  loginButton: {
    marginTop: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  signupLink: {
    fontSize: SIZES.base,
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    ...FONTS.medium,
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
