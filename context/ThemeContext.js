import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS, darkNavTheme, lightNavTheme, setThemeColors } from '../constants/theme';

const THEME_STORAGE_KEY = '@vectra_theme';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  colors: DARK_COLORS,
  navTheme: darkNavTheme,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState('dark'); // 'light', 'dark', or 'auto'
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference
  const setTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Determine if dark mode should be active
  const isDark = useMemo(() => {
    if (theme === 'auto') {
      return systemColorScheme === 'dark';
    }
    return theme === 'dark';
  }, [theme, systemColorScheme]);

  // Get the appropriate colors
  const colors = useMemo(() => {
    const themeColors = isDark ? DARK_COLORS : LIGHT_COLORS;
    // Update global COLORS for backwards compatibility
    setThemeColors(isDark);
    return themeColors;
  }, [isDark]);

  // Get the navigation theme
  const navTheme = useMemo(() => {
    return isDark ? darkNavTheme : lightNavTheme;
  }, [isDark]);

  const value = useMemo(() => ({
    theme,
    isDark,
    colors,
    navTheme,
    setTheme,
    toggleTheme,
    isLoading,
  }), [theme, isDark, colors, navTheme, isLoading]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
