import React, { useState } from 'react';
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

const FAQS = [
  {
    question: 'How do I record a lecture?',
    answer: 'Go to the Lectures tab, tap the "Record" button, select a course, and start recording. You can also take photos during the recording.',
  },
  {
    question: 'How long does processing take?',
    answer: 'Processing typically takes 2-5 minutes depending on the lecture length. You will receive a notification when your lecture is ready.',
  },
  {
    question: 'Can I share my notes with friends?',
    answer: 'Yes! Open a lecture, tap the Share button, and generate a share code. Your friend can redeem the code in their app to access your notes.',
  },
  {
    question: 'How do I access past questions?',
    answer: 'Go to My Courses or Browse, select a course, and navigate to the Questions tab to view all available past questions.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, all your data is encrypted and stored securely. We use industry-standard security practices to protect your information.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const styles = createStyles(colors);

  const handleEmail = (subject) => {
    Linking.openURL(`mailto:support@vectra.app?subject=${encodeURIComponent(subject)}`);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Contact Options */}
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Card style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleEmail('Support Request')}
            >
              <View style={styles.contactIcon}>
                <Feather name="mail" size={20} color={colors.brand.secondary} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>support@vectra.app</Text>
              </View>
              <Feather name="external-link" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </Card>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleEmail('Bug Report')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.tint.error }]}>
                <Feather name="alert-circle" size={22} color={colors.brand.error} />
              </View>
              <Text style={styles.actionLabel}>Report a Bug</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleEmail('Feature Request')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.tint.secondary }]}>
                <Feather name="zap" size={22} color={colors.brand.secondary} />
              </View>
              <Text style={styles.actionLabel}>Feature Request</Text>
            </TouchableOpacity>
          </View>

          {/* FAQs */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Card style={styles.faqCard}>
            {FAQS.map((faq, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Feather
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
                {index < FAQS.length - 1 && <View style={styles.faqDivider} />}
              </View>
            ))}
          </Card>

          {/* App Info */}
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2026.02.03</Text>
            </View>
          </Card>

          <View style={styles.bottomPadding} />
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
  sectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  contactCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  contactValue: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: SIZES.sm,
    color: colors.text.primary,
    textAlign: 'center',
    ...FONTS.medium,
  },
  faqCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginRight: 12,
    ...FONTS.medium,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    ...FONTS.regular,
  },
  faqDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoCard: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoLabel: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  infoValue: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  bottomPadding: {
    height: 40,
  },
});
