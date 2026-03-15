import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  DONE: 'done',
};

export default function DownloadButton({ resourceId, resourceType, title, url, style }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [status, setStatus] = useState(STATE.IDLE);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinRef = useRef(null);

  useEffect(() => {
    if (status === STATE.LOADING) {
      spinRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      );
      spinRef.current.start();
    } else {
      if (spinRef.current) {
        spinRef.current.stop();
        spinRef.current = null;
      }
      spinAnim.setValue(0);
    }
    return () => {
      if (spinRef.current) {
        spinRef.current.stop();
      }
    };
  }, [status]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = async () => {
    if (status !== STATE.IDLE) return;
    setStatus(STATE.LOADING);
    // Simulate download delay
    await new Promise((r) => setTimeout(r, 1800));
    setStatus(STATE.DONE);
  };

  const isLoading = status === STATE.LOADING;
  const isDone = status === STATE.DONE;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDone && styles.buttonDone,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={isDone ? 1 : 0.75}
      disabled={isLoading || isDone}
    >
      {isLoading ? (
        <>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Feather name="loader" size={14} color={colors.brand.primary} />
          </Animated.View>
          <Text style={styles.buttonText}>Downloading...</Text>
        </>
      ) : isDone ? (
        <>
          <Feather name="check" size={14} color={colors.brand.accent} />
          <Text style={[styles.buttonText, { color: colors.brand.accent }]}>Downloaded</Text>
        </>
      ) : (
        <>
          <Feather name="download" size={14} color={colors.brand.primary} />
          <Text style={styles.buttonText}>Download</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (c) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1.5,
    borderColor: c.brand.primary,
    backgroundColor: 'transparent',
  },
  buttonDone: {
    borderColor: c.brand.accent,
  },
  buttonText: {
    fontSize: SIZES.sm,
    color: c.brand.primary,
    ...FONTS.semibold,
  },
});
