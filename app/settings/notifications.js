import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';

const STORAGE_KEY = '@vectra_notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [lectureComplete, setLectureComplete] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        setPushEnabled(settings.pushEnabled ?? true);
        setEmailEnabled(settings.emailEnabled ?? false);
        setLectureComplete(settings.lectureComplete ?? true);
        setStudyReminders(settings.studyReminders ?? true);
      }
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const settings = saved ? JSON.parse(saved) : {};
      settings[key] = value;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving notification settings:', error);
    }
  };

  const handleToggle = (setter, key, value) => {
    setter(value);
    saveSettings(key, value);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* General Notifications */}
          <Text style={styles.sectionTitle}>General</Text>
          <Card style={styles.card}>
            <SettingRow
              colors={colors}
              icon="bell"
              label="Push Notifications"
              description="Receive notifications on your device"
              value={pushEnabled}
              onToggle={(val) => handleToggle(setPushEnabled, 'pushEnabled', val)}
            />
            <SettingRow
              colors={colors}
              icon="mail"
              label="Email Notifications"
              description="Receive updates via email"
              value={emailEnabled}
              onToggle={(val) => handleToggle(setEmailEnabled, 'emailEnabled', val)}
              isLast
            />
          </Card>

          {/* Notification Types */}
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <Card style={styles.card}>
            <SettingRow
              colors={colors}
              icon="check-circle"
              label="Lecture Processing Complete"
              description="When your lecture is ready to view"
              value={lectureComplete}
              onToggle={(val) => handleToggle(setLectureComplete, 'lectureComplete', val)}
              disabled={!pushEnabled}
            />
            <SettingRow
              colors={colors}
              icon="clock"
              label="Study Reminders"
              description="Daily reminders to review your notes"
              value={studyReminders}
              onToggle={(val) => handleToggle(setStudyReminders, 'studyReminders', val)}
              disabled={!pushEnabled}
              isLast
            />
          </Card>

          {/* Info */}
          <Card style={styles.infoCard}>
            <Feather name="info" size={18} color={colors.brand.primary} style={{ marginRight: 12 }} />
            <Text style={styles.infoText}>
              You can change your notification preferences at any time. Some notifications may be required for important account updates.
            </Text>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingRow({ colors, icon, label, description, value, onToggle, isLast = false, disabled = false }) {
  const styles = createStyles(colors);

  return (
    <View style={[styles.settingRow, !isLast && styles.settingRowBorder, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon} size={18} color={colors.brand.secondary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>{label}</Text>
          <Text style={styles.settingDesc}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.brand.secondary }}
        thumbColor={colors.white}
        disabled={disabled}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  content: {
    padding: SIZES.padding * 1.5,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  settingLabelDisabled: {
    color: colors.text.muted,
  },
  settingDesc: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.tint.primaryLight,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    ...FONTS.regular,
  },
});
