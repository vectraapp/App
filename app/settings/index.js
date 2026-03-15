import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import useAuthStore from '../../store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data — lectures, notes, uploads, and messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              router.replace('/(auth)/login');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete account. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance Section */}
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon="moon"
              label="Dark Mode"
              sublabel="Always on"
              onPress={() => router.push('/settings/appearance')}
            />
          </Card>

          {/* Notifications Section */}
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon="bell"
              label="Push Notifications"
              sublabel="On"
              onPress={() => {}}
            />
            <SettingItem
              icon="mail"
              label="Email Notifications"
              sublabel="Off"
              onPress={() => {}}
              isLast
            />
          </Card>

          {/* Data Section */}
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon="trash-2"
              label="Clear Cache"
              sublabel="Free up storage"
              onPress={() => {}}
              isLast
            />
          </Card>

          {/* Privacy Section */}
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon="shield"
              label="Privacy Policy"
              onPress={() => router.push('/legal/privacy')}
            />
            <SettingItem
              icon="file-text"
              label="Terms of Service"
              onPress={() => router.push('/legal/terms')}
              isLast
            />
          </Card>

          {/* Danger Zone */}
          <Text style={[styles.sectionTitle, { color: colors.brand.error }]}>Danger Zone</Text>
          <Card style={[styles.menuCard, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.dangerItem}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.tint.error }]}>
                  <Feather name="user-x" size={18} color={colors.brand.error} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.brand.error }]}>
                    {deleting ? 'Deleting…' : 'Delete Account'}
                  </Text>
                  <Text style={styles.settingSublabel}>Permanently removes all your data</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SettingItem({ icon, label, sublabel, onPress, isLast = false }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.settingItem, isLast && styles.settingItemLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Feather name={icon} size={18} color={colors.brand.secondary} />
        </View>
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {sublabel && <Text style={styles.settingSublabel}>{sublabel}</Text>}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.text.muted} />
    </TouchableOpacity>
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
  scrollContent: {
    padding: SIZES.padding * 1.5,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    marginTop: 16,
    ...FONTS.semibold,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  settingSublabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: colors.brand.error + '40',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
});
