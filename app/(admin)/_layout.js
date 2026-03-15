import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

export default function AdminLayout() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = user?.profile?.role || user?.role || 'user';
    setIsAdmin(role === 'admin' || role === 'super_admin');
    setChecking(false);
  }, [user]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.brand.secondary} />
      </View>
    );
  }

  if (!isAdmin) {
    return <Redirect href="/(tabs)/my-courses" />;
  }

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
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'Questions',
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="uploads"
        options={{
          title: 'Uploads',
          tabBarIcon: ({ color, size }) => (
            <Feather name="upload" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="structure"
        options={{
          title: 'Structure',
          tabBarIcon: ({ color, size }) => (
            <Feather name="git-branch" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
