import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
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
          height: 60,
          paddingTop: 6,
        },
      }}
    >
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
  );
}
