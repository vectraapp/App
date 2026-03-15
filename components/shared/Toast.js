import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const ToastContext = createContext(null);

const TOAST_DURATION = 3000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ToastMessage({ toast, onHide }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const TOAST_CONFIG = {
    success: {
      icon: 'check-circle',
      backgroundColor: colors.brand.accent,
    },
    error: {
      icon: 'alert-circle',
      backgroundColor: colors.brand.error,
    },
    info: {
      icon: 'info',
      backgroundColor: colors.brand.primary,
    },
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: config.backgroundColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <Feather name={config.icon} size={20} color="#FFFFFF" style={styles.toastIcon} />
      <Text style={styles.toastText} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View style={styles.container} pointerEvents="none">
          <ToastMessage key={toast.id} toast={toast} onHide={hideToast} />
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    marginHorizontal: 20,
    width: SCREEN_WIDTH - 40,
    maxWidth: 500,
  },
  toastIcon: {
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: SIZES.md,
    ...FONTS.medium,
  },
});
