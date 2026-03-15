import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';

export default function TermsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>Last updated: March 2026</Text>

          <Section title="1. Acceptance of Terms" colors={colors}>
            <Text style={styles.paragraph}>
              By accessing or using Vectra, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any of these terms, you are prohibited from using or accessing this application.
            </Text>
          </Section>

          <Section title="2. Content Ownership" colors={colors}>
            <Card style={styles.warningCard}>
              <Feather name="alert-triangle" size={20} color={colors.brand.warning} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Important Notice</Text>
                <Text style={styles.warningText}>
                  Vectra does not claim ownership of any educational content.
                </Text>
              </View>
            </Card>

            <Text style={styles.paragraph}>
              Copyright and intellectual property rights remain with:
            </Text>
            <BulletPoint text="Original educational institutions" colors={colors} />
            <BulletPoint text="Content creators and lecturers" colors={colors} />
            <BulletPoint text="Users who upload original materials" colors={colors} />
            <BulletPoint text="Publishers of textbooks and reference materials" colors={colors} />

            <Text style={styles.paragraph}>
              Vectra provides a platform for educational access only. We do not own, sell, or distribute copyrighted examination materials.
            </Text>
          </Section>

          <Section title="3. User Responsibilities" colors={colors}>
            <Text style={styles.paragraph}>
              As a user of Vectra, you agree to:
            </Text>
            <BulletPoint text="Use the platform for legitimate educational purposes only" colors={colors} />
            <BulletPoint text="Not share your account credentials with others" colors={colors} />
            <BulletPoint text="Not redistribute or sell content from the platform" colors={colors} />
            <BulletPoint text="Respect the intellectual property rights of content creators" colors={colors} />
            <BulletPoint text="Report any copyright violations you encounter" colors={colors} />
          </Section>

          <Section title="4. User-Generated Content & Uploads" colors={colors}>
            <Text style={styles.paragraph}>
              When you upload content to Vectra (lecture recordings, past questions, textbooks, notes, etc.):
            </Text>
            <BulletPoint text="You retain ownership of your original content" colors={colors} />
            <BulletPoint text="You grant Vectra a license to store, display, and process your content" colors={colors} />
            <BulletPoint text="You confirm you have the right to share any uploaded content" colors={colors} />
            <BulletPoint text="You can delete your content at any time from your account" colors={colors} />
            <BulletPoint text="Uploaded past questions are reviewed by admins before being made public" colors={colors} />
          </Section>

          <Section title="5. Lecture Recordings" colors={colors}>
            <Text style={styles.paragraph}>
              Vectra allows you to record lectures and generate AI transcriptions. By using this feature:
            </Text>
            <BulletPoint text="You are responsible for obtaining consent from lecturers and others present before recording" colors={colors} />
            <BulletPoint text="Recordings are stored securely and associated with your account" colors={colors} />
            <BulletPoint text="AI-generated transcriptions may contain errors and should be reviewed" colors={colors} />
            <BulletPoint text="You can share recordings with other Vectra users using share codes" colors={colors} />
            <BulletPoint text="Deleting your account permanently removes all your recordings" colors={colors} />
          </Section>

          <Section title="6. AI Assistant" colors={colors}>
            <Text style={styles.paragraph}>
              Vectra includes an AI-powered study assistant (powered by Claude). By using the AI chat feature:
            </Text>
            <BulletPoint text="AI responses are generated automatically and may not always be accurate" colors={colors} />
            <BulletPoint text="Do not rely solely on AI responses for examinations or critical academic work" colors={colors} />
            <BulletPoint text="Your chat messages may be processed by third-party AI providers" colors={colors} />
            <BulletPoint text="Do not share sensitive personal information in AI chats" colors={colors} />
            <BulletPoint text="You can delete your chat history at any time from within the chat screen" colors={colors} />
          </Section>

          <Section title="7. Study Groups" colors={colors}>
            <Text style={styles.paragraph}>
              The Study Groups feature lets you collaborate with other students. When using Study Groups:
            </Text>
            <BulletPoint text="You are responsible for the messages you send in group chats" colors={colors} />
            <BulletPoint text="Group creators can manage membership and delete the group" colors={colors} />
            <BulletPoint text="Do not share offensive, misleading, or harmful content in groups" colors={colors} />
            <BulletPoint text="Invite codes should be shared responsibly" colors={colors} />
            <BulletPoint text="Vectra may remove groups or messages that violate these terms" colors={colors} />
          </Section>

          <Section title="8. Prohibited Activities" colors={colors}>
            <Text style={styles.paragraph}>
              The following activities are strictly prohibited:
            </Text>
            <BulletPoint text="Uploading copyrighted content without permission" colors={colors} />
            <BulletPoint text="Using the platform for commercial purposes without authorization" colors={colors} />
            <BulletPoint text="Attempting to hack, reverse engineer, or exploit the platform" colors={colors} />
            <BulletPoint text="Sharing content that violates academic integrity policies" colors={colors} />
            <BulletPoint text="Harassing other users or posting offensive content in groups or chats" colors={colors} />
            <BulletPoint text="Creating fake accounts or impersonating other users" colors={colors} />
          </Section>

          <Section title="9. Account & Data Deletion" colors={colors}>
            <Text style={styles.paragraph}>
              You may delete your account at any time from Settings → Danger Zone. Account deletion is permanent and will remove:
            </Text>
            <BulletPoint text="Your profile and all personal information" colors={colors} />
            <BulletPoint text="All lecture recordings and transcriptions" colors={colors} />
            <BulletPoint text="Your uploaded past questions and textbooks" colors={colors} />
            <BulletPoint text="Your AI chat history" colors={colors} />
            <BulletPoint text="Your study group memberships and messages" colors={colors} />
            <Text style={styles.paragraph}>
              Vectra also reserves the right to suspend or terminate accounts that violate these terms.
            </Text>
          </Section>

          <Section title="10. Privacy" colors={colors}>
            <Text style={styles.paragraph}>
              Your use of Vectra is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data. By using Vectra, you agree to the collection and use of information as described in our Privacy Policy.
            </Text>
          </Section>

          <Section title="11. Disclaimer" colors={colors}>
            <Text style={styles.paragraph}>
              Vectra is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any content on the platform. AI-generated content — including transcriptions and chat responses — should be independently verified before use in academic work.
            </Text>
          </Section>

          <Section title="12. Changes to Terms" colors={colors}>
            <Text style={styles.paragraph}>
              We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </Text>
          </Section>

          <Section title="13. Contact" colors={colors}>
            <Text style={styles.paragraph}>
              For questions about these Terms of Service, contact us at:
            </Text>
            <Text style={styles.contactEmail}>legal@vectra.app</Text>
          </Section>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children, colors }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletPoint({ text, colors }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{text}</Text>
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
  lastUpdated: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 24,
    ...FONTS.regular,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginBottom: 12,
    ...FONTS.bold,
  },
  paragraph: {
    fontSize: SIZES.base,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 12,
    ...FONTS.regular,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.tint.warningLight,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: SIZES.base,
    color: colors.brand.warning,
    marginBottom: 4,
    ...FONTS.semibold,
  },
  warningText: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    ...FONTS.regular,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.secondary,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.text.secondary,
    lineHeight: 22,
    ...FONTS.regular,
  },
  contactEmail: {
    fontSize: SIZES.base,
    color: colors.brand.primary,
    ...FONTS.medium,
  },
  bottomPadding: {
    height: 40,
  },
});
