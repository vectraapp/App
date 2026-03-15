import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SIZES } from '../constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { colors } = useTheme();
  const initialize = useAuthStore((s) => s.initialize);
  const [appIsReady, setAppIsReady] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulseAnimation;
    let isMounted = true;

    async function prepare() {
      try {
        // Initialize auth store
        await initialize();

        // Hide native splash
        await SplashScreen.hideAsync();

        // Start fade in and scale animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.2)),
          }),
        ]).start();

        // Start pulse animation after fade in
        setTimeout(() => {
          if (!isMounted) return;
          pulseAnimation = Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.05,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
              }),
            ])
          );
          pulseAnimation.start();
        }, 1500);

        // Wait for splash duration (5 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000));

        if (!isMounted) return;

        // Stop pulse
        if (pulseAnimation) pulseAnimation.stop();

        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();

        await new Promise(resolve => setTimeout(resolve, 500));

        if (isMounted) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('Splash error:', e);
        if (isMounted) setAppIsReady(true);
      }
    }

    prepare();

    return () => {
      isMounted = false;
      if (pulseAnimation) pulseAnimation.stop();
    };
  }, []);

  useEffect(() => {
    if (!appIsReady) return;

    const navigate = async () => {
      try {
        const introComplete = await AsyncStorage.getItem('introComplete');
        const { isAuthenticated, onboardingCompleted } = useAuthStore.getState();

        if (isAuthenticated && onboardingCompleted) {
          router.replace('/(tabs)/my-courses');
        } else if (isAuthenticated && !onboardingCompleted) {
          router.replace('/(auth)/onboarding');
        } else if (introComplete === 'true') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(auth)/intro');
        }
      } catch (e) {
        console.warn('Navigation error:', e);
        router.replace('/(auth)/login');
      }
    };

    navigate();
  }, [appIsReady]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Feather name="book-open" size={48} color={colors.brand.secondary} />
        </View>
        <Text style={styles.brandName}>VECTRA</Text>
        <Text style={styles.tagline}>From lecture to exam success</Text>
      </Animated.View>

      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingDots}>
          <LoadingDot colors={colors} delay={0} />
          <LoadingDot colors={colors} delay={200} />
          <LoadingDot colors={colors} delay={400} />
        </View>
      </Animated.View>
    </View>
  );
}

function LoadingDot({ colors, delay }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation;
    const timeout = setTimeout(() => {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animation) animation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.brand.secondary,
        marginHorizontal: 4,
        transform: [{ scale: scaleAnim }],
      }}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandName: {
    fontSize: 40,
    color: colors.text.primary,
    letterSpacing: 8,
    ...FONTS.bold,
  },
  tagline: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginTop: 12,
    ...FONTS.regular,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
