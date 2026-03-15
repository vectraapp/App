import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function MySharesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const response = await api.getMyShares();
      const mapped = (response.data || []).map(share => ({
        id: share.id,
        lectureTitle: share.resource_metadata?.topic || share.resource_metadata?.name || share.code_type,
        course: share.resource_metadata?.courseCode || share.resource_metadata?.course_code || '',
        code: share.code,
        createdAt: new Date(share.created_at),
        expiresAt: share.expires_at ? new Date(share.expires_at) : null,
        redeemCount: share.current_uses || 0,
        isActive: share.is_active,
      }));
      setShares(mapped);
    } catch (error) {
      console.log('Error loading shares:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadShares();
  };

  const handleCopyCode = async (code) => {
    await Clipboard.setStringAsync(code);
  };

  const handleRevokeShare = (shareId) => {
    Alert.alert(
      'Revoke Share',
      'Are you sure you want to revoke this share? Anyone who has redeemed the code will lose access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const share = shares.find(s => s.id === shareId);
              if (share) {
                await api.deactivateShareCode(share.code);
                setShares(prev => prev.filter(s => s.id !== shareId));
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to revoke share');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const diff = new Date(expiresAt) - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderItem = ({ item }) => {
    const daysRemaining = item.expiresAt ? getDaysRemaining(item.expiresAt) : null;
    const isExpired = !item.isActive || (daysRemaining !== null && daysRemaining <= 0);

    return (
      <Card style={styles.shareCard}>
        <View style={styles.shareHeader}>
          <View style={[
            styles.statusBadge,
            isExpired ? styles.statusBadgeExpired : styles.statusBadgeActive,
          ]}>
            <View style={[
              styles.statusDot,
              isExpired ? styles.statusDotExpired : styles.statusDotActive,
            ]} />
            <Text style={[
              styles.statusText,
              isExpired ? styles.statusTextExpired : styles.statusTextActive,
            ]}>
              {isExpired ? 'Expired' : 'Active'}
            </Text>
          </View>

          {!isExpired && (
            <TouchableOpacity
              style={styles.revokeBtn}
              onPress={() => handleRevokeShare(item.id)}
            >
              <Feather name="x" size={16} color={colors.brand.error} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.lectureTitle} numberOfLines={1}>
          {item.lectureTitle}
        </Text>
        <Text style={styles.courseName} numberOfLines={1}>
          {item.course}
        </Text>

        <View style={styles.codeContainer}>
          <Text style={[
            styles.codeText,
            isExpired && styles.codeTextExpired,
          ]}>
            {item.code}
          </Text>
          {!isExpired && (
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => handleCopyCode(item.code)}
            >
              <Feather name="copy" size={16} color={colors.brand.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.shareStats}>
          <View style={styles.statItem}>
            <Feather name="users" size={14} color={colors.text.muted} />
            <Text style={styles.statText}>
              {item.redeemCount} {item.redeemCount === 1 ? 'redeem' : 'redeems'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Feather name="calendar" size={14} color={colors.text.muted} />
            <Text style={styles.statText}>
              Created {formatDate(item.createdAt)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Feather
              name="clock"
              size={14}
              color={isExpired ? colors.brand.error : colors.text.muted}
            />
            <Text style={[
              styles.statText,
              isExpired && styles.statTextExpired,
            ]}>
              {isExpired
                ? (item.expiresAt ? `Expired ${formatDate(item.expiresAt)}` : 'Inactive')
                : (daysRemaining !== null ? `${daysRemaining} days left` : 'No expiry')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Feather name="share-2" size={48} color={colors.text.muted} />
      </View>
      <Text style={styles.emptyTitle}>No Shares Yet</Text>
      <Text style={styles.emptyText}>
        When you share lectures with others, they will appear here so you can manage them.
      </Text>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Shares</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : (
          <FlatList
            data={shares}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              shares.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.brand.primary}
              />
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SIZES.padding,
    gap: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  shareCard: {
    padding: SIZES.padding,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: colors.tint.accent,
  },
  statusBadgeExpired: {
    backgroundColor: colors.tint.error,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: colors.brand.accent,
  },
  statusDotExpired: {
    backgroundColor: colors.brand.error,
  },
  statusText: {
    fontSize: SIZES.xs,
    ...FONTS.semibold,
  },
  statusTextActive: {
    color: colors.brand.accent,
  },
  statusTextExpired: {
    color: colors.brand.error,
  },
  revokeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tint.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lectureTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 2,
    ...FONTS.semibold,
  },
  courseName: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 14,
    ...FONTS.regular,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radiusSm,
    padding: 12,
    marginBottom: 14,
  },
  codeText: {
    fontSize: SIZES.xl,
    color: colors.brand.secondary,
    letterSpacing: 4,
    ...FONTS.bold,
  },
  codeTextExpired: {
    color: colors.text.inactive,
  },
  copyBtn: {
    padding: 6,
  },
  shareStats: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  statTextExpired: {
    color: colors.brand.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.bold,
  },
  emptyText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    ...FONTS.regular,
  },
});
