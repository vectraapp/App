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

export default function PrivacyScreen() {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>Last updated: March 2026</Text>

          <Text style={styles.intro}>
            Your privacy is important to us. This Privacy Policy explains how Vectra collects, uses, and protects your personal information.
          </Text>

          <Section title="1. Information We Collect" colors={colors}>
            <SubSection title="Account Information" colors={colors}>
              <BulletPoint text="Email address" colors={colors} />
              <BulletPoint text="Name" colors={colors} />
              <BulletPoint text="University and department" colors={colors} />
              <BulletPoint text="Profile picture (if provided)" colors={colors} />
            </SubSection>

            <SubSection title="Usage Data" colors={colors}>
              <BulletPoint text="Lecture recordings and notes you create" colors={colors} />
              <BulletPoint text="Courses you access" colors={colors} />
              <BulletPoint text="App usage patterns and preferences" colors={colors} />
            </SubSection>

            <SubSection title="Device Information" colors={colors}>
              <BulletPoint text="Device type and operating system" colors={colors} />
              <BulletPoint text="App version" colors={colors} />
              <BulletPoint text="Error logs for troubleshooting" colors={colors} />
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information" colors={colors}>
            <BulletPoint text="To provide and improve our services" colors={colors} />
            <BulletPoint text="To personalize your experience" colors={colors} />
            <BulletPoint text="To process your lecture recordings with AI" colors={colors} />
            <BulletPoint text="To send important notifications about your account" colors={colors} />
            <BulletPoint text="To respond to support requests" colors={colors} />
            <BulletPoint text="To detect and prevent fraud or abuse" colors={colors} />
          </Section>

          <Section title="3. User-Uploaded Content" colors={colors}>
            <Text style={styles.paragraph}>
              Vectra allows students to upload academic materials such as past questions and textbooks to help their peers.
            </Text>

            <SubSection title="What happens when you upload" colors={colors}>
              <BulletPoint text="Your uploaded material is immediately visible to you in the relevant course directory" colors={colors} />
              <BulletPoint text="The upload is sent to our admin team for review before other students can access it" colors={colors} />
              <BulletPoint text="Once approved by an admin, the material becomes visible to all students in that course directory" colors={colors} />
              <BulletPoint text="If rejected, your upload is not deleted — it remains visible to you but is not shared with others" colors={colors} />
            </SubSection>

            <SubSection title="Ownership and responsibility" colors={colors}>
              <BulletPoint text="You retain ownership of the content you upload" colors={colors} />
              <BulletPoint text="By uploading, you confirm the content does not infringe on any copyright" colors={colors} />
              <BulletPoint text="Uploaded files are stored securely on Cloudinary (cloud storage)" colors={colors} />
              <BulletPoint text="We reserve the right to remove content that violates our guidelines" colors={colors} />
            </SubSection>

            <SubSection title="Content visibility" colors={colors}>
              <BulletPoint text="Pending uploads: visible to you only" colors={colors} />
              <BulletPoint text="Approved uploads: visible to all students in that university directory" colors={colors} />
              <BulletPoint text="Rejected uploads: visible to you only, never shown to others" colors={colors} />
            </SubSection>
          </Section>

          <Section title="4. Lecture Recordings" colors={colors}>
            <Text style={styles.paragraph}>
              Vectra allows you to record lectures on your device and process them with AI for transcription and summaries.
            </Text>

            <SubSection title="How recordings work" colors={colors}>
              <BulletPoint text="Recordings are captured locally on your device using your microphone" colors={colors} />
              <BulletPoint text="Audio files are uploaded to our servers and processed by OpenAI Whisper for transcription" colors={colors} />
              <BulletPoint text="Transcripts and AI summaries are generated and stored with your lecture" colors={colors} />
              <BulletPoint text="Your recordings are private by default — only you can see them" colors={colors} />
            </SubSection>

            <SubSection title="Sharing recordings" colors={colors}>
              <BulletPoint text="You may share a recording with other users via a share code" colors={colors} />
              <BulletPoint text="Only users with the share code can access the shared recording" colors={colors} />
              <BulletPoint text="You can deactivate a share code at any time to revoke access" colors={colors} />
            </SubSection>

            <SubSection title="AI processing" colors={colors}>
              <BulletPoint text="Audio is sent to OpenAI Whisper solely for transcription purposes" colors={colors} />
              <BulletPoint text="AI responses (summaries, answers) are generated by Anthropic Claude" colors={colors} />
              <BulletPoint text="We do not use your recordings to train AI models" colors={colors} />
              <BulletPoint text="Audio files may be deleted from processing servers after transcription is complete" colors={colors} />
            </SubSection>

            <SubSection title="Consent" colors={colors}>
              <Text style={styles.paragraph}>
                By using the recording feature, you confirm that you have obtained any necessary consent from others present in the recorded environment, in accordance with applicable laws.
              </Text>
            </SubSection>
          </Section>

          <Section title="5. Third-Party Services" colors={colors}>
            <Text style={styles.paragraph}>
              We use the following third-party services to provide our platform:
            </Text>

            <Card style={styles.serviceCard}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>Supabase</Text>
                <Text style={styles.serviceUse}>Authentication & Database</Text>
              </View>
            </Card>

            <Card style={styles.serviceCard}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>Cloudinary</Text>
                <Text style={styles.serviceUse}>File Storage</Text>
              </View>
            </Card>

            <Card style={styles.serviceCard}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>OpenAI Whisper</Text>
                <Text style={styles.serviceUse}>Audio Transcription</Text>
              </View>
            </Card>

            <Card style={styles.serviceCard}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>Anthropic Claude</Text>
                <Text style={styles.serviceUse}>AI Processing</Text>
              </View>
            </Card>

            <Text style={styles.paragraph}>
              Each service has its own privacy policy. Your data may be processed according to their terms.
            </Text>
          </Section>

          <Section title="6. Data Storage and Security" colors={colors}>
            <BulletPoint text="Your data is stored securely using industry-standard encryption" colors={colors} />
            <BulletPoint text="Lecture recordings are stored in secure cloud storage" colors={colors} />
            <BulletPoint text="We use HTTPS for all data transmission" colors={colors} />
            <BulletPoint text="Access to user data is restricted to authorized personnel only" colors={colors} />
          </Section>

          <Section title="7. Your Rights" colors={colors}>
            <Text style={styles.paragraph}>
              You have the following rights regarding your data:
            </Text>
            <BulletPoint text="Access: Request a copy of your personal data" colors={colors} />
            <BulletPoint text="Correction: Request correction of inaccurate data" colors={colors} />
            <BulletPoint text="Deletion: Request deletion of your account and data" colors={colors} />
            <BulletPoint text="Export: Download your data in a portable format" colors={colors} />
            <BulletPoint text="Opt-out: Unsubscribe from marketing communications" colors={colors} />
          </Section>

          <Section title="8. Data Retention" colors={colors}>
            <Text style={styles.paragraph}>
              We retain your data for as long as your account is active. When you delete your account:
            </Text>
            <BulletPoint text="Personal information is deleted within 30 days" colors={colors} />
            <BulletPoint text="Lecture recordings are permanently deleted" colors={colors} />
            <BulletPoint text="Some anonymized usage data may be retained for analytics" colors={colors} />
          </Section>

          <Section title="9. Children's Privacy" colors={colors}>
            <Text style={styles.paragraph}>
              Vectra is intended for users aged 16 and above. We do not knowingly collect personal information from children under 16.
            </Text>
          </Section>

          <Section title="10. Changes to This Policy" colors={colors}>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email.
            </Text>
          </Section>

          <Section title="11. Contact Us" colors={colors}>
            <Text style={styles.paragraph}>
              For privacy-related questions or to exercise your rights, contact us at:
            </Text>
            <Text style={styles.contactEmail}>privacy@vectra.app</Text>
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

function SubSection({ title, children, colors }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>{title}</Text>
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
    marginBottom: 16,
    ...FONTS.regular,
  },
  intro: {
    fontSize: SIZES.base,
    color: colors.text.secondary,
    lineHeight: 24,
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
  subSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  paragraph: {
    fontSize: SIZES.base,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 12,
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
  serviceCard: {
    marginBottom: 8,
    padding: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  serviceUse: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
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
