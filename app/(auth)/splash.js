import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SIZES } from '../../constants/theme';
import useAuthStore from '../../store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in and scale up (0-2 sec)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // Pulse animation (2-6 sec)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    const pulseTimeout = setTimeout(() => {
      pulseAnimation.start();
    }, 2000);

    // Navigate after 5 seconds
    const navigationTimeout = setTimeout(async () => {
      pulseAnimation.stop();

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(async () => {
        // Check navigation destination
        const introComplete = await AsyncStorage.getItem('introComplete');

        if (isAuthenticated) {
          router.replace('/(tabs)/my-courses');
        } else if (introComplete === 'true') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(auth)/intro');
        }
      });
    }, 5000);

    return () => {
      clearTimeout(pulseTimeout);
      clearTimeout(navigationTimeout);
    };
  }, [isAuthenticated]);

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
    const timeout = setTimeout(() => {
      Animated.loop(
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
      ).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.brand.secondary,
          marginHorizontal: 4,
          transform: [{ scale: scaleAnim }],
        },
      ]}
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
