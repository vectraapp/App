import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { code: initialCode } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) { setError('Please enter an invite code'); return; }
    setError('');
    setLoading(true);
    try {
      const response = await api.joinGroupByCode(code.trim());
      if (response.success && response.data?.id) {
        router.replace({
          pathname: '/groups/[id]',
          params: { id: response.data.id, name: response.data.name },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to join group. Check your invite code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join a Group</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="link" size={32} color={colors.brand.secondary} />
          </View>

          <Text style={styles.title}>Enter Invite Code</Text>
          <Text style={styles.subtitle}>
            Ask your classmate for the group invite code to join their study group.
          </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="e.g. A3F2B1C9"
            placeholderTextColor={colors.text.muted}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={12}
            autoFocus
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.joinBtn, loading && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Feather name="log-in" size={18} color={colors.white} />
                <Text style={styles.joinBtnText}>Join Group</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
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
  headerTitle: { fontSize: SIZES.xl, color: colors.text.primary, ...FONTS.bold },
  content: { flex: 1, padding: SIZES.padding * 1.5, alignItems: 'center', paddingTop: 40 },
  iconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: SIZES.xl, color: colors.text.primary, ...FONTS.bold, marginBottom: 8 },
  subtitle: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    ...FONTS.regular,
  },
  codeInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 22,
    color: colors.text.primary,
    width: '100%',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 12,
    ...FONTS.bold,
  },
  errorText: {
    color: colors.brand.error,
    fontSize: SIZES.sm,
    marginBottom: 12,
    ...FONTS.regular,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 15,
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: colors.white, fontSize: SIZES.base, ...FONTS.semibold },
});
