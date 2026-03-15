import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SIZES } from '../../constants/theme';
import { Card, Button } from '../../components/shared';

const STORAGE_KEY = '@vectra_downloads';

export default function DownloadsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        setWifiOnly(settings.wifiOnly ?? true);
        setAutoDownload(settings.autoDownload ?? false);
      }
    } catch (error) {
      console.log('Error loading download settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const settings = saved ? JSON.parse(saved) : {};
      settings[key] = value;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving download settings:', error);
    }
  };

  const handleToggle = (setter, key, value) => {
    setter(value);
    saveSettings(key, value);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data including offline content. You will need to download content again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // In a real app, implement cache clearing logic here
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Downloads</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Download Settings */}
          <Text style={styles.sectionTitle}>Download Settings</Text>
          <Card style={styles.card}>
            <SettingRow
              colors={colors}
              icon="wifi"
              label="Download over Wi-Fi only"
              description="Save mobile data by downloading only on Wi-Fi"
              value={wifiOnly}
              onToggle={(val) => handleToggle(setWifiOnly, 'wifiOnly', val)}
            />
            <SettingRow
              colors={colors}
              icon="download-cloud"
              label="Auto-download lectures"
              description="Automatically download new lecture recordings"
              value={autoDownload}
              onToggle={(val) => handleToggle(setAutoDownload, 'autoDownload', val)}
              isLast
            />
          </Card>

          {/* Storage */}
          <Text style={styles.sectionTitle}>Storage</Text>
          <Card style={styles.card}>
            <View style={styles.storageRow}>
              <View style={styles.storageInfo}>
                <Feather name="hard-drive" size={20} color={colors.text.muted} />
                <View style={styles.storageText}>
                  <Text style={styles.storageLabel}>Cached Data</Text>
                  <Text style={styles.storageValue}>0 MB used</Text>
                </View>
              </View>
            </View>
          </Card>

          <Button
            title="Clear Cache"
            variant="outline"
            icon="trash-2"
            onPress={handleClearCache}
            style={styles.clearButton}
          />

          {/* Info */}
          <Card style={styles.infoCard}>
            <Feather name="info" size={18} color={colors.brand.primary} style={{ marginRight: 12 }} />
            <Text style={styles.infoText}>
              Downloaded content is stored locally for offline access. Clear cache if you need to free up storage space.
            </Text>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingRow({ colors, icon, label, description, value, onToggle, isLast = false }) {
  const styles = createStyles(colors);

  return (
    <View style={[styles.settingRow, !isLast && styles.settingRowBorder]}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon} size={18} color={colors.brand.secondary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDesc}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.brand.secondary }}
        thumbColor={colors.white}
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
    marginBottom: 16,
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
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  settingDesc: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageText: {
    marginLeft: 12,
  },
  storageLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  storageValue: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  clearButton: {
    marginBottom: 24,
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
