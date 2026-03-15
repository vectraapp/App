import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';

const APP_VERSION = '1.0.0';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const features = [
    { icon: 'mic', text: 'Record and transcribe lectures' },
    { icon: 'cpu', text: 'AI-structured notes' },
    { icon: 'file-text', text: 'Past question database' },
    { icon: 'message-circle', text: 'AI study assistant' },
    { icon: 'book-open', text: 'Personal notebook' },
    { icon: 'share-2', text: 'Share with friends' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Vectra</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Feather name="book-open" size={40} color={colors.brand.secondary} />
            </View>
            <Text style={styles.brandName}>VECTRA</Text>
            <Text style={styles.tagline}>Your Study Companion</Text>
            <Text style={styles.version}>Version {APP_VERSION}</Text>
          </View>

          {/* Description */}
          <Card style={styles.descriptionCard}>
            <Text style={styles.description}>
              Vectra combines AI-powered lecture recording with access to past examination questions, helping students study smarter and achieve academic success.
            </Text>
          </Card>

          {/* Features */}
          <Text style={styles.sectionTitle}>Features</Text>
          <Card style={styles.featuresCard}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureRow,
                  index < features.length - 1 && styles.featureRowBorder,
                ]}
              >
                <View style={styles.featureIcon}>
                  <Feather name={feature.icon} size={18} color={colors.brand.secondary} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </Card>

          {/* Links */}
          <Text style={styles.sectionTitle}>Legal</Text>
          <Card style={styles.linksCard}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/legal/terms')}
            >
              <Feather name="file-text" size={18} color={colors.text.muted} />
              <Text style={styles.linkText}>Terms of Service</Text>
              <Feather name="chevron-right" size={18} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.linkRow, styles.linkRowLast]}
              onPress={() => router.push('/legal/privacy')}
            >
              <Feather name="shield" size={18} color={colors.text.muted} />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Feather name="chevron-right" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made for students</Text>
            <Text style={styles.copyright}>2026 Vectra. All rights reserved.</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: 6,
    ...FONTS.bold,
  },
  tagline: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginTop: 8,
    ...FONTS.regular,
  },
  version: {
    fontSize: SIZES.sm,
    color: colors.text.inactive,
    marginTop: 8,
    ...FONTS.regular,
  },
  descriptionCard: {
    marginBottom: 24,
  },
  description: {
    fontSize: SIZES.base,
    color: colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
    ...FONTS.regular,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  featuresCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  linksCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 32,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkText: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginLeft: 12,
    ...FONTS.medium,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 8,
    ...FONTS.regular,
  },
  copyright: {
    fontSize: SIZES.sm,
    color: colors.text.inactive,
    ...FONTS.regular,
  },
});
