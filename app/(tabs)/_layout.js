import { useEffect } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const TAB_NAMES = ['my-courses', 'lectures', 'streaks', 'profile'];

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

export default function TabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = useSharedValue(0);

  useEffect(() => {
    const idx = TAB_NAMES.findIndex((n) => pathname.endsWith(n));
    if (idx !== -1) {
      activeIndex.value = withSpring(idx, SPRING_CONFIG);
    }
  }, [pathname]);

  const goToTab = (index) => {
    if (index >= 0 && index < TAB_NAMES.length) {
      router.navigate(TAB_NAMES[index]);
    }
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-25, 25])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      'worklet';
      const current = Math.round(activeIndex.value);
      if (e.translationX < -50 && e.velocityX < 0) {
        runOnJS(goToTab)(current + 1);
      } else if (e.translationX > 50 && e.velocityX > 0) {
        runOnJS(goToTab)(current - 1);
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand.secondary,
          tabBarInactiveTintColor: colors.text.inactive,
          tabBarLabelStyle: {
            fontSize: SIZES.xs,
            ...FONTS.medium,
            marginTop: -2,
            marginBottom: 4,
          },
          tabBarStyle: {
            backgroundColor: colors.background.navbar,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 72,
            paddingTop: 6,
            paddingBottom: 12,
          },
        }}
      >
        <Tabs.Screen
          name="browse"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="my-courses"
          options={{
            title: 'My Courses',
            tabBarIcon: ({ color, size }) => (
              <Feather name="book-open" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="lectures"
          options={{
            title: 'Lectures',
            tabBarIcon: ({ color, size }) => (
              <Feather name="mic" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="streaks"
          options={{
            title: 'Streaks',
            tabBarIcon: ({ color, size }) => (
              <Feather name="zap" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureDetector>
  );
}
