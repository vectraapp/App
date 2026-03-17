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
  const styles = createStyles(colors);

  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val !== null) setEnabled(JSON.parse(val));
      })
      .catch(() => {});
  }, []);

  const toggle = (val) => {
    setEnabled(val);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(val)).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <Feather name="bell" size={18} color={colors.brand.secondary} />
                </View>
                <View>
                  <Text style={styles.rowLabel}>Push Notifications</Text>
                  <Text style={styles.rowDesc}>
                    Receive updates for new content, exam reminders, and study streaks
                  </Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={toggle}
                trackColor={{ false: colors.border, true: colors.brand.secondary }}
                thumbColor={colors.white}
              />
            </View>
          </Card>

          <View style={styles.noteRow}>
            <Feather name="info" size={14} color={colors.text.muted} />
            <Text style={styles.noteText}>
              You can also manage notification permissions in your phone settings.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  container: { flex: 1 },
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: SIZES.lg, color: colors.text.primary, ...FONTS.bold },
  content: { padding: SIZES.padding * 1.5 },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: { fontSize: SIZES.base, color: colors.text.primary, ...FONTS.semibold },
  rowDesc: {
    fontSize: SIZES.sm, color: colors.text.muted,
    marginTop: 2, lineHeight: 18, ...FONTS.regular,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.muted,
    lineHeight: 18,
    ...FONTS.regular,
  },
});
